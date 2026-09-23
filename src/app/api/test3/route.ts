import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const auth: any = drive.context._options.auth;
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    // Thay folderId này bằng thư mục GOC thực tế (ví dụ thư mục con nào đó)
    // Hoặc thử root folder của Service Account nếu không biết: 'root'
    const targetFolderId = '1xNH3ExP_k02sd4hgO1ssrY1FXx4lotvW'; 

    const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        name: 'test_file.txt',
        parents: [targetFolderId] 
      })
    });

    if (!initRes.ok) {
      return NextResponse.json({ error: "Init failed", details: await initRes.text() });
    }

    const uploadUrl = initRes.headers.get('Location');
    
    // 2. Upload chunk
    const chunkText = "Hello world, this is a test chunk.";
    const chunk = new TextEncoder().encode(chunkText);
    const contentRange = `bytes 0-${chunk.length - 1}/${chunk.length}`;

    const driveRes = await fetch(uploadUrl!, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Length': chunk.length.toString(),
        'Content-Range': contentRange
      },
      body: chunk
    });

    return NextResponse.json({ 
      status: driveRes.status, 
      text: await driveRes.text() 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
