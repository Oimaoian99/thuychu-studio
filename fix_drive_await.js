const fs = require('fs');
const glob = require('glob');

const fix = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/await getDrive\(\)\./g, "await (await getDrive()).");
  fs.writeFileSync(file, content);
};

fix('src/app/api/admin/clients/route.ts');
fix('src/app/api/admin/clients/[id]/upload/route.ts');
fix('src/app/api/gallery/[code]/route.ts');
fix('src/app/api/admin/drive/create-folder/route.ts');
fix('src/app/api/admin/drive/list/route.ts');
