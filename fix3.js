const fs = require('fs');
const files = [
  'src/app/api/gallery/[code]/route.ts',
  'src/app/api/admin/drive/list/route.ts',
  'src/app/api/admin/clients/[id]/selected/route.ts'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/export const dynamic = 'force-dynamic';[\r\n]*/g, '');
  content = content + "\nexport const dynamic = 'force-dynamic';\n";
  fs.writeFileSync(file, content, 'utf8');
}
