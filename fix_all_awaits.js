const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("await getDrive().")) {
    content = content.replace(/await getDrive\(\)\./g, "await (await getDrive()).");
    fs.writeFileSync(file, content);
    console.log('Fixed await', file);
  }
});
