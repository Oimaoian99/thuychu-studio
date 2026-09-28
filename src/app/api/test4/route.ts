import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    let auth: any;
    let branch = '';
    
    if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      branch = 'OAuth2';
      auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID.trim(),
        process.env.GOOGLE_CLIENT_SECRET.trim()
      );
      auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim()
      });
    } else {
      branch = 'ServiceAccount';
    }
    
    return NextResponse.json({
      success: true,
      branch,
      authClass: auth ? auth.constructor.name : 'none',
      clientId: typeof process.env.GOOGLE_CLIENT_ID,
      clientSecret: typeof process.env.GOOGLE_CLIENT_SECRET,
      token: typeof process.env.GOOGLE_REFRESH_TOKEN,
      privateKey: typeof process.env.GOOGLE_PRIVATE_KEY
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message,
      stack: e.stack
    });
  }
}
