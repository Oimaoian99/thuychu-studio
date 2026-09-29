const fs = require('fs');
let content = fs.readFileSync('src/components/AdminUploader.tsx', 'utf8');
fs.writeFileSync('src/components/AdminUploader.tsx', content, 'utf8');
