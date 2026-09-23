import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function POST(req: Request) {
  try {
    const { name, mimeType, parentId, type, exactFolderId, origin } = await req.json();

    if (!name || (!exactFolderId && (!parentId || !type))) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Lấy Access Token từ cấu hình Google Auth
    const authClient = await (drive as any).context._options.auth.getClient();
    const token = await authClient.getAccessToken();

    if (!token.token) {
      throw new Error("Không thể lấy token xác thực từ Google.");
    }

    let targetFolderId = exactFolderId;

    if (!targetFolderId) {
      // 1. Tìm thư mục con (GOC hoặc SUA) bên trong parentId
      const folderRes = await drive.files.list({
        q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${type}' and trashed = false`,
        fields: 'files(id)',
      });

      const folders = folderRes.data.files || [];
      if (folders.length === 0) {
        throw new Error(`Không tìm thấy thư mục ${type} bên trong thư mục khách hàng.`);
      }
      targetFolderId = folders[0].id;
    }

    // 2. Gọi Google Drive API v3 để tạo Resumable Upload Session
    const requestOrigin = origin || req.headers.get('origin') || 'https://thuychustudio.com';
    
    const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': mimeType || 'application/octet-stream',
        'Origin': requestOrigin
      },
      body: JSON.stringify({
        name,
        parents: [targetFolderId]
      })
    });
    
    // Nếu tạo session thành công, Google sẽ trả về 200 OK cùng header 'Location' chứa URL để up file
    if (!initRes.ok) {
      const errorText = await initRes.text();
      console.error("Google Drive API Error:", errorText);
      throw new Error("Lỗi khi xin quyền upload từ Google: " + initRes.statusText);
    }

    const location = initRes.headers.get('Location');
    if (!location) {
      throw new Error("Google không trả về đường dẫn upload hợp lệ.");
    }

    return NextResponse.json({ success: true, uploadUrl: location });
  } catch (error: any) {
    console.error("Upload Session Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
