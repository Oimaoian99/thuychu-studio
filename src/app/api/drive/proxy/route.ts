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

    const auth: any = drive.context._options.auth;
    const tokenResponse = auth.getClient ? await (await auth.getClient()).getAccessToken() : await auth.getAccessToken();
    const token = typeof tokenResponse === 'string' ? tokenResponse : (tokenResponse.token || tokenResponse.access_token);

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
      // Giữ nguyên Content-Type gốc của Google Drive (để ảnh hiển thị đúng là ảnh, video là video)
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
