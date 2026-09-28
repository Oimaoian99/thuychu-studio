const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("import { drive } from '@/lib/drive'")) {
    content = content.replace(/import \{ drive \} from '@\/lib\/drive';/g, "import { getDrive } from '@/lib/drive';");
    content = content.replace(/drive\./g, "getDrive().");
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
