import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootId) return NextResponse.json({ error: 'No root folder' });

    const response = await drive.permissions.create({
      fileId: rootId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      }
    });

    return NextResponse.json({ success: true, response: response.data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
