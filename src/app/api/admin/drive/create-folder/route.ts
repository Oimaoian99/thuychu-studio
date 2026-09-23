import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function POST(req: Request) {
  try {
    const { name, parentId } = await req.json();

    if (!name || !parentId) {
      return NextResponse.json({ error: 'Missing name or parentId' }, { status: 400 });
    }

    const res = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      },
      fields: 'id, name, mimeType'
    });

    return NextResponse.json({ success: true, folder: res.data });
  } catch (error: any) {
    console.error("Create folder error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
