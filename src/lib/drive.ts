import { google } from 'googleapis';

function base64url(source: Buffer | Uint8Array) {
  let encoded = Buffer.from(source).toString('base64');
  return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getServiceAccountToken(clientEmail: string, privateKey: string) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  const signatureInput = base64url(Buffer.from(JSON.stringify(header))) + '.' + base64url(Buffer.from(JSON.stringify(claim)));
  
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  let pem = privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
  if (!pem.includes(pemHeader)) throw new Error('Invalid private key format');
  
  const pemContents = pem.substring(pem.indexOf(pemHeader) + pemHeader.length, pem.indexOf(pemFooter)).replace(/\s/g, '');
  const binaryDer = Buffer.from(pemContents, 'base64');
  
  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signatureInput)
  );
  
  const jwt = signatureInput + '.' + base64url(new Uint8Array(signature));
  
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString()
  });
  
  const data = await res.json();
  if (data.error) throw new Error('Token fetch failed: ' + JSON.stringify(data));
  return data.access_token;
}

let cachedAccessToken: string | null = null;
let tokenExpiryTime: number = 0;
let isFetchingToken = false;
let tokenPromise: Promise<string> | null = null;

export const getAccessToken = async () => {
  // N?u c token trong b? nh? v cn h?n (cho b?a hao 5 pht) th dng lun
  if (cachedAccessToken && Date.now() < tokenExpiryTime - 5 * 60 * 1000) {
    return cachedAccessToken;
  }
  
  // N?u dang trong qu trnh l?y token th ch? request do d? trnh l?y thm
  if (isFetchingToken && tokenPromise) {
    return await tokenPromise;
  }

  isFetchingToken = true;
  tokenPromise = (async () => {
    try {
      let newToken = '';
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
        newToken = data.access_token;
      } else {
        // Service account fallback using Cloudflare compatible crypto.subtle
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.replace(/^"|"$/g, '');
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;
        if (!clientEmail || !privateKey) throw new Error('Missing Service Account Credentials');
        newToken = await getServiceAccountToken(clientEmail, privateKey);
      }
      
      cachedAccessToken = newToken;
      tokenExpiryTime = Date.now() + 3600 * 1000; // 1 ti?ng
      return newToken;
    } finally {
      isFetchingToken = false;
      tokenPromise = null;
    }
  })();
  
  return await tokenPromise;
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

export const getDrive = async () => {
  let auth: any;
  if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID.trim(), process.env.GOOGLE_CLIENT_SECRET.trim());
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim() });
  } else {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.replace(/^"|"$/g, ''),
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
    };
    auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/drive'] });
  }
  return google.drive({ version: 'v3', auth });
};
