const fs = require('fs');
let content = fs.readFileSync('src/components/AdminUploader.tsx', 'utf8');

content = content.split('exactFolderId=${exactFolderId}').join('exactFolderId=${exactFolderId}&t=${Date.now()}');
content = content.split('parentId=${folderId}&type=${type}').join('parentId=${folderId}&type=${type}&t=${Date.now()}');

fs.writeFileSync('src/components/AdminUploader.tsx', content, 'utf8');
