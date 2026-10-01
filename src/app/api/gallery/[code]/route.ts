export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { driveListFiles } from '@/lib/drive';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;
    const decodedCode = decodeURIComponent(code).toUpperCase();

    const { data: client, error } = await getSupabase()
      .from('clients')
      .select('id, drive_folder_id, max_selections')
      .eq('code', decodedCode)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'MÃ£ khÃ¡ch hÃ ng khÃ´ng tá»“n táº¡i' }, { status: 404 });
    }

    const subfolders = await driveListFiles(`'${client.drive_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`, 'files(id, name)');
    
    const gocFolder = subfolders?.find((f: any) => f.name?.toUpperCase().includes('GOC'));
    const suaFolder = subfolders?.find((f: any) => f.name?.toUpperCase().includes('SUA'));

    const formatImage = (file: any, folderName?: string) => {
      let url = file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=w2048') : `/api/drive/thumbnail?id=${file.id}`;
      return { 
        id: file.id, 
        name: file.name, 
        url: url, 
        downloadUrl: file.webContentLink,
        mimeType: file.mimeType || '',
        folderName: folderName || null
      };
    };

    const fetchImagesAndSubfolders = async (parentId: string) => {
      const files = await driveListFiles(`'${parentId}' in parents and trashed = false`, 'files(id, name, mimeType, webContentLink, thumbnailLink)');
      
      const directFiles = files.filter((f: any) => f.mimeType?.includes('image/') || f.mimeType?.includes('video/'));
      const subfolders = files.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
      
      let allFiles = directFiles.map((f: any) => formatImage(f, undefined));
      
      if (subfolders.length > 0) {
        const subfolderPromises = subfolders.map(async (folder: any) => {
          const subRes = await driveListFiles(`'${folder.id}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`, 'files(id, name, mimeType, webContentLink, thumbnailLink)');
          return (subRes || []).map((f: any) => formatImage(f, folder.name || undefined));
        });
        
        const subfolderFilesArrays = await Promise.all(subfolderPromises);
        for (const subArray of subfolderFilesArrays) {
          allFiles = allFiles.concat(subArray);
        }
      }
      return allFiles;
    };

    let rawFiles: any[] = [];
    let editedFiles: any[] = [];

    const rawTargetId = gocFolder ? (gocFolder.id as string) : (client.drive_folder_id as string);
    rawFiles = await fetchImagesAndSubfolders(rawTargetId);

    if (suaFolder && suaFolder.id) {
      editedFiles = await fetchImagesAndSubfolders(suaFolder.id);
    }

    const { data: selectedImages } = await getSupabase()
      .from('selected_images')
      .select('image_drive_id')
      .eq('client_id', client.id);

    const selectedIds = selectedImages?.map(img => img.image_drive_id) || [];

    const response = NextResponse.json({ 
      success: true, 
      rawFiles, 
      editedFiles, 
      clientId: client.id, 
      selectedIds,
      maxSelections: client.max_selections || 5
    });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;
    const { clientId, selectedImages } = await req.json();

    if (!clientId || !selectedImages) {
      return NextResponse.json({ error: 'Dá»¯ liá»‡u khÃ´ng há»£p lá»‡' }, { status: 400 });
    }

    await getSupabase().from('selected_images').delete().eq('client_id', clientId);

    if (selectedImages.length > 0) {
      const insertData = selectedImages.map((img: any) => ({
        client_id: clientId,
        image_drive_id: img.id,
        image_name: img.name,
      }));

      const { error } = await getSupabase().from('selected_images').insert(insertData);
      if (error) throw error;
    }

    const response = NextResponse.json({ success: true });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


