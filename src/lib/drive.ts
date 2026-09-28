import { google } from 'googleapis';

export const getDrive = () => {
  let auth: any;

  if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID.trim(),
      process.env.GOOGLE_CLIENT_SECRET.trim()
    );
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim()
    });
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
