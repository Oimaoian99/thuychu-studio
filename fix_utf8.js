const fs = require('fs');
let content = fs.readFileSync('src/app/gallery/[code]/page.tsx', 'utf8');
content = content.replace(/V\? trang ch\?/g, 'V? trang ch?');
fs.writeFileSync('src/app/gallery/[code]/page.tsx', content, 'utf8');
