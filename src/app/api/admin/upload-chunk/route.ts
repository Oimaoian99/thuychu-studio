import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function PUT(req: Request) {
  try {
    const uploadUrl = req.headers.get('x-upload-url');
    const contentRange = req.headers.get('x-content-range');
    
    if (!uploadUrl || !contentRange) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    const authClient = await (drive as any).context._options.auth.getClient();
    const token = await authClient.getAccessToken();

    const chunk = await req.arrayBuffer();
    
    const driveRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Length': chunk.byteLength.toString(),
        'Content-Range': contentRange
      },
      body: chunk
    });
    
    if (driveRes.status === 308) {
      return NextResponse.json({ success: true, status: 'incomplete' });
    }
    
    if (driveRes.status === 200 || driveRes.status === 201) {
      const data = await driveRes.json();
      return NextResponse.json({ success: true, status: 'complete', data });
    }
    
    const errorText = await driveRes.text();
    console.error("Chunk upload error from Google:", errorText);
    return NextResponse.json({ error: `Lỗi Server: ${driveRes.status} - ${errorText}` }, { status: driveRes.status });
  } catch (error: any) {
    console.error("Upload chunk error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
