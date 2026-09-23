import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const uploadUrl = req.headers.get('x-upload-url');
    const contentRange = req.headers.get('x-content-range');
    
    if (!uploadUrl || !contentRange) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    const chunk = await req.arrayBuffer();
    
    const driveRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
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
    return NextResponse.json({ error: 'Chunk upload failed: ' + driveRes.status }, { status: driveRes.status });
  } catch (error: any) {
    console.error("Upload chunk error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
