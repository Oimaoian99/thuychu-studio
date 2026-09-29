const fs = require('fs');
let content = fs.readFileSync('src/components/AdminUploader.tsx', 'utf8');

const regex1 = /src=\{\\/api\/drive\/thumbnail\?id=\\$\\{file\.id\\}\\}/;
const regex2 = /src=\{\\/api\/drive\/proxy\?id=\\$\\{existingFiles\\[previewIndex\\]\.id\\}&action=view\\}/;

console.log("Regex 1 match:", regex1.test(content));
console.log("Regex 2 match:", regex2.test(content));

content = content.replace(regex1, 'src={file.thumbnailLink ? file.thumbnailLink.replace(/=s\\\\d+/, "=w600") : /api/drive/thumbnail?id=\\}');
content = content.replace(regex2, 'src={existingFiles[previewIndex].thumbnailLink ? existingFiles[previewIndex].thumbnailLink.replace(/=s\\\\d+/, "=w2048") : /api/drive/proxy?id=\\&action=view}');

fs.writeFileSync('src/components/AdminUploader.tsx', content, 'utf8');
