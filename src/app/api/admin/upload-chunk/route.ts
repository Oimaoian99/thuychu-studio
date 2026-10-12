import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/drive';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const uploadId = req.headers.get('x-upload-id');
    const contentRange = req.headers.get('x-content-range');
    const isStatusCheck = req.headers.get('x-action') === 'check-status';
    
    if (!uploadId || !contentRange) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=${uploadId}`;

    const token = await getAccessToken();
    const chunk = isStatusCheck ? null : await req.arrayBuffer();
    
    const driveHeaders: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Range': contentRange
    };

    if (chunk && chunk.byteLength > 0) {
      driveHeaders['Content-Length'] = chunk.byteLength.toString();
    } else {
      driveHeaders['Content-Length'] = '0';
    }

    let driveRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: driveHeaders,
      body: chunk && chunk.byteLength > 0 ? chunk : undefined
    });
    
    // Nếu Google tạm bận (503 / 500) và không phải check status, thử lại 1 lần sau 1s ngay tại server
    if ((driveRes.status === 503 || driveRes.status === 500) && !isStatusCheck) {
      await new Promise(r => setTimeout(r, 1000));
      driveRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: driveHeaders,
        body: chunk && chunk.byteLength > 0 ? chunk : undefined
      });
    }

    if (driveRes.status === 308) {
      const range = driveRes.headers.get('range') || '';
      return NextResponse.json({ success: true, status: 'incomplete', range });
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
