export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { driveListFiles } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const parentId = '15YYjGbSGB7_QVRFbffDY25HPuQMJ7Chx';
    const type = 'GOC';
    const q1 = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${type}' and trashed = false`;
    const folders = await driveListFiles(q1, 'files(id)');
    
    let targetFolderId = null;
    let files = [];
    if (folders && folders.length > 0) {
      targetFolderId = folders[0].id;
      const q2 = `'${targetFolderId}' in parents and trashed = false`;
      files = await driveListFiles(q2, 'files(id, name, mimeType)');
    }
    
    return NextResponse.json({ success: true, q1, folders, targetFolderId, files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
