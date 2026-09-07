import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name') || 'file';
    const action = searchParams.get('action') || 'download';

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

    // Lấy token để gọi trực tiếp Google Drive API qua fetch
    const auth: any = drive.context._options.auth;
    const token = await auth.getAccessToken();

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

    if (action === 'download') {
      responseHeaders.set('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`);
      responseHeaders.set('Content-Type', 'application/octet-stream'); // Force download
    } else {
      responseHeaders.set('Content-Disposition', `inline; filename="${encodeURIComponent(name)}"`);
      const ct = responseHeaders.get('Content-Type');
      if (!ct || !ct.startsWith('video/')) {
        responseHeaders.set('Content-Type', 'video/mp4'); // Fallback to mp4 for playing
      }
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
