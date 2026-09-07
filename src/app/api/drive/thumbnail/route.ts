import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const w = searchParams.get('w') || '600';

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

    // Lấy thông tin file bao gồm thumbnailLink
    const fileRes = await drive.files.get({ fileId: id, fields: 'thumbnailLink' });
    const thumbnailUrl = fileRes.data.thumbnailLink?.replace(/=s\d+/, `=w${w}`);

    if (!thumbnailUrl) {
      return NextResponse.json({ error: 'No thumbnail' }, { status: 404 });
    }

    // Fetch the thumbnail using the server
    const auth: any = drive.context._options.auth;
    const token = await auth.getAccessToken();

    const response = await fetch(thumbnailUrl, {
      headers: {
        Authorization: `Bearer ${token}` // Có thể cần hoặc không cần
      }
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
