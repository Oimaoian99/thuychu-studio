const fs = require('fs');

async function test() {
  const envText = fs.readFileSync('.env.local', 'utf8');
  let supabaseUrl = '', supabaseKey = '';
  for(let line of envText.split('\n')) {
    if(line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if(line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
  }
  
  const res = await fetch(supabaseUrl + '/rest/v1/clients?select=*&order=created_at.desc&limit=5', {
    headers: {
      'apikey': supabaseKey,
      'Authorization': 'Bearer ' + supabaseKey
    }
  });
  const data = await res.json();
  console.log("Recent Clients:", JSON.stringify(data, null, 2));
}
test().catch(console.error);
