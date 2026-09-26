import Database from 'better-sqlite3';
import path from 'path';
import { Router } from 'express';
import { ProductInput } from '@foodgrade/shared-types';
import { classifyDataQuality, validateBarcodeChecksum } from '../utils/barcodeUtils.js';


const emptyNutrient = { value: null, status: 'missing' as const, unit: 'g' as const };
const emptyNutrition = {
  basis: 'per_100g' as const,
  energyKcal: { ...emptyNutrient, unit: 'kcal' as const },
  carbohydratesG: emptyNutrient,
  totalSugarsG: emptyNutrient,
  addedSugarsG: emptyNutrient,
  dietaryFiberG: emptyNutrient,
  proteinG: emptyNutrient,
  totalFatG: emptyNutrient,
  saturatedFatG: emptyNutrient,
  transFatG: emptyNutrient,
  cholesterolMg: { ...emptyNutrient, unit: 'mg' as const },
  sodiumMg: { ...emptyNutrient, unit: 'mg' as const },
  saltG: emptyNutrient
};

// In-memory cache for external provider lookups
const externalCache = new Map<string, { data: ProductInput | null, source: string, expiresAt: number }>();
const CACHE_TTL_POSITIVE = 1000 * 60 * 60 * 24; // 24 hours for successful lookups
const CACHE_TTL_NEGATIVE = 1000 * 60 * 60 * 1; // 1 hour for negative results (404s)


export const barcodeRouter = Router();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let catalogDb: Database.Database | null = null;
try {
  catalogDb = new Database(path.join(__dirname, '../../data/food_barcode_catalog.db'), { readonly: true });
} catch (e) {
  console.log('Local barcode catalog unavailable', e);
}

async function lookupLocalCatalog(barcode: string): Promise<ProductInput | null> {
  if (!catalogDb) return null;
  try {
    const row = catalogDb.prepare('SELECT * FROM catalog WHERE barcode = ?').get(barcode) as any;
    if (!row) return null;
    
    return {
      barcode: row.barcode,
      productName: row.product_name,
      brand: row.brand,
      category: row.category,
      rawIngredientsText: row.ingredients || '',
      parsedIngredients: [],
      detectedAdditives: [],
      nutrition: emptyNutrition, // Minimal stub required by Zod schema
      provenance: {
        sourceType: 'open_food_facts', // Original source inside catalog
        observationMode: row.data_quality === 'analysis_ready' ? 'directly_observed' : 'fallback',
        rawConfidence: row.confidence,
        missingMandatoryFields: row.data_quality === 'analysis_ready' ? [] : ['ingredients', 'nutrition']
      }
    };
  } catch {
    return null;
  }
}

async function lookupOFF(barcode: string): Promise<ProductInput | null> {
  const url = `https://world.openfoodfacts.org/api/v3/product/${barcode}.json`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'FoodGrade/1.0' } });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 'success' || !data.product) return null;
    
    const p = data.product;
    const quality = classifyDataQuality({
      code: barcode,
      productName: p.product_name || p.product_name_en,
      ingredients: p.ingredients_text,
      nutrition: p.nutriments
    });

    return {
      barcode,
      productName: p.product_name || p.product_name_en,
      brand: p.brands,
      category: p.categories,
      rawIngredientsText: p.ingredients_text || '',
      parsedIngredients: [],
      detectedAdditives: [],
      nutrition: emptyNutrition, // Still stubbed because frontend does not render OFF nutrition currently, only ingredients matters for grade, but quality handles it
      provenance: {
        sourceType: 'open_food_facts',
        observationMode: quality === 'analysis_ready' ? 'directly_observed' : 'fallback',
        rawConfidence: quality === 'analysis_ready' ? 1.0 : 0.5,
        missingMandatoryFields: quality === 'analysis_ready' ? [] : ['ingredients', 'nutrition']
      }
    };
  } catch {
    return null;
  }
}

async function lookupUPCitemdb(barcode: string): Promise<ProductInput | null> {
  try {
    const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.code === 'OK' && data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        barcode,
        productName: item.title,
        brand: item.brand,
        category: item.category,
        rawIngredientsText: '',
        parsedIngredients: [],
        detectedAdditives: [],
        nutrition: emptyNutrition,
        provenance: {
          sourceType: 'upcitemdb' as any,
          observationMode: 'fallback',
          rawConfidence: 0.5,
          missingMandatoryFields: ['ingredients', 'nutrition']
        }
      };
    }
  } catch {
    return null;
  }
  return null;
}

barcodeRouter.get('/:barcode', async (req, res) => {
  const { barcode } = req.params;
  const requestId = (req as any).requestId as string;
  
  if (!validateBarcodeChecksum(barcode)) {
    return res.status(400).json({ error: 'Invalid barcode checksum', requestId });
  }

  const localProduct = await lookupLocalCatalog(barcode);
  if (localProduct) {
    return res.json({ success: true, product: localProduct, source: 'local_catalog' });
  }

  const cached = externalCache.get(barcode);
  if (cached && cached.expiresAt > Date.now()) {
    if (cached.data) {
      return res.json({ success: true, product: cached.data, source: cached.source + '_cached' });
    } else {
      return res.status(404).json({ error: 'Product not found', requestId });
    }
  }
  
  const offProduct = await lookupOFF(barcode);
  if (offProduct) {
    externalCache.set(barcode, { data: offProduct, source: 'open_food_facts', expiresAt: Date.now() + CACHE_TTL_POSITIVE });
    return res.json({ success: true, product: offProduct, source: 'open_food_facts' });
  }

  const upcProduct = await lookupUPCitemdb(barcode);
  if (upcProduct) {
    externalCache.set(barcode, { data: upcProduct, source: 'upcitemdb', expiresAt: Date.now() + CACHE_TTL_POSITIVE });
    return res.json({ success: true, product: upcProduct, source: 'upcitemdb' });
  }
  
  externalCache.set(barcode, { data: null, source: 'none', expiresAt: Date.now() + CACHE_TTL_NEGATIVE });
  return res.status(404).json({ error: 'Product not found', requestId });
});

