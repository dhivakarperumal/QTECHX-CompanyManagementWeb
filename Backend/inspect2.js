const fs = require('fs');
const text = fs.readFileSync('src/models/quotationModel.js', 'utf8');
const arrStart = text.indexOf('[\n      data.uuid');
if (arrStart === -1) {
  console.error('start not found');
  process.exit(1);
}
const arrEnd = text.indexOf('\n    ]', arrStart);
if (arrEnd === -1) {
  console.error('end not found');
  process.exit(1);
}
const arrText = text.slice(arrStart, arrEnd);
const lines = arrText.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
console.log('line count', lines.length);
console.log(lines.join('\n'));
