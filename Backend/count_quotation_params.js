const fs = require('fs');
const text = fs.readFileSync('src/models/quotationModel.js', 'utf8');
const sqlMatch = text.match(/INSERT INTO quotations \(([^)]+)\) VALUES \(([^)]+)\)`/s);
if (!sqlMatch) {
  console.error('SQL insert pattern not found');
  process.exit(1);
}
const columns = sqlMatch[1].split(',').map(c => c.trim()).filter(c => c.length);
const placeholders = (sqlMatch[2].match(/\?/g) || []).length;
const executeMatch = text.match(/db\.execute\([\s\S]*?\,\s*\[([\s\S]*?)\]\s*\)/m);
if (!executeMatch) {
  console.error('db.execute parameters array not found');
  process.exit(1);
}
const paramsText = executeMatch[1];
let params = [];
let cur = '';
let depth = 0;
for (let i = 0; i < paramsText.length; i++) {
  const ch = paramsText[i];
  if (ch === ',' && depth === 0) {
    if (cur.trim()) params.push(cur.trim());
    cur = '';
    continue;
  }
  cur += ch;
  if (ch === '{' || ch === '[') depth++;
  else if (ch === '}' || ch === ']') depth--;
}
if (cur.trim()) params.push(cur.trim());
console.log('columns=' + columns.length);
console.log('placeholders=' + placeholders);
console.log('params=' + params.length);
for (let i = 0; i < Math.min(params.length, 60); i++) {
  console.log(`${i + 1}: ${params[i]}`);
}
