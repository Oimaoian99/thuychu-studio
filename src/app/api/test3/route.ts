import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  return NextResponse.json({
    googleId: process.env.GOOGLE_CLIENT_ID ? 'exists' : 'missing',
    allKeys: Object.keys(process.env).length,
    keysStartingWithG: Object.keys(process.env).filter(k => k.startsWith('G'))
  });
}
