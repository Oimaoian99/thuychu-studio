import { NextResponse } from 'next/server';
import { getAccessToken, driveListFiles } from '@/lib/drive';

export async function POST(req: Request) {
  try {
    const { name, mimeType, parentId, type, exactFolderId, origin } = await req.json();

    if (!name || (!exactFolderId && (!parentId || !type))) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const token = await getAccessToken();

    if (!token) {
      throw new Error("Không thể lấy token xác thực từ Google.");
    }

    let targetFolderId = exactFolderId;

    if (!targetFolderId) {
      const folderRes = await driveListFiles(`'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${type}' and trashed = false`, 'files(id)');

      const folders = folderRes || [];
      if (folders.length === 0) {
        throw new Error(`Không tìm thấy thư mục ${type} bên trong thư mục khách hàng.`);
      }
      targetFolderId = folders[0].id;
    }

    const requestOrigin = origin || req.headers.get('origin') || 'https://thuychustudio.id.vn';
    
    const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': mimeType || 'application/octet-stream',
        'Origin': requestOrigin
      },
      body: JSON.stringify({
        name,
        parents: [targetFolderId]
      })
    });
    
    if (!initRes.ok) {
      const errorText = await initRes.text();
      console.error("Google Drive API Error:", errorText);
      throw new Error("Lỗi khi xin quyền upload từ Google: " + initRes.statusText);
    }

    const location = initRes.headers.get('Location');
    if (!location) {
      throw new Error("Google không trả về đường dẫn upload hợp lệ.");
    }
    
    const url = new URL(location);
    const uploadId = url.searchParams.get('upload_id');

    return NextResponse.json({ 
      success: true, 
      uploadUrl: location,
      uploadId: uploadId,
      token: token 
    });
  } catch (error: any) {
    console.error("Upload Session Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
