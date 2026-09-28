const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/await supabase/g, 'await getSupabase()');
  fs.writeFileSync(file, content);
}

fix('src/app/api/admin/clients/route.ts');
fix('src/app/api/admin/clients/[id]/route.ts');
fix('src/app/api/admin/clients/[id]/selected/route.ts');
fix('src/app/api/admin/clients/[id]/upload/route.ts');
fix('src/app/api/gallery/[code]/route.ts');
