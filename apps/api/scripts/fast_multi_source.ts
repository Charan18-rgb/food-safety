import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../data/food_barcode_catalog.db');
const RAW_DIR = path.join(__dirname, '../../../data/raw');
const FINAL_DIR = path.join(__dirname, '../../../data/final');

if (!fs.existsSync(FINAL_DIR)) fs.mkdirSync(FINAL_DIR, { recursive: true });

async function run() {
  const db = new Database(DB_PATH, { readonly: true });
  console.log('Loading base catalog from SQLite...');
  const records = db.prepare('SELECT * FROM catalog').all() as any[];
  
  const catalog = new Map<string, any>();
  for (const r of records) {
    catalog.set(r.barcode, { 
      ...r, 
      source_secondary: '',
      sources: ['open_food_facts'],
      conflicts: []
    });
  }
  
  console.log(`Loaded ${catalog.size} records.`);

  // 1. UHTT ENRICHMENT
  const uhttDir = path.join(RAW_DIR, 'uhtt/DATA');
  if (fs.existsSync(uhttDir)) {
    console.log('Streaming UHTT for enrichment...');
    const files = fs.readdirSync(uhttDir).filter(f => f.startsWith('uhtt_barcode_ref_') && f.endsWith('.csv') && f.match(/\d{4}\.csv$/));
    let enrichedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(uhttDir, file);
      await new Promise<void>((resolve) => {
        const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
        let isFirst = true;
        
        rl.on('line', (line) => {
          if (isFirst) { isFirst = false; return; }
          const parts = line.split('\t');
          if (parts.length < 7) return;
          
          const code = parts[1]?.trim();
          if (!code) return;
          
          let targetCode = code;
          if (!catalog.has(targetCode) && targetCode.length === 13 && catalog.has('0' + targetCode)) {
            targetCode = '0' + targetCode;
          }
          
          if (catalog.has(targetCode)) {
            const p = catalog.get(targetCode)!;
            let enriched = false;
            
            const brand = parts[6]?.trim();
            if (brand && (!p.brand || p.brand === 'Unknown')) {
              p.brand = brand;
              p.brand_source = 'uhtt';
              enriched = true;
            }
            
            const cat = parts[4]?.trim();
            if (cat && (!p.category || p.category === 'Unknown')) {
              p.category = cat;
              p.category_source = 'uhtt';
              enriched = true;
            }
            
            if (enriched) {
              if (!p.sources.includes('uhtt')) p.sources.push('uhtt');
              enrichedCount++;
            }
          }
        });
        rl.on('close', resolve);
      });
    }
    console.log(`UHTT Enrichment complete. Enriched ${enrichedCount} products.`);
  }

  // 2. USDA ENRICHMENT
  const usdaDir = path.join(RAW_DIR, 'usda/FoodData_Central_branded_food_csv_2024-04-18');
  if (fs.existsSync(usdaDir)) {
    console.log('Streaming USDA Branded Foods for enrichment...');
    
    // a. branded_food.csv
    const fdcIdToBarcode = new Map<string, string>();
    let usdaEnriched = 0;
    await new Promise<void>((resolve) => {
      const rl = readline.createInterface({ input: fs.createReadStream(path.join(usdaDir, 'branded_food.csv')), crlfDelay: Infinity });
      let isFirst = true;
      let headers: string[] = [];
      rl.on('line', (line) => {
        if (isFirst) { headers = line.split(','); isFirst = false; return; }
        
        // Fast naive split - USDA fields can be quoted, but we mainly need gtin_upc which is usually unquoted or simple quoted
        // fdc_id, brand_owner, brand_name, subbrand_name, gtin_upc, ingredients, market_country, modified_date, dataSource, package_weight
        // We will use a regex to split properly
        const parts = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g)?.map(p => {
          let val = p;
          if (val.startsWith(',')) val = val.substring(1);
          if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
          return val;
        });
        
        if (!parts || parts.length < 7) return;
        
        const fdc_id = parts[0];
        const brand_owner = parts[1];
        const gtin = parts[4]?.replace(/-/g, '')?.replace(/^0+/, ''); // USDA often has weird UPCA formats
        const ingredients = parts[5];
        
        if (!gtin) return;
        
        // Find match
        let targetCode = gtin;
        let matched = false;
        if (catalog.has(targetCode)) matched = true;
        else if (catalog.has('0' + targetCode)) { targetCode = '0' + targetCode; matched = true; }
        else if (catalog.has('00' + targetCode)) { targetCode = '00' + targetCode; matched = true; }
        else if (catalog.has('000' + targetCode)) { targetCode = '000' + targetCode; matched = true; }
        else if (catalog.has('0000' + targetCode)) { targetCode = '0000' + targetCode; matched = true; }
        
        // also try padding to 14
        const pad14 = gtin.padStart(14, '0');
        if (!matched && catalog.has(pad14)) { targetCode = pad14; matched = true; }
        
        if (matched) {
          fdcIdToBarcode.set(fdc_id, targetCode);
          
          const p = catalog.get(targetCode)!;
          let enriched = false;
          
          if (ingredients && ingredients.length > 10 && (!p.ingredients || p.ingredients.length < 10)) {
             p.ingredients = ingredients;
             p.ingredients_source = 'usda_fdc';
             enriched = true;
          }
          if (brand_owner && (!p.brand || p.brand === 'Unknown')) {
             p.brand = brand_owner;
             p.brand_source = 'usda_fdc';
             enriched = true;
          }
          
          if (enriched) {
            if (!p.sources.includes('usda_fdc')) p.sources.push('usda_fdc');
            usdaEnriched++;
          }
        }
      });
      rl.on('close', resolve);
    });
    
    console.log(`Matched ${fdcIdToBarcode.size} USDA products. Streaming nutrients...`);
    
    // b. food_nutrient.csv
    const fdcNutrients = new Map<string, { nutrient_id: string, amount: string }[]>();
    await new Promise<void>((resolve) => {
      const rl = readline.createInterface({ input: fs.createReadStream(path.join(usdaDir, 'food_nutrient.csv')), crlfDelay: Infinity });
      let isFirst = true;
      rl.on('line', (line) => {
        if (isFirst) { isFirst = false; return; }
        // id, fdc_id, nutrient_id, amount
        const parts = line.split(',');
        if (parts.length < 4) return;
        let fdc_id = parts[1];
        if (fdc_id.startsWith('"') && fdc_id.endsWith('"')) fdc_id = fdc_id.substring(1, fdc_id.length - 1);
        let n_id = parts[2];
        if (n_id.startsWith('"') && n_id.endsWith('"')) n_id = n_id.substring(1, n_id.length - 1);
        let amount = parts[3];
        if (amount.startsWith('"') && amount.endsWith('"')) amount = amount.substring(1, amount.length - 1);
        
        if (fdcIdToBarcode.has(fdc_id)) {
          const arr = fdcNutrients.get(fdc_id) || [];
          arr.push({ nutrient_id: n_id, amount: amount });
          fdcNutrients.set(fdc_id, arr);
        }
      });
      rl.on('close', resolve);
    });
    
    // c. map nutrients
    // 1008 = energy, 1003 = protein, 1004 = fat, 1005 = carbs, 2000 = total sugars, 1079 = fiber, 1093 = sodium
    // For branded foods, amounts are usually per 100g/ml or per serving. FDC branded is almost always per 100g/ml!
    let nutrientEnriched = 0;
    for (const [fdc_id, nuts] of fdcNutrients.entries()) {
      const barcode = fdcIdToBarcode.get(fdc_id)!;
      const p = catalog.get(barcode)!;
      
      let energy = '', protein = '', fat = '', carbs = '', sugars = '', fiber = '', sodium = '';
      
      for (const n of nuts) {
        if (n.nutrient_id === '1008') energy = n.amount; // kcal
        if (n.nutrient_id === '1003') protein = n.amount;
        if (n.nutrient_id === '1004') fat = n.amount;
        if (n.nutrient_id === '1005') carbs = n.amount;
        if (n.nutrient_id === '2000') sugars = n.amount;
        if (n.nutrient_id === '1079') fiber = n.amount;
        if (n.nutrient_id === '1093') sodium = n.amount;
      }
      
      // Basic JSON assembly
      const nutObj = {
         energy_kcal_100g: energy,
         protein_g_100g: protein,
         fat_g_100g: fat,
         carbohydrate_g_100g: carbs,
         sugars_g_100g: sugars,
         fiber_g_100g: fiber,
         sodium_mg_100g: sodium
      };
      
      const nutStr = JSON.stringify(nutObj);
      if (nutStr.length > 20 && (!p.nutrition || p.nutrition.length < 20)) {
         p.nutrition = nutStr;
         p.nutrition_source = 'usda_fdc';
         if (!p.sources.includes('usda_fdc')) p.sources.push('usda_fdc');
         nutrientEnriched++;
      }
    }
    
    console.log(`USDA Enrichment complete. Enriched ${usdaEnriched} products with metadata, ${nutrientEnriched} with nutrition.`);
  }

  // 3. RECALCULATE ANALYSIS READY & SNACKS
  console.log('Recalculating analysis readiness and snack categorization...');
  
  const catalogArr = Array.from(catalog.values());
  for (const r of catalogArr) {
     r.source_count = r.sources.length;
     r.source_primary = r.sources[0];
     
     // Determine analysis_ready
     const hasIngredients = r.ingredients && r.ingredients.length > 10;
     const hasNutrition = r.nutrition && r.nutrition.length > 20;
     const hasName = r.product_name && r.product_name.length > 2;
     
     if (hasName && hasIngredients && hasNutrition) {
        r.data_quality = 'analysis_ready';
     } else if (hasName || hasIngredients || hasNutrition) {
        r.data_quality = 'partial_data';
     } else {
        r.data_quality = 'identity_only';
     }
  }

  const snacksArr = catalogArr.filter(r => {
    if (!r.category) return false;
    const lower = r.category.toLowerCase();
    return ['snack', 'chips', 'wafers', 'namkeen', 'bhujia', 'sev', 'mixture', 'popcorn', 'makhana', 'cracker', 'nut', 'seed', 'trail mix', 'protein bar'].some(t => lower.includes(t));
  });
  const analysisArr = catalogArr.filter(r => r.data_quality === 'analysis_ready');

  const writeCSV = (file: string, arr: any[]) => {
    if (arr.length === 0) return;
    const cols = Object.keys(arr[0]);
    const lines = [cols.join(',')];
    for (const obj of arr) {
      lines.push(cols.map(c => {
         const val = obj[c];
         if (val === null || val === undefined) return '""';
         if (Array.isArray(val)) return `"${val.join(';').replace(/"/g, '""')}"`;
         return `"${String(val).replace(/"/g, '""')}"`;
      }).join(','));
    }
    fs.writeFileSync(file, lines.join('\n'));
  };

  writeCSV(path.join(FINAL_DIR, 'foodgrade_barcode_catalog.csv'), catalogArr);
  writeCSV(path.join(FINAL_DIR, 'foodgrade_analysis_dataset.csv'), analysisArr);
  writeCSV(path.join(FINAL_DIR, 'foodgrade_snacks_dataset.csv'), snacksArr);
  
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

run().catch(console.error);
