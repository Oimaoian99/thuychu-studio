const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("getDrive()")) {
    let newContent = content.replace(/(?<!await\s+)(?<!await\s+\()getDrive\(\)/g, "(await getDrive())");
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      console.log('Fixed regex', file);
    }
  }
});
