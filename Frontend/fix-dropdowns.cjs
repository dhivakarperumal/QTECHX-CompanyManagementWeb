const fs = require('fs');
const path = require('path');

const dir = 'd:/Q Techx Projects/Q Techx Mobile App/Q TECHX/Q TECHX WEB/Frontend/src/Admin/Projects/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const f of files) {
    const file = path.join(dir, f);
    let content = fs.readFileSync(file, 'utf8');
    
    let changed = false;
    content = content.replace(/<select\s+[^>]*className=["']([^"']*)["']/g, (match, className) => {
        if (!className.includes('[&>option]:bg-[#111318]') && !className.includes('bg-transparent')) {
            changed = true;
            return match.replace(className, className + ' [&>option]:bg-[#111318]');
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed:', f);
    }
}
