import { google } from 'googleapis';

const credentials = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  // Đảm bảo private key giữ nguyên cấu trúc dòng bằng cách replace \n
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

export const drive = google.drive({ version: 'v3', auth });
