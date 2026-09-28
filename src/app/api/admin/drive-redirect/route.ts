import { NextResponse } from 'next/server';
import { driveListFiles } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');
    const type = searchParams.get('type');

    if (!folderId) {
      return NextResponse.json({ error: 'Missing folderId' }, { status: 400 });
    }

    if (type === 'GOC' || type === 'SUA') {
      const subfolders = await driveListFiles(`'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${type}' and trashed = false`, 'files(id)');
      const targetFolder = subfolders?.[0];
      
      if (targetFolder) {
        return NextResponse.redirect(`https://drive.google.com/drive/folders/` + targetFolder.id);
      } else {
        return NextResponse.redirect(`https://drive.google.com/drive/folders/` + folderId);
      }
    }
    
    return NextResponse.redirect(`https://drive.google.com/drive/folders/` + folderId);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
