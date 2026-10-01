const fs = require('fs');
let content = fs.readFileSync('src/lib/drive.ts', 'utf8');
content = content.replace(
  'return data.access_token;',
  'if (!data.access_token) throw new Error("Token fetch failed: " + JSON.stringify(data));\n    return data.access_token;'
);
fs.writeFileSync('src/lib/drive.ts', content, 'utf8');
