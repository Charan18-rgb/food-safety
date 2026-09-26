import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import readline from 'readline';
import https from 'https';
import { validateBarcodeChecksum, isFoodProduct, classifyDataQuality, matchesTargetCategory } from '../src/utils/barcodeUtils';

const DB_PATH = path.join(process.cwd(), 'data/food_barcode_catalog.db');
if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec('CREATE TABLE IF NOT EXISTS catalog (barcode TEXT PRIMARY KEY, gtin14 TEXT, barcode_format TEXT, product_name TEXT NOT NULL, brand TEXT, category TEXT, subcategory TEXT, ingredients TEXT, nutrition TEXT, serving_size TEXT, serving_unit TEXT, net_quantity TEXT, additives TEXT, country TEXT, source TEXT NOT NULL, source_id TEXT, source_url TEXT, data_quality TEXT, confidence REAL, retrieved_at TEXT, updated_at TEXT, license TEXT)');
db.exec('DELETE FROM catalog');

const insertStmt = db.prepare('INSERT OR IGNORE INTO catalog (barcode, gtin14, barcode_format, product_name, brand, category, subcategory, ingredients, nutrition, serving_size, serving_unit, net_quantity, additives, country, source, source_id, source_url, data_quality, confidence, retrieved_at, updated_at, license) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

function run() {
  console.log('Starting TSV stream processing (Typescript)...');
  
  const url = 'https://openfoodfacts-ds.s3.eu-west-3.amazonaws.com/en.openfoodfacts.org.products.csv.gz';
  
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error('Failed to download OFF DB: ' + res.statusCode);
      return;
    }
    
    const gz = zlib.createGunzip();
    gz.on('error', e => console.error('GZ ERROR:', e.message));
    res.on('error', e => console.error('RES ERROR:', e.message));
    
    const rl = readline.createInterface({ input: res.pipe(gz), crlfDelay: Infinity });
    
    let headers: string[] = [];
    let totalInserted = 0;
    let indiaCount = 0;
    let globalCount = 0;
    let rowCount = 0;
    let batch: any[] = [];
    let isClosed = false;
    
    const processBatch = () => {
      if (batch.length === 0) return;
      try {
        const count = db.transaction((items) => {
          let c = 0;
          for (const item of items) {
            const dbRes = insertStmt.run(
              item.code, 
              null, 
              item.code.length === 8 ? 'EAN-8' : (item.code.length === 12 ? 'UPC-A' : 'EAN-13'),
              item.product_name,
              item.brands || null,
              item.categories || null,
              null, 
              item.ingredients || null,
              item.nutrition ? JSON.stringify(item.nutrition) : null,
              item.serving_size || null,
              null, 
              item.quantity || null,
              item.additives || null,
              item.countries || null,
              'open_food_facts', 
              item.code, 
              'https://world.openfoodfacts.org/product/' + item.code, 
              item.quality, 
              item.quality === 'analysis_ready' ? 1.0 : 0.5, 
              new Date().toISOString(),
              new Date().toISOString(),
              'ODbL' 
            );
            if (dbRes.changes > 0) c++;
          }
          return c;
        })(batch);
        totalInserted += count;
        batch = [];
        if (totalInserted % 500 === 0) {
          console.log(`Inserted: ${totalInserted} (India: ${indiaCount}, Global: ${globalCount})`);
        }
      } catch (err: any) {
        console.error('Batch Error:', err.message);
        batch = [];
      }
    };

    rl.on('line', (line) => {
      if (isClosed) return;
      if (totalInserted >= 28000) {
        isClosed = true;
        rl.close();
        return;
      }
      
      if (rowCount === 0) {
        headers = line.split('\t');
      } else {
        const parts = line.split('\t');
        const row: Record<string, string> = {};
        for (let i = 0; i < headers.length; i++) {
          row[headers[i]] = parts[i];
        }
        
        const code = row['code'];
        const product_name = row['product_name'];
        const countries = row['countries_en'];
        const categories = row['categories_en'];
        
        if (!code || !product_name || product_name.trim() === '') {
          rowCount++;
          return;
        }

        if (!validateBarcodeChecksum(code)) {
          rowCount++;
          return; // Skip completely invalid barcodes
        }

        if (!isFoodProduct(categories)) {
          rowCount++;
          return; // Strictly exclude non-food
        }
        
        const isIndia = countries && countries.toLowerCase().includes('india');
        const isTarget = matchesTargetCategory(categories);
        
        if (!isIndia) {
          if (!isTarget) {
            rowCount++;
            return;
          }
          if (globalCount >= 18000) {
            rowCount++;
            return;
          }
          globalCount++;
        } else {
          indiaCount++;
        }

        const nutrition: Record<string, number> = {};
        if (row['energy-kcal_100g']) nutrition['energy-kcal_100g'] = parseFloat(row['energy-kcal_100g']);
        if (row['energy_100g']) nutrition['energy_100g'] = parseFloat(row['energy_100g']);
        if (row['proteins_100g']) nutrition['proteins_100g'] = parseFloat(row['proteins_100g']);
        if (row['fat_100g']) nutrition['fat_100g'] = parseFloat(row['fat_100g']);
        if (row['saturated-fat_100g']) nutrition['saturated-fat_100g'] = parseFloat(row['saturated-fat_100g']);
        if (row['carbohydrates_100g']) nutrition['carbohydrates_100g'] = parseFloat(row['carbohydrates_100g']);
        if (row['sugars_100g']) nutrition['sugars_100g'] = parseFloat(row['sugars_100g']);
        if (row['salt_100g']) nutrition['salt_100g'] = parseFloat(row['salt_100g']);
        if (row['sodium_100g']) nutrition['sodium_100g'] = parseFloat(row['sodium_100g']);
        if (row['fiber_100g']) nutrition['fiber_100g'] = parseFloat(row['fiber_100g']);

        const quality = classifyDataQuality({
          code,
          productName: product_name,
          ingredients: row['ingredients_text'],
          nutrition: Object.keys(nutrition).length > 0 ? nutrition : null
        });

        const item = {
          code,
          product_name,
          brands: row['brands'],
          categories,
          ingredients: row['ingredients_text'],
          nutrition: Object.keys(nutrition).length > 0 ? nutrition : null,
          serving_size: row['serving_size'],
          quantity: row['quantity'],
          additives: row['additives_tags'],
          countries,
          quality
        };
        
        batch.push(item);
        if (batch.length >= 500) {
          processBatch();
        }
      }
      rowCount++;
      if (rowCount % 100000 === 0) console.log(`Processed ${rowCount} rows...`);
    });

    rl.on('close', () => {
      processBatch();
      console.log('Finished streaming TSV. Total inserted:', totalInserted);
      const total = db.prepare('SELECT count(*) as c FROM catalog').get().c;
      const ready = db.prepare("SELECT count(*) as c FROM catalog WHERE data_quality='analysis_ready'").get().c;
      const partial = db.prepare("SELECT count(*) as c FROM catalog WHERE data_quality='partial_data'").get().c;
      const identity = db.prepare("SELECT count(*) as c FROM catalog WHERE data_quality='identity_only'").get().c;
      console.log('Final DB Count:', total);
      console.log('Analysis Ready:', ready);
      console.log('Partial Data:', partial);
      console.log('Identity Only:', identity);
    });
  });
}

run();
