import fs from 'fs';
import path from 'path';
import readline from 'readline';

async function testUHTT() {
  const catalogPath = path.join(process.cwd(), 'data/final/foodgrade_barcode_catalog.jsonl');
  const catalog = new Set(fs.readFileSync(catalogPath, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l).barcode));
  
  const uhttDir = path.join(process.cwd(), 'data/raw/uhtt/DATA');
  const files = fs.readdirSync(uhttDir).filter(f => f.startsWith('uhtt_barcode_ref_') && f.endsWith('.csv'));
  
  let matches = 0;
  let total = 0;
  
  for (const file of files) {
    const rl = readline.createInterface({ input: fs.createReadStream(path.join(uhttDir, file)), crlfDelay: Infinity });
    let isFirst = true;
    for await (const line of rl) {
      if (isFirst) { isFirst = false; continue; }
      const parts = line.split('\t');
      if (parts.length < 2) continue;
      
      const code = parts[1].trim();
      total++;
      if (catalog.has(code)) matches++;
      else if (catalog.has('0' + code)) matches++;
      else if (catalog.has('00' + code)) matches++;
      else if (catalog.has(code.padStart(13, '0'))) matches++;
      else if (catalog.has(code.padStart(14, '0'))) matches++;
    }
  }
  
  console.log(`UHTT Total: ${total}`);
  console.log(`UHTT Matches: ${matches}`);
}

testUHTT().catch(console.error);
