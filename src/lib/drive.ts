import { google } from 'googleapis';

export const getDrive = async () => {
  let auth: any;

  if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID.trim(),
      process.env.GOOGLE_CLIENT_SECRET.trim()
    );
    
    // NATIVE FETCH TO BYPASS GAXIOS COMPRESSION BUG ON CLOUDFLARE
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID.trim(),
          client_secret: process.env.GOOGLE_CLIENT_SECRET.trim(),
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim(),
          grant_type: 'refresh_token'
        }).toString()
      });
      const data = await res.json();
      
      auth.setCredentials({
        access_token: data.access_token,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim()
      });
    } catch (e) {
      console.error("Native fetch token error:", e);
      auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim()
      });
    }
  } else {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
  }

  return google.drive({ version: 'v3', auth });
};
