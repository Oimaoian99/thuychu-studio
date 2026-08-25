import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Thiếu mã khách hàng' }, { status: 400 });
    }

    // 1. Tạo thư mục trên Google Drive
    const folderMetadata = {
      name: code, // Tên thư mục là mã khách hàng
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!],
    };

    const driveRes = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    const folderId = driveRes.data.id;

    if (!folderId) throw new Error("Không thể tạo thư mục Drive");

    // 2. Lưu thông tin vào Supabase
    const { data, error } = await supabase
      .from('clients')
      .insert([{ code, drive_folder_id: folderId }])
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
