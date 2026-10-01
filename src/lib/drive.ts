import { google } from 'googleapis';

export const getAccessToken = async () => {
  if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID.trim(),
        client_secret: process.env.GOOGLE_CLIENT_SECRET.trim(),
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim(),
        grant_type: 'refresh_token'
      }).toString()
    });
    const data = await res.json();
    if (!data.access_token) throw new Error("Token fetch failed: " + JSON.stringify(data));
    return data.access_token;
  } else {
    // Service account fallback
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
    };
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const token = await auth.getAccessToken();
    return token;
  }
};

export const driveCreateFolder = async (name: string, parents: string[]) => {
  const token = await getAccessToken();
  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { 'Authorization': "Bearer " + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents })
  });
  const data = await res.json();
  return data.id;
};

export const driveListFiles = async (query: string, fields: string = 'files(id, name, mimeType, webContentLink, thumbnailLink)') => {
  const token = await getAccessToken();
  const url = 'https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(query) + '&fields=' + encodeURIComponent(fields) + '&pageSize=1000&t=' + Date.now();
  const res = await fetch(url, { headers: { 'Authorization': "Bearer " + token }, cache: 'no-store' });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.files || [];
};

// Vẫn giữ lại getDrive cho các route không bị lỗi (như upload chunk)
export const getDrive = async () => {
  let auth: any;
  if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID.trim(), process.env.GOOGLE_CLIENT_SECRET.trim());
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim() });
  } else {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
    };
    auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/drive'] });
  }
  return google.drive({ version: 'v3', auth });
};
