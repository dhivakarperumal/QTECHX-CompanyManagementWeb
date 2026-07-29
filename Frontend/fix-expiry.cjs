const fs = require('fs');
const file = 'd:/Q Techx Projects/Q Techx Mobile App/Q TECHX/Q TECHX WEB/Frontend/src/Admin/Projects/ProjectExpiryPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace bg-slate-950/70 px-3 py-2 with text-white included
content = content.replace(/bg-slate-950\/70 px-3 py-2"/g, 'bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50"');

// Replace bg-transparent outline-none with text-white
content = content.replace(/bg-transparent outline-none"/g, 'bg-transparent outline-none text-white"');

// Since the regex might not capture <select perfectly if it spans lines, let's just do a simpler replace for all selects
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<select') && lines[i].includes('className="')) {
        lines[i] = lines[i].replace(/className="([^"]*)"/, (match, cls) => {
            if (!cls.includes('[&>option]:bg-[#111318]')) {
                return 'className="' + cls + ' [&>option]:bg-[#111318]"';
            }
            return match;
        });
    }
}
fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed Expiry Page Inputs!');
