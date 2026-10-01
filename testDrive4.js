const { google } = require('googleapis');
const fs = require('fs');

async function test() {
  const envText = fs.readFileSync('.env.local', 'utf8');
  let email = '', key = '';
  for(let line of envText.split('\n')) {
    if(line.startsWith('GOOGLE_SERVICE_ACCOUNT_EMAIL=')) email = line.split('=')[1].trim();
    if(line.startsWith('GOOGLE_PRIVATE_KEY=')) key = line.substring(line.indexOf('=')+1).trim().replace(/"/g, '').replace(/\\n/g, '\n');
  }

  const credentials = { client_email: email, private_key: key };
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/drive'] });
  const token = await auth.getAccessToken();
  
  let url = 'https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent("'1f6b0WYTult8AaC50rBXeYNtLTJTC41au' in parents and trashed = false") + '&fields=' + encodeURIComponent('files(id, name, mimeType, thumbnailLink, webContentLink)') + '&pageSize=10';
  let res = await fetch(url, { headers: { 'Authorization': "Bearer " + token } });
  let data = await res.json();
  console.log("Contents of 2909/GOC:", JSON.stringify(data, null, 2));
}
test().catch(console.error);
