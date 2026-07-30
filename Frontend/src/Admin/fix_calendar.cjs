const fs = require('fs');
let content = fs.readFileSync('OfficeCalendar.jsx.bak', 'utf8');

// 1. Remove theme state declaration
content = content.replace(/const \[theme, setTheme\] = useState\('dark'\);\n?/g, '');

// 2. Remove theme toggle button completely
content = content.replace(/<button onClick=\{\(\) => setTheme[^\n]*\n[^\n]*\n\s*<\/button>\n?/g, '');

// 3. Handle template literals: \`... ${theme === 'dark' ? 'bg-[#06070b] text-white' : 'bg-slate-50 text-slate-900'} ...\`
content = content.replace(/\$\{theme === 'dark' \? '([^']+)' : '([^']+)'\}/g, function(match, p1) {
  return p1;
});

// 4. Handle standard ternary returns: style={{ background: theme === 'dark' ? '#111827' : '#ffffff' }}
content = content.replace(/theme === 'dark' \? '([^']+)' : '([^']+)'/g, function(match, p1) {
  return "'" + p1 + "'";
});

// 5. Enhance styles
content = content.replace(/bg-\[#06070b\]/g, 'bg-slate-950/70');
content = content.replace(/bg-\[#0b111c\]\/95/g, 'bg-slate-950/80');
content = content.replace(/bg-\[#0b111c\]/g, 'bg-slate-900/80');
content = content.replace(/bg-\[#05070b\]/g, 'bg-slate-900/60');
content = content.replace(/border-white\/10/g, 'border-slate-800');
content = content.replace(/text-white\/40/g, 'text-slate-400');
content = content.replace(/text-white\/35/g, 'text-slate-500');
content = content.replace(/text-white\/50/g, 'text-slate-400');
content = content.replace(/text-white\/60/g, 'text-slate-300');
content = content.replace(/text-white\/70/g, 'text-slate-200');
content = content.replace(/bg-white\/5/g, 'bg-slate-800/50');
content = content.replace(/bg-white\/10/g, 'bg-slate-800');
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-slate-800/80');
content = content.replace(/hover:bg-white\/5/g, 'hover:bg-slate-800/60');
content = content.replace(/bg-white\/8/g, 'bg-slate-800/70');
content = content.replace(/border-slate-300 bg-white hover:bg-slate-100/g, 'border-slate-800 bg-slate-900/60 hover:bg-slate-800');

fs.writeFileSync('OfficeCalendar.jsx', content);
console.log('Successfully upgraded UI.');
