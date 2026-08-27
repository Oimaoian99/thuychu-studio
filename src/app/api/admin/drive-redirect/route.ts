import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');
    const type = searchParams.get('type'); // 'GOC' hoặc 'SUA'

    if (!folderId || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Tìm thư mục con GOC hoặc SUA trong thư mục của khách hàng
    const subfoldersRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name contains '${type}' and trashed = false`,
      fields: 'files(id, name)',
    });

    const targetFolder = subfoldersRes.data.files?.[0];
    
    if (targetFolder) {
      return NextResponse.redirect(`https://drive.google.com/drive/folders/${targetFolder.id}`);
    } else {
      // Nếu không tìm thấy (lỡ bị xóa), mở thư mục gốc
      return NextResponse.redirect(`https://drive.google.com/drive/folders/${folderId}`);
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
