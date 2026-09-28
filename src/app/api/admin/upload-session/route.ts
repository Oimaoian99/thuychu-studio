import { NextResponse } from 'next/server';
import { getAccessToken, driveListFiles } from '@/lib/drive';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { file, clientId, type } = await req.json();

    if (!file || !clientId || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const token = await getAccessToken();

    if (!token) {
      throw new Error("Không thể lấy token xác thực Google Drive");
    }

    const { data: client, error } = await getSupabase().from('clients').select('*').eq('id', clientId).single();
    if (error || !client) throw new Error("Khách hàng không tồn tại");

    let parentId = client.drive_folder_id;
    if (type === 'GOC' || type === 'SUA') {
      const folders = await driveListFiles(`'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${type}' and trashed = false`, 'files(id)');
      if (folders && folders.length > 0) {
        parentId = folders[0].id;
      }
    }

    const requestOrigin = req.headers.get('origin') || 'https://thuychustudio.id.vn';
    
    const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': file.type,
        'X-Upload-Content-Length': file.size.toString(),
        'Origin': requestOrigin
      },
      body: JSON.stringify({
        name: file.name,
        parents: [parentId]
      })
    });

    if (!initRes.ok) {
      const errorText = await initRes.text();
      console.error("Google Drive API Error:", errorText);
      throw new Error("Lỗi khi xin quyền upload từ Google: " + initRes.statusText);
    }

    const uploadUrl = initRes.headers.get('location');
    if (!uploadUrl) {
      throw new Error("Không lấy được URL upload (Location header bị thiếu)");
    }

    const urlObj = new URL(uploadUrl);
    const uploadId = urlObj.searchParams.get('upload_id');

    return NextResponse.json({ success: true, uploadId });
  } catch (error: any) {
    console.error("Lỗi cấp upload session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
