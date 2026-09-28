import { NextResponse } from 'next/server';
import { driveListFiles } from '@/lib/drive';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;

    const { data: client, error } = await getSupabase()
      .from('clients')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });
    }

    const subfolders = await driveListFiles(`'${client.drive_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`, 'files(id, name)');

    let gocFolderId = '';
    let suaFolderId = '';
    subfolders.forEach((folder: any) => {
      if (folder.name.toUpperCase() === 'GOC') gocFolderId = folder.id;
      if (folder.name.toUpperCase() === 'SUA') suaFolderId = folder.id;
    });

    const fetchImagesAndSubfolders = async (parentId: string) => {
      const res = await driveListFiles(`'${parentId}' in parents and trashed = false`, 'files(id, name, mimeType, webContentLink, thumbnailLink)');
      
      const files = res.filter((f: any) => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/'));
      const subfolders = res.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');

      if (subfolders.length > 0) {
        const subfolderPromises = subfolders.map(async (folder: any) => {
          const subRes = await driveListFiles(`'${folder.id}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`, 'files(id, name, mimeType, webContentLink, thumbnailLink)');
          return subRes.map((f: any) => ({ ...f, folderName: folder.name }));
        });
        const subfolderFilesArrays = await Promise.all(subfolderPromises);
        const subfolderFiles = subfolderFilesArrays.flat();
        files.push(...subfolderFiles);
      }

      return files.sort((a: any, b: any) => a.name.localeCompare(b.name));
    };

    const [gocImages, suaImages] = await Promise.all([
      gocFolderId ? fetchImagesAndSubfolders(gocFolderId) : Promise.resolve([]),
      suaFolderId ? fetchImagesAndSubfolders(suaFolderId) : Promise.resolve([])
    ]);

    return NextResponse.json({
      success: true,
      client,
      gocImages,
      suaImages
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
