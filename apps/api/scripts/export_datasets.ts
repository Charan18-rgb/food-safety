import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../data/food_barcode_catalog.db');
const FINAL_DIR = path.join(__dirname, '../../../data/final');

if (!fs.existsSync(FINAL_DIR)) fs.mkdirSync(FINAL_DIR, { recursive: true });

const db = new Database(DB_PATH, { readonly: true });

const records = db.prepare('SELECT * FROM catalog').all() as any[];

const writeCSV = (file: string, arr: any[]) => {
  if (arr.length === 0) return;
  const cols = Object.keys(arr[0]);
  const lines = [cols.join(',')];
  for (const obj of arr) {
    lines.push(cols.map(c => `"${(obj[c] !== null && obj[c] !== undefined ? String(obj[c]).replace(/"/g, '""') : '')}"`).join(','));
  }
  fs.writeFileSync(file, lines.join('\n'));
};

const catalogArr = records;
const analysisArr = records.filter(r => r.data_quality === 'analysis_ready');
const snacksArr = records.filter(r => {
  if (!r.category) return false;
  const lower = r.category.toLowerCase();
  return ['snack', 'chips', 'wafers', 'namkeen', 'bhujia', 'sev', 'mixture', 'popcorn', 'makhana', 'cracker', 'nut', 'seed', 'trail mix', 'protein bar'].some(t => lower.includes(t));
});

writeCSV(path.join(FINAL_DIR, 'foodgrade_barcode_catalog.csv'), catalogArr);
writeCSV(path.join(FINAL_DIR, 'foodgrade_analysis_dataset.csv'), analysisArr);
writeCSV(path.join(FINAL_DIR, 'foodgrade_snacks_dataset.csv'), snacksArr);

const jsonlPath = path.join(FINAL_DIR, 'foodgrade_barcode_catalog.jsonl');
const ws = fs.createWriteStream(jsonlPath);
for (const obj of catalogArr) {
  ws.write(JSON.stringify(obj) + '\n');
}
ws.end();

console.log('Export complete.');
