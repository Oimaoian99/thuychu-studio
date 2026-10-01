export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const envs = Object.keys(process.env).filter(k => k.startsWith('GOOGLE_') || k.startsWith('NEXT_'));
  const hasServiceEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const hasRefresh = !!process.env.GOOGLE_REFRESH_TOKEN;
  return NextResponse.json({ success: true, envs, hasServiceEmail, hasRefresh });
}
