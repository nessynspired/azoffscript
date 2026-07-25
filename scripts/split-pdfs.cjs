const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('C:/Users/renaw/Downloads/agreements_extracted.json', 'utf8'));
const outDir = 'C:/Users/renaw/Downloads/agreements_text';
fs.mkdirSync(outDir, { recursive: true });

for (const [file, text] of Object.entries(data)) {
  const outName = file.replace('.pdf', '.txt');
  fs.writeFileSync(path.join(outDir, outName), text);
  console.log(`${outName}: ${text.length} chars`);
}
console.log('Done.');
