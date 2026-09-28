import { NextResponse } from 'next/server';
import { driveCreateFolder } from '@/lib/drive';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { code, max_selections } = await req.json();
    if (!code) return NextResponse.json({ error: 'Thiếu mã khách hàng' }, { status: 400 });

    const rootFolderId = await driveCreateFolder(code, [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!]);
    if (!rootFolderId) throw new Error("Không thể tạo thư mục Drive");

    await driveCreateFolder('GOC', [rootFolderId]);
    await driveCreateFolder('SUA', [rootFolderId]);

    const { data, error } = await getSupabase()
      .from('clients')
      .insert([{ code, drive_folder_id: rootFolderId, max_selections: max_selections || 5 }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Lỗi API tạo khách hàng:", error);
    return NextResponse.json({ error: error.message || "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await getSupabase().from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
