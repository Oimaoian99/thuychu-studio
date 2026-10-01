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
  const tokenObj = await auth.getAccessToken();
  const token = tokenObj;
  
  let url = 'https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent("'1p-JFojCR9LXcz-cX-GIC43M1NE2rvynM' in parents and trashed = false") + '&fields=' + encodeURIComponent('files(id, name, createdTime)') + '&pageSize=10';
  let res = await fetch(url, { headers: { 'Authorization': "Bearer " + token } });
  let data = await res.json();
  console.log("Root Folders:", JSON.stringify(data.files, null, 2));

  if (data.files && data.files.length > 0) {
    let folderId = data.files[0].id;
    let url2 = 'https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(`'${folderId}' in parents and trashed = false`) + '&fields=' + encodeURIComponent('files(id, name, mimeType, createdTime)') + '&pageSize=10';
    let res2 = await fetch(url2, { headers: { 'Authorization': "Bearer " + token } });
    let data2 = await res2.json();
    console.log("Contents of", data.files[0].name, ":", JSON.stringify(data2.files, null, 2));
    
    let goc = data2.files.find(f => f.name.toUpperCase() === 'GOC');
    if (goc) {
      let url3 = 'https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(`'${goc.id}' in parents and trashed = false`) + '&fields=' + encodeURIComponent('files(id, name, mimeType)') + '&pageSize=10';
      let res3 = await fetch(url3, { headers: { 'Authorization': "Bearer " + token } });
      let data3 = await res3.json();
      console.log("Contents of GOC:", JSON.stringify(data3.files, null, 2));
    }
  }
}
test().catch(console.error);
