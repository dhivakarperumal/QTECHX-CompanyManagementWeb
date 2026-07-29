const fs = require('fs');
const path = require('path');
const filePath = path.join('src','models','quotationModel.js');
let text = fs.readFileSync(filePath,'utf8');
const regex = /\) VALUES \(([^)]+)\)`/s;
const match = text.match(regex);
if (!match) {
  console.error('No VALUES() match found');
  process.exit(1);
}
const placeholderCount = (match[1].match(/\?/g) || []).length;
console.log('Found placeholders=', placeholderCount);
const newPlaceholders = Array(51).fill('?').join(',');
text = text.slice(0, match.index) + ') VALUES (' + newPlaceholders + ')`' + text.slice(match.index + match[0].length);
fs.writeFileSync(filePath, text, 'utf8');
console.log('Replaced values with 51 placeholders');
