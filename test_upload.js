const { google } = require('googleapis');
const fs = require('fs');

async function testUpload() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  console.log("Got token.");

  // 1. Create session
  const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.token}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      name: 'test_file.txt',
    })
  });

  if (!initRes.ok) {
    console.error("Init failed", await initRes.text());
    return;
  }

  const uploadUrl = initRes.headers.get('Location');
  console.log("Upload URL:", uploadUrl);

  // 2. Upload chunk
  const chunk = Buffer.from("Hello world, this is a test chunk.");
  const contentRange = `bytes 0-${chunk.length - 1}/${chunk.length}`;

  const driveRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token.token}`,
      'Content-Length': chunk.length.toString(),
      'Content-Range': contentRange
    },
    body: chunk
  });

  console.log("Drive Res Status:", driveRes.status);
  console.log("Drive Res Text:", await driveRes.text());
}

testUpload();
