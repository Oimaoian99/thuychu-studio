import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = `${url.origin}/api/admin/setup-google`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ 
      error: 'Vui lòng thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET vào file .env.local trước' 
    });
  }

  console.log("CLIENT_ID LENGTH:", clientId.length);
  console.log("CLIENT_SECRET LENGTH:", clientSecret.length);
  console.log("CLIENT_SECRET ENDS WITH:", clientSecret.charCodeAt(clientSecret.length - 1));

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  if (!code) {
    // Generate auth url
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive'],
      prompt: 'consent' // Force to get refresh token
    });
    
    return NextResponse.redirect(authUrl);
  } else {
    // Exchange code for tokens
    try {
      const { tokens } = await oauth2Client.getToken(code);
      return NextResponse.json({
        message: 'Thành công! Hãy copy đoạn REFRESH TOKEN dưới đây và dán vào file .env.local',
        GOOGLE_REFRESH_TOKEN: tokens.refresh_token
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message });
    }
  }
}
