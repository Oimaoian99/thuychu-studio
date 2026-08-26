import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // CHỐNG LƯU CACHE CỦA VERCEL

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Thiếu mã khách hàng' }, { status: 400 });
    }

    // 1. Tạo thư mục Gốc trên Google Drive (Ví dụ: KHACH-01)
    const rootMetadata = {
      name: code,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!],
    };
    const rootDriveRes = await drive.files.create({ requestBody: rootMetadata, fields: 'id' });
    const rootFolderId = rootDriveRes.data.id;

    if (!rootFolderId) throw new Error("Không thể tạo thư mục Drive");

    // 2. Tạo 2 thư mục con (GOC và SUA) nằm bên trong thư mục Gốc
    await drive.files.create({
      requestBody: { name: 'GOC', mimeType: 'application/vnd.google-apps.folder', parents: [rootFolderId] }
    });
    
    await drive.files.create({
      requestBody: { name: 'SUA', mimeType: 'application/vnd.google-apps.folder', parents: [rootFolderId] }
    });

    // 3. Lưu thông tin thư mục Gốc vào Supabase (Không cần thay đổi Database)
    const { data, error } = await supabase
      .from('clients')
      .insert([{ code, drive_folder_id: rootFolderId }])
      .select()
      .single();

    if (error) {
      // Nếu lỗi DB, nên xóa thư mục Drive vừa tạo (Rollback) - để đơn giản ta tạm bỏ qua ở đây
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Lỗi API tạo khách hàng:", error);
    return NextResponse.json({ error: error.message || "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
