const fs = require('fs');
const glob = require('glob');

const fix = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ drive \} from '@\/lib\/drive';/g, "import { getDrive } from '@/lib/drive';");
  content = content.replace(/drive\./g, "getDrive().");
  fs.writeFileSync(file, content);
};

fix('src/app/api/admin/clients/route.ts');
fix('src/app/api/admin/clients/[id]/upload/route.ts');
fix('src/app/api/gallery/[code]/route.ts');
fix('src/app/api/test3/route.ts');
