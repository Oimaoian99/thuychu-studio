import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/drive';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uploadId = searchParams.get('upload_id');
    const range = req.headers.get('content-range');

    if (!uploadId || !range) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=${uploadId}`;

    const token = await getAccessToken();
    const chunk = await req.arrayBuffer();

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Range': range,
        'Content-Length': chunk.byteLength.toString(),
      },
      body: chunk
    });

    if (response.status === 308) {
      return new Response(null, { status: 308, headers: { 'Range': response.headers.get('Range') || '' } });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Lỗi chunk proxy:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
