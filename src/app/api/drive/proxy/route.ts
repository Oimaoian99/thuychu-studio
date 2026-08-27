import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

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
