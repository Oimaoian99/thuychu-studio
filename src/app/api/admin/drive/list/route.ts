import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const type = searchParams.get('type');
    const exactFolderId = searchParams.get('exactFolderId');

    let targetFolderId = exactFolderId;

    if (!targetFolderId) {
      if (!parentId || !type) {
        return NextResponse.json({ error: 'Missing parentId/type or exactFolderId' }, { status: 400 });
      }

      // 1. Tìm thư mục con (GOC hoặc SUA)
      const folderRes = await drive.files.list({
        q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${type}' and trashed = false`,
        fields: 'files(id)',
      });

      const folders = folderRes.data.files || [];
      if (folders.length === 0) {
        return NextResponse.json({ success: true, files: [] }); // Thư mục rỗng hoặc chưa tạo
      }
      targetFolderId = folders[0].id as string;
    }

    // 2. Lấy danh sách file trong thư mục đó
    const filesRes = await drive.files.list({
      q: `'${targetFolderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 1000,
      orderBy: 'createdTime desc'
    });

    return NextResponse.json({ success: true, folderId: targetFolderId, files: filesRes.data.files || [] });
  } catch (error: any) {
    console.error("List files error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
