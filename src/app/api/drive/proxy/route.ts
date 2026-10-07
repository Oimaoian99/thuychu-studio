import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name') || 'file';
    const action = searchParams.get('action') || 'download';

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

    const token = await getAccessToken();

    const rangeHeader = req.headers.get('range');
    const fetchHeaders: any = {
      Authorization: `Bearer ${token}`
    };
    if (rangeHeader) {
      fetchHeaders.Range = rangeHeader;
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
      headers: fetchHeaders
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Accept-Ranges', 'bytes');
    
    // Cloudflare / Vercel strips Content-Length during streaming.
    // We must pass the exact size in a custom header to detect truncated downloads on the client.
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('X-Expected-Size', contentLength);
      responseHeaders.set('Access-Control-Expose-Headers', 'X-Expected-Size');
    }

    if (action === 'download') {
      responseHeaders.set('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`);
      responseHeaders.set('Content-Type', 'application/octet-stream'); // Force download
    } else {
      responseHeaders.set('Content-Disposition', `inline; filename="${encodeURIComponent(name)}"`);
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Drive proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
