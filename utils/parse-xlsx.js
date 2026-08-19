const fs = require('fs');
const path = require('path');

const src = process.argv[2] || 'C:\\Users\\marti\\Downloads\\atm-report-extracted\\xl\\worksheets\\sheet1.xml';
const xml = fs.readFileSync(src, 'utf-8');

const rows = [];
const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
const cellRe = /<c\s+r="([A-Z]+)\d+"[^>]*(?:\s+t="([^"]+)")?[^>]*>([\s\S]*?)<\/c>/g;
const inlineStrRe = /<is><t[^>]*>([\s\S]*?)<\/t><\/is>/;
const valRe = /<v>([\s\S]*?)<\/v>/;
const tRe = /<t[^>]*>([\s\S]*?)<\/t>/;

let m;
while ((m = rowRe.exec(xml)) !== null) {
  const rowInner = m[1];
  const cells = {};
  let c;
  const cellRe2 = /<c\s+r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g;
  while ((c = cellRe2.exec(rowInner)) !== null) {
    const col = c[1];
    const attrs = c[2];
    const inner = c[3];
    const tMatch = attrs.match(/\st="([^"]+)"/);
    const type = tMatch ? tMatch[1] : '';
    let value = '';
    if (type === 'inlineStr') {
      const is = inner.match(/<t[^>]*>([\s\S]*?)<\/t>/);
      value = is ? is[1] : '';
    } else if (type === 's') {
      const v = inner.match(valRe);
      value = v ? '(sharedString#' + v[1] + ')' : '';
    } else {
      const v = inner.match(valRe);
      value = v ? v[1] : '';
    }
    cells[col] = value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  }
  rows.push(cells);
}

console.log('Total rows:', rows.length);
if (rows.length > 0) {
  const header = rows[0];
  const cols = Object.keys(header).sort();
  console.log('\nHeader columns:');
  cols.forEach(c => console.log(`  ${c}: ${header[c]}`));

  console.log('\nFirst data row:');
  const first = rows[1] || {};
  cols.forEach(c => console.log(`  ${c}: ${first[c] || ''}`));

  console.log('\n--- All rows (columns joined) ---');
  rows.forEach((r, i) => {
    const values = cols.map(c => r[c] || '').join(' | ');
    console.log(`[${i}] ${values}`);
  });
}
