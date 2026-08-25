import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';
import { supabase } from '@/lib/supabase';
import { Readable } from 'stream';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: clientId } = await context.params;
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Không có file nào được tải lên' }, { status: 400 });
    }

    // Lấy Drive Folder ID của khách hàng
    const { data: client, error } = await supabase
      .from('clients')
      .select('drive_folder_id')
      .eq('id', clientId)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });
    }

    const uploadedIds = [];

    // Tải từng file lên Google Drive
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = Readable.from(buffer);

      const driveRes = await drive.files.create({
        requestBody: {
          name: file.name,
          parents: [client.drive_folder_id],
        },
        media: {
          mimeType: file.type,
          body: stream,
        },
      });

      uploadedIds.push(driveRes.data.id);
    }

    return NextResponse.json({ success: true, uploadedIds });
  } catch (error: any) {
    console.error("Lỗi upload:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
