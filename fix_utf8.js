const fs = require('fs');
let content = fs.readFileSync('src/app/gallery/[code]/page.tsx', 'utf8');

const target = 'if (error) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400 font-medium">{error}</div>;';
const replacement = 'if (error) return <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-red-400 font-medium"><p>{error}</p><button onClick={() => window.location.href = \'/\'} className="px-6 py-2 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors">Về trang chủ</button></div>;';

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/app/gallery/[code]/page.tsx', content, 'utf8');
    console.log('Successfully added Back to Home button with correct UTF-8.');
} else {
    console.log('Target string not found in page.tsx');
}
