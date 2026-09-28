import { NextResponse } from 'next/server';
import { driveCreateFolder } from '@/lib/drive';

export async function POST(req: Request) {
  try {
    const { name, parentId } = await req.json();

    if (!name || !parentId) {
      return NextResponse.json({ error: 'Missing name or parentId' }, { status: 400 });
    }

    const folderId = await driveCreateFolder(name, [parentId]);
    return NextResponse.json({ success: true, folderId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
