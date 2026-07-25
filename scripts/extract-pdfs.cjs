const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function extract(file) {
  const buf = fs.readFileSync(file);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  return result.text;
}

async function main() {
  const dir = 'C:/Users/renaw/Downloads/AZ_Off_Script_Linked_Agreement_Packet (1)';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf')).sort();
  const out = {};
  for (const f of files) {
    try {
      const text = await extract(path.join(dir, f));
      out[f] = text;
      console.log(`${f}: ${text.length} chars`);
    } catch (e) {
      console.error(`${f}: ${e.message}`);
      out[f] = `ERROR: ${e.message}`;
    }
  }
  fs.writeFileSync('C:/Users/renaw/Downloads/agreements_extracted.json', JSON.stringify(out, null, 2));
  console.log('Done. Wrote agreements_extracted.json');
}

main().catch(e => { console.error(e); process.exit(1); });
