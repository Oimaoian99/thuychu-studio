import { NextResponse } from 'next/server';
import { getDrive } from '@/lib/drive';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const drive = await getDrive();
    const res = await drive.files.list({ pageSize: 1 });
    return NextResponse.json({ 
      success: true, 
      dataType: typeof res.data, 
      dataIsString: typeof res.data === 'string',
      dataKeys: typeof res.data === 'object' && res.data ? Object.keys(res.data) : [],
      raw: typeof res.data === 'string' ? res.data.substring(0, 100) : null 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack });
  }
}
