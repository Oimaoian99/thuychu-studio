import { NextResponse } from 'next/server';
import { driveListFiles } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const exactFolderId = searchParams.get('exactFolderId');
    const parentId = searchParams.get('parentId');
    const type = searchParams.get('type');

    if (!exactFolderId && (!parentId || !type)) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    let targetFolderId = exactFolderId;

    if (!targetFolderId) {
      if (type === 'GOC' || type === 'SUA') {
        const folders = await driveListFiles(`'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${type}' and trashed = false`, 'files(id)');
        if (folders && folders.length > 0) {
          targetFolderId = folders[0].id;
        } else {
          return NextResponse.json({ success: true, files: [] });
        }
      } else {
        targetFolderId = parentId;
      }
    }

    // Get thumbnailLink and webContentLink so we can bypass proxying!
    const files = await driveListFiles(`'${targetFolderId}' in parents and trashed = false`, 'files(id, name, mimeType, thumbnailLink, webContentLink)');
    
    // Sort files by name naturally
    files.sort((a: any, b: any) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    return NextResponse.json({ success: true, files, folderId: targetFolderId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
