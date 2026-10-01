export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const parsedKey = rawKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  
  const debug = {
    length: parsedKey.length,
    startsWith: parsedKey.substring(0, 30),
    endsWith: parsedKey.slice(-30),
    newlineCount: (parsedKey.match(/\n/g) || []).length,
    includesLiteralBackslashN: parsedKey.includes('\\n')
  };

  return NextResponse.json({ success: true, debug });
}
