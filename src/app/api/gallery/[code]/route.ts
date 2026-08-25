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
      .select('id, drive_folder_id')
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

    const formatImage = (file: any) => {
      let url = file.thumbnailLink || '';
      if (url) url = url.replace(/=s\d+/, '=w1080');
      return { id: file.id, name: file.name, url: url, downloadUrl: file.webContentLink };
    };

    let rawFiles: any[] = [];
    let editedFiles: any[] = [];

    // 3. Lấy ảnh từ thư mục GOC (Nếu có thư mục con, nếu không lấy ở thư mục gốc)
    const rawTargetId = gocFolder ? gocFolder.id : client.drive_folder_id;
    const rawDriveRes = await drive.files.list({
      q: `'${rawTargetId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, thumbnailLink, webContentLink)',
      pageSize: 500,
    });
    rawFiles = rawDriveRes.data.files?.map(formatImage) || [];

    // 4. Lấy ảnh từ thư mục SUA (nếu có)
    if (suaFolder) {
      const suaDriveRes = await drive.files.list({
        q: `'${suaFolder.id}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: 'files(id, name, thumbnailLink, webContentLink)',
        pageSize: 500,
      });
      editedFiles = suaDriveRes.data.files?.map(formatImage) || [];
    }

    // 3. Lấy những ảnh đã được khách hàng chọn từ trước (nếu có)
    const { data: selectedImages } = await supabase
      .from('selected_images')
      .select('image_drive_id')
      .eq('client_id', client.id);

    const selectedIds = selectedImages?.map(img => img.image_drive_id) || [];

    return NextResponse.json({ success: true, rawFiles, editedFiles, clientId: client.id, selectedIds });
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
