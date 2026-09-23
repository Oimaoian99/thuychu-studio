import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;
    const decodedCode = decodeURIComponent(code).toUpperCase();

    // 1. Tìm thông tin khách hàng từ Database
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, drive_folder_id, max_selections')
      .eq('code', decodedCode)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Mã khách hàng không tồn tại' }, { status: 404 });
    }

    // 2. Lấy danh sách các thư mục con (GOC và SUA)
    const subfoldersRes = await drive.files.list({
      q: `'${client.drive_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });
    
    const gocFolder = subfoldersRes.data.files?.find(f => f.name?.toUpperCase().includes('GOC'));
    const suaFolder = subfoldersRes.data.files?.find(f => f.name?.toUpperCase().includes('SUA'));

    const formatImage = (file: any, folderName?: string) => {
      let url = `/api/drive/thumbnail?id=${file.id}`;
      return { 
        id: file.id, 
        name: file.name, 
        url: url, 
        downloadUrl: file.webContentLink,
        mimeType: file.mimeType || '',
        folderName: folderName || null
      };
    };

    // Hàm hỗ trợ lấy ảnh trong thư mục hiện tại + 1 cấp thư mục con
    const fetchImagesAndSubfolders = async (parentId: string) => {
      const res = await drive.files.list({
        q: `'${parentId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, webContentLink, thumbnailLink)',
        pageSize: 1000,
      });
      
      const files = res.data.files || [];
      const directFiles = files.filter(f => f.mimeType?.includes('image/') || f.mimeType?.includes('video/'));
      const subfolders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
      
      let allFiles = directFiles.map(f => formatImage(f, undefined));
      
      // Lấy thêm ảnh từ các thư mục con (chạy song song cho nhanh)
      if (subfolders.length > 0) {
        const subfolderPromises = subfolders.map(async (folder) => {
          const subRes = await drive.files.list({
            q: `'${folder.id}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
            fields: 'files(id, name, mimeType, webContentLink, thumbnailLink)',
            pageSize: 1000,
          });
          return (subRes.data.files || []).map(f => formatImage(f, folder.name || undefined));
        });
        
        const subfolderFilesArrays = await Promise.all(subfolderPromises);
        for (const subArray of subfolderFilesArrays) {
          allFiles = allFiles.concat(subArray);
        }
      }
      return allFiles;
    };

    let rawFiles: any[] = [];
    let editedFiles: any[] = [];

    // 3. Lấy ảnh và video từ thư mục GOC (bao gồm cả thư mục con)
    const rawTargetId = gocFolder ? (gocFolder.id as string) : (client.drive_folder_id as string);
    rawFiles = await fetchImagesAndSubfolders(rawTargetId);

    // 4. Lấy ảnh và video từ thư mục SUA (nếu có)
    if (suaFolder && suaFolder.id) {
      editedFiles = await fetchImagesAndSubfolders(suaFolder.id);
    }

    // 3. Lấy những ảnh đã được khách hàng chọn từ trước (nếu có)
    const { data: selectedImages } = await supabase
      .from('selected_images')
      .select('image_drive_id')
      .eq('client_id', client.id);

    const selectedIds = selectedImages?.map(img => img.image_drive_id) || [];

    return NextResponse.json({ 
      success: true, 
      rawFiles, 
      editedFiles, 
      clientId: client.id, 
      selectedIds,
      maxSelections: client.max_selections || 5 // Mặc định là 5 nếu chưa cài đặt
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// API xử lý việc lưu những ảnh khách hàng VỪA BẤM CHỌN
export async function POST(req: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;
    const { clientId, selectedImages } = await req.json(); // selectedImages là mảng { id, name }

    if (!clientId || !selectedImages) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    // Để đơn giản: Xóa các lựa chọn cũ của client này và lưu lại danh sách mới
    await supabase.from('selected_images').delete().eq('client_id', clientId);

    if (selectedImages.length > 0) {
      const insertData = selectedImages.map((img: any) => ({
        client_id: clientId,
        image_drive_id: img.id,
        image_name: img.name,
      }));

      const { error } = await supabase.from('selected_images').insert(insertData);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
