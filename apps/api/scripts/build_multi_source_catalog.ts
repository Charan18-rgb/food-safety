import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import readline from 'readline';
import https from 'https';
import { fileURLToPath } from 'url';
import { validateBarcodeChecksum, isFoodProduct, classifyDataQuality, matchesTargetCategory } from '../src/utils/barcodeUtils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../../data');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const FINAL_DIR = path.join(DATA_DIR, 'final');

[RAW_DIR, FINAL_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

export interface CanonicalProduct {
  barcode: string;
  gtin14: string;
  barcode_format: string;

  product_name: string | null;
  brand: string | null;
  manufacturer: string | null;

  category: string | null;
  subcategory: string | null;

  ingredients_raw: string | null;
  ingredients_normalized: string | null;

  energy_kcal_100g: number | null;
  protein_g_100g: number | null;
  carbohydrate_g_100g: number | null;
  total_sugar_g_100g: number | null;
  added_sugar_g_100g: number | null;
  fat_g_100g: number | null;
  saturated_fat_g_100g: number | null;
  trans_fat_g_100g: number | null;
  fiber_g_100g: number | null;
  sodium_mg_100g: number | null;
  salt_g_100g: number | null;

  serving_size: string | null;
  serving_unit: string | null;
  net_quantity: string | null;

  additives_raw: string | null;
  ins_codes: string | null;
  additive_names: string | null;

  allergens: string | null;
  claims: string | null;

  country: string | null;
  market_evidence: string | null;

  source_primary: string;
  source_secondary: string | null;
  source_url: string | null;

  data_quality: string;
  ingredient_completeness: boolean;
  nutrition_completeness: boolean;
  additive_completeness: boolean;
  confidence: number;
  conflict: boolean;
  
  created_at: string;
  updated_at: string;
}

const catalog = new Map<string, CanonicalProduct>();
const snackCatalog = new Map<string, CanonicalProduct>();

function normalizeIngredients(raw: string | null): string | null {
  if (!raw) return null;
  let norm = raw.replace(/\s+/g, ' ').trim();
  // Support India-specific expressions via simple standardizations
  norm = norm.replace(/refined wheat flour/gi, 'Maida (Refined Wheat Flour)');
  return norm;
}

function normalizeAdditives(raw: string | null): { raw: string|null, ins: string|null, names: string|null } {
  if (!raw) return { raw: null, ins: null, names: null };
  const codes: string[] = [];
  const parts = raw.split(',');
  parts.forEach(p => {
    const match = p.match(/(?:e|ins)\s*-?\s*(\d+[a-z]*)/i);
    if (match) codes.push(`INS ${match[1]}`);
  });
  return { raw, ins: codes.length > 0 ? codes.join(',') : null, names: null };
}

function mergeFields(existing: CanonicalProduct, incoming: Partial<CanonicalProduct>, sourceName: string) {
  let conflict = false;
  
  // Field-level enrichment with simple deterministic precedence logic
  // Priority: USDA -> Indian -> OFF
  
  if (incoming.product_name && (!existing.product_name || incoming.product_name.length > existing.product_name.length)) {
    existing.product_name = incoming.product_name;
  }
  
  if (incoming.ingredients_raw && (!existing.ingredients_raw || incoming.ingredients_raw.length > existing.ingredients_raw.length)) {
    existing.ingredients_raw = incoming.ingredients_raw;
    existing.ingredients_normalized = incoming.ingredients_normalized || null;
  }
  
  if (incoming.energy_kcal_100g !== null) existing.energy_kcal_100g = incoming.energy_kcal_100g;
  if (incoming.protein_g_100g !== null) existing.protein_g_100g = incoming.protein_g_100g;
  if (incoming.carbohydrate_g_100g !== null) existing.carbohydrate_g_100g = incoming.carbohydrate_g_100g;
  if (incoming.fat_g_100g !== null) existing.fat_g_100g = incoming.fat_g_100g;
  
  if (!existing.source_secondary && existing.source_primary !== sourceName) {
    existing.source_secondary = sourceName;
  }
  
  existing.conflict = existing.conflict || conflict;
  existing.updated_at = new Date().toISOString();
}

function isSnack(cat: string | null): boolean {
  if (!cat) return false;
  const lower = cat.toLowerCase();
  const snackTerms = ['snack', 'chips', 'potato chips', 'wafers', 'namkeen', 'bhujia', 'sev', 'mixture', 'popcorn', 'makhana', 'extruded', 'cracker', 'nut', 'seed', 'trail mix', 'protein bar'];
  return snackTerms.some(t => lower.includes(t));
}

function recomputeQuality(p: CanonicalProduct) {
  const nutritionRecord: any = {};
  if (p.energy_kcal_100g !== null) nutritionRecord['energy-kcal_100g'] = p.energy_kcal_100g;
  if (p.protein_g_100g !== null) nutritionRecord['proteins_100g'] = p.protein_g_100g;
  if (p.carbohydrate_g_100g !== null) nutritionRecord['carbohydrates_100g'] = p.carbohydrate_g_100g;
  if (p.fat_g_100g !== null) nutritionRecord['fat_100g'] = p.fat_g_100g;

  const quality = classifyDataQuality({
    code: p.barcode,
    productName: p.product_name,
    ingredients: p.ingredients_raw,
    nutrition: Object.keys(nutritionRecord).length > 0 ? nutritionRecord : null
  });

  p.data_quality = quality;
  p.ingredient_completeness = !!p.ingredients_raw && p.ingredients_raw.length > 5;
  p.nutrition_completeness = Object.keys(nutritionRecord).length >= 4;
  p.additive_completeness = !!p.additives_raw;
  p.confidence = quality === 'analysis_ready' ? 1.0 : 0.5;
}

export async function processOFFStream() {
  console.log('Streaming Open Food Facts bulk export...');
  return new Promise<void>((resolve) => {
    const url = 'https://openfoodfacts-ds.s3.eu-west-3.amazonaws.com/en.openfoodfacts.org.products.csv.gz';
    https.get(url, (res) => {
      const gz = zlib.createGunzip();
      const rl = readline.createInterface({ input: res.pipe(gz), crlfDelay: Infinity });
      
      let headers: string[] = [];
      let rowCount = 0;
      let inserted = 0;
      let globalCount = 0;
      let indiaCount = 0;
      
      rl.on('line', (line) => {
        if (inserted >= 28000) {
          rl.close();
          return;
        }
        
        if (rowCount === 0) {
          headers = line.split('\t');
        } else {
          const parts = line.split('\t');
          const row: Record<string, string> = {};
          for (let i = 0; i < headers.length; i++) row[headers[i]] = parts[i];
          
          const code = row['code'];
          const product_name = row['product_name'];
          if (!code || !product_name || !validateBarcodeChecksum(code) || !isFoodProduct(row['categories_en'])) {
            rowCount++;
            return;
          }
          
          const countries = row['countries_en'] || '';
          const isIndia = countries.toLowerCase().includes('india');
          const isTarget = matchesTargetCategory(row['categories_en']);
          
          if (!isIndia) {
            if (!isTarget || globalCount >= 18000) { rowCount++; return; }
            globalCount++;
          } else {
            indiaCount++;
          }

          const additives = normalizeAdditives(row['additives_tags']);
          
          const incoming: CanonicalProduct = {
            barcode: code,
            gtin14: code.padStart(14, '0'),
            barcode_format: code.length === 8 ? 'EAN-8' : (code.length === 12 ? 'UPC-A' : 'EAN-13'),
            product_name,
            brand: row['brands'] || null,
            manufacturer: null,
            category: row['categories_en'] || null,
            subcategory: null,
            ingredients_raw: row['ingredients_text'] || null,
            ingredients_normalized: normalizeIngredients(row['ingredients_text']),
            energy_kcal_100g: parseFloat(row['energy-kcal_100g']) || null,
            protein_g_100g: parseFloat(row['proteins_100g']) || null,
            carbohydrate_g_100g: parseFloat(row['carbohydrates_100g']) || null,
            total_sugar_g_100g: parseFloat(row['sugars_100g']) || null,
            added_sugar_g_100g: null,
            fat_g_100g: parseFloat(row['fat_100g']) || null,
            saturated_fat_g_100g: parseFloat(row['saturated-fat_100g']) || null,
            trans_fat_g_100g: null,
            fiber_g_100g: parseFloat(row['fiber_100g']) || null,
            sodium_mg_100g: parseFloat(row['sodium_100g']) || null,
            salt_g_100g: parseFloat(row['salt_100g']) || null,
            serving_size: row['serving_size'] || null,
            serving_unit: null,
            net_quantity: row['quantity'] || null,
            additives_raw: additives.raw,
            ins_codes: additives.ins,
            additive_names: additives.names,
            allergens: row['allergens'] || null,
            claims: null,
            country: countries || null,
            market_evidence: isIndia ? 'INDIA_MARKET_TAGGED' : 'UNKNOWN',
            source_primary: 'open_food_facts',
            source_secondary: null,
            source_url: 'https://world.openfoodfacts.org/product/' + code,
            data_quality: 'identity_only',
            ingredient_completeness: false,
            nutrition_completeness: false,
            additive_completeness: false,
            confidence: 0,
            conflict: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          if (catalog.has(code)) {
            mergeFields(catalog.get(code)!, incoming, 'open_food_facts');
          } else {
            catalog.set(code, incoming);
            inserted++;
          }
          
          recomputeQuality(catalog.get(code)!);
          
          if (isSnack(incoming.category)) {
            snackCatalog.set(code, catalog.get(code)!);
          }
          
          if (inserted % 1000 === 0) console.log(`Processed ${inserted} valid items...`);
        }
        rowCount++;
      });
      
      rl.on('close', resolve);
    });
  });
}

export async function processUHTT() {
  const uhttDir = path.join(RAW_DIR, 'uhtt/DATA');
  if (!fs.existsSync(uhttDir)) {
    console.log('UHTT data not found, skipping enrichment.');
    return;
  }
  
  console.log('Streaming UHTT Barcode Reference for enrichment...');
  const files = fs.readdirSync(uhttDir).filter(f => f.startsWith('uhtt_barcode_ref_') && f.endsWith('.csv') && f.match(/\d{4}\.csv$/));
  
  let enrichedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(uhttDir, file);
    await new Promise<void>((resolve) => {
      const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
      let headers: string[] = [];
      let isFirst = true;
      
      rl.on('line', (line) => {
        if (isFirst) {
          headers = line.split('\t');
          isFirst = false;
          return;
        }
        const parts = line.split('\t');
        if (parts.length < 7) return;
        
        // ID, UPCEAN, Name, CategoryID, CategoryName, BrandID, BrandName
        const code = parts[1]?.trim();
        if (!code) return;
        
        // Try match exact or without leading zero
        let targetCode = code;
        if (!catalog.has(targetCode) && targetCode.length === 13 && catalog.has('0' + targetCode)) {
          targetCode = '0' + targetCode;
        }
        
        if (catalog.has(targetCode)) {
          const p = catalog.get(targetCode)!;
          let enriched = false;
          
          const brand = parts[6]?.trim();
          if (brand && !p.brand) {
            p.brand = brand;
            enriched = true;
          }
          
          const cat = parts[4]?.trim();
          if (cat && !p.category) {
            p.category = cat;
            enriched = true;
          }
          
          if (enriched) {
            p.source_secondary = 'uhtt_barcode_reference';
            enrichedCount++;
          }
        }
      });
      rl.on('close', resolve);
    });
  }
  
  console.log(`UHTT Enrichment complete. Enriched ${enrichedCount} products.`);
}

export function exportDatasets() {
  const catalogArr = Array.from(catalog.values());
  const snacksArr = Array.from(snackCatalog.values());
  const analysisArr = catalogArr.filter(p => p.data_quality === 'analysis_ready');
  
  const writeCSV = (file: string, arr: any[]) => {
    if (arr.length === 0) return;
    const cols = Object.keys(arr[0]);
    const lines = [cols.join(',')];
    for (const obj of arr) {
      lines.push(cols.map(c => `"${(obj[c] !== null && obj[c] !== undefined ? String(obj[c]).replace(/"/g, '""') : '')}"`).join(','));
    }
    fs.writeFileSync(file, lines.join('\n'));
  };

  writeCSV(path.join(FINAL_DIR, 'foodgrade_barcode_catalog.csv'), catalogArr);
  writeCSV(path.join(FINAL_DIR, 'foodgrade_analysis_dataset.csv'), analysisArr);
  writeCSV(path.join(FINAL_DIR, 'foodgrade_snacks_dataset.csv'), snacksArr);
  
  // JSONL for catalog
  const jsonlPath = path.join(FINAL_DIR, 'foodgrade_barcode_catalog.jsonl');
  const ws = fs.createWriteStream(jsonlPath);
  for (const obj of catalogArr) {
    ws.write(JSON.stringify(obj) + '\n');
  }
  ws.end();
  
  console.log(`Exported ${catalogArr.length} to foodgrade_barcode_catalog.csv`);
  console.log(`Exported ${analysisArr.length} to foodgrade_analysis_dataset.csv`);
  console.log(`Exported ${snacksArr.length} to foodgrade_snacks_dataset.csv`);
}

async function run() {
  await processOFFStream();
  await processUHTT();
  exportDatasets();
}

run().catch(console.error);
