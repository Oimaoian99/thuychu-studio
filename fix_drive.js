const fs = require('fs');
let content = fs.readFileSync('src/lib/drive.ts', 'utf8');
content = content.replace(
  'const data = await res.json();\n  return data.files || [];',
  'const data = await res.json();\n  if (data.error) throw new Error(JSON.stringify(data.error));\n  return data.files || [];'
);
fs.writeFileSync('src/lib/drive.ts', content, 'utf8');
