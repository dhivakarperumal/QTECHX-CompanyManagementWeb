const fs = require('fs');
const path = require('path');

const dir = 'd:/Q Techx Projects/Q Techx Mobile App/Q TECHX/Q TECHX WEB/Frontend/src/Admin/Projects/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const f of files) {
    const file = path.join(dir, f);
    let content = fs.readFileSync(file, 'utf8');
    
    let changed = false;
    // Split into lines to safely replace className inside <select
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<select ') && lines[i].includes('className="')) {
            lines[i] = lines[i].replace(/className="([^"]+)"/, (match, cls) => {
                if (!cls.includes('[&>option]:bg-[#111318]') && !cls.includes('bg-transparent')) {
                    changed = true;
                    return `className="${cls} [&>option]:bg-[#111318]"`;
                }
                return match;
            });
        }
    }

    if (changed) {
        fs.writeFileSync(file, lines.join('\n'));
        console.log('Fixed:', f);
    }
}
