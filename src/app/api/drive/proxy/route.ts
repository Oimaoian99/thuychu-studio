import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Lấy luồng dữ liệu file từ Google Drive
    const response = await drive.files.get(
      { fileId: id, alt: 'media' },
      { responseType: 'stream' }
    );

    // Trả về stream trực tiếp cho frontend
    const stream = response.data as unknown as ReadableStream;
    
    return new Response(stream, {
      headers: {
        'Content-Type': response.headers['content-type'] || 'application/octet-stream',
      },
    });
  } catch (error: any) {
    console.error('Drive proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
