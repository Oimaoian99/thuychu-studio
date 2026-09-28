import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const w = searchParams.get('w') || '600';

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

    const token = await getAccessToken();

    // Lấy thumbnailLink bằng native fetch
    const metadataRes = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=thumbnailLink`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const metadata = await metadataRes.json();
    const thumbnailUrl = metadata.thumbnailLink?.replace(/=s\d+/, `=w${w}`);

    if (!thumbnailUrl) {
      return NextResponse.json({ error: 'No thumbnail' }, { status: 404 });
    }

    const response = await fetch(thumbnailUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Cache-Control', 'public, max-age=86400'); // Cache 1 ngày

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Thumbnail proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
