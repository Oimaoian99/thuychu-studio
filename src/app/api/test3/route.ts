import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  });
}
