const fs = require('fs');
let content = fs.readFileSync('src/app/api/gallery/[code]/route.ts', 'utf8');

if (!content.includes('force-dynamic')) {
  content = "export const dynamic = 'force-dynamic';\n" + content;
}

content = content.replace(
  /return NextResponse\.json\(\{\\s*success: true,\\s*rawFiles,\\s*editedFiles,\\s*clientId: client\.id,\\s*selectedIds,\\s*maxSelections: client\.max_selections \|\| 5\\s*\}\);/,
  "const response = NextResponse.json({\n      success: true, \n      rawFiles, \n      editedFiles, \n      clientId: client.id, \n      selectedIds,\n      maxSelections: client.max_selections || 5\n    });\n    response.headers.set('Cache-Control', 'no-store, max-age=0');\n    return response;"
);

content = content.replace(
  /return NextResponse\.json\(\{\\s*success: true\\s*\}\);/,
  "const response = NextResponse.json({ success: true });\n    response.headers.set('Cache-Control', 'no-store, max-age=0');\n    return response;"
);

fs.writeFileSync('src/app/api/gallery/[code]/route.ts', content, 'utf8');
