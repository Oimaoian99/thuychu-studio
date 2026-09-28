import { NextResponse } from 'next/server';
import { driveListFiles } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const type = searchParams.get('type');

    if (!parentId || !type) {
      return NextResponse.json({ error: 'Missing parentId or type' }, { status: 400 });
    }

    let targetFolderId = parentId;
    if (type === 'GOC' || type === 'SUA') {
      const folders = await driveListFiles('' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '' and trashed = false, 'files(id)');
      if (folders && folders.length > 0) {
        targetFolderId = folders[0].id;
      }
    }

    const files = await driveListFiles('' in parents and trashed = false, 'files(id, name, mimeType)');
    
    // Sort files by name naturally
    files.sort((a: any, b: any) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
