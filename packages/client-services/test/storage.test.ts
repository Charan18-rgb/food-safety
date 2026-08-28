import { describe, it, expect, beforeEach } from 'vitest';
import {
  MemoryStorageAdapter,
  IndexedDBAdapter,
  ScanHistoryRepository,
  OfflineProductCache
} from '../src/storage/index.js';
import { ScanHistoryRecord } from '../src/types.js';
import { createNutrientValue } from '@foodgrade/shared-types';

function createMockScanRecord(id: string, name: string, grade: 'A' | 'B' | 'C' | 'D' | 'E', isFav = false): ScanHistoryRecord {
  return {
    id,
    barcode: `8901234567${id}`,
    productName: name,
    brand: 'Test Brand',
    category: 'Biscuits',
    scannedAt: new Date(Date.now() - parseInt(id, 10) * 1000).toISOString(),
    isFavorite: isFav,
    userNotes: `Note for ${name}`,
    sourceType: 'label_ocr',
    productInput: {
      productName: name,
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(450, 'kcal'),
        carbohydratesG: createNutrientValue(68, 'g'),
        totalSugarsG: createNutrientValue(20, 'g'),
        addedSugarsG: createNutrientValue(20, 'g'),
        dietaryFiberG: createNutrientValue(3, 'g'),
        proteinG: createNutrientValue(7, 'g'),
        totalFatG: createNutrientValue(15, 'g'),
        saturatedFatG: createNutrientValue(7, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(300, 'mg'),
        saltG: createNutrientValue(0.75, 'g')
      },
      rawIngredientsText: 'Wheat Flour, Sugar, Palm Oil',
      parsedIngredients: [],
      detectedAdditives: [],
      provenance: {
        sourceType: 'label_ocr',
        observationMode: 'directly_observed',
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    },
    analysisResult: {
      algorithmVersion: '1.0.0',
      score: grade === 'A' ? 85 : grade === 'C' ? 55 : 30,
      grade,
      pillarScores: {
        nutritionScore: 70,
        ingredientScore: 60,
        additiveScore: 90
      },
      positives: [],
      warnings: [],
      detectedIngredients: [],
      detectedAdditives: [],
      summaryExplanation: 'Test explanation',
      confidence: {
        level: 'high',
        numericScore: 1.0,
        reasons: [],
        missingMandatoryFields: [],
        userRecommendations: []
      },
      analyzedAt: new Date().toISOString()
    }
  };
}

describe('Storage Subsystem & ScanHistoryRepository', () => {
  let repo: ScanHistoryRepository;

  beforeEach(() => {
    repo = new ScanHistoryRepository(new MemoryStorageAdapter());
  });

  it('should save, retrieve by ID, and count records', async () => {
    expect(await repo.count()).toBe(0);

    const rec = createMockScanRecord('1', 'Parle-G', 'C');
    await repo.save(rec);

    expect(await repo.count()).toBe(1);
    const fetched = await repo.getById('1');
    expect(fetched).toBeDefined();
    expect(fetched?.productName).toBe('Parle-G');
  });

  it('should retrieve record by barcode', async () => {
    const rec = createMockScanRecord('2', 'Good Day', 'C');
    await repo.save(rec);

    const fetched = await repo.getByBarcode(rec.barcode!);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe('2');
  });

  it('should filter records by grade, search query, and favorites', async () => {
    await repo.save(createMockScanRecord('1', 'Whole Oats', 'A', true));
    await repo.save(createMockScanRecord('2', 'Butter Cookies', 'C', false));
    await repo.save(createMockScanRecord('3', 'Cola Drink', 'E', false));
    await repo.save(createMockScanRecord('4', 'Milk Biscuits', 'C', true));

    const searchRes = await repo.list({ query: 'Cookies' });
    expect(searchRes).toHaveLength(1);
    expect(searchRes[0].productName).toBe('Butter Cookies');

    const gradeCRes = await repo.list({ grades: ['C'] });
    expect(gradeCRes).toHaveLength(2);

    const favRes = await repo.list({ onlyFavorites: true });
    expect(favRes).toHaveLength(2);
  });

  it('should toggle favorite status and update notes', async () => {
    const rec = createMockScanRecord('1', 'Digestive Biscuits', 'A', false);
    await repo.save(rec);

    await repo.setFavorite('1', true);
    let updated = await repo.getById('1');
    expect(updated?.isFavorite).toBe(true);

    await repo.updateNotes('1', 'Great high fiber option');
    updated = await repo.getById('1');
    expect(updated?.userNotes).toBe('Great high fiber option');
  });

  it('should delete record and clear all history', async () => {
    await repo.save(createMockScanRecord('1', 'Product 1', 'A'));
    await repo.save(createMockScanRecord('2', 'Product 2', 'B'));
    expect(await repo.count()).toBe(2);

    await repo.delete('1');
    expect(await repo.count()).toBe(1);
    expect(await repo.getById('1')).toBeNull();

    await repo.clearAll();
    expect(await repo.count()).toBe(0);
  });
});

describe('OfflineProductCache Fresh/Stale/Missing Semantics', () => {
  it('should transition through missing, fresh, and stale states', async () => {
    // 20ms fresh TTL, 100ms max stale retention
    const cache = new OfflineProductCache(new MemoryStorageAdapter(), 20, 100);

    // 1. Missing
    const missing = await cache.getWithStatus('8901234567890');
    expect(missing.status).toBe('missing');
    expect(missing.data).toBeNull();

    // 2. Set fresh
    const mockInput = createMockScanRecord('1', 'Cached Oats', 'A').productInput;
    await cache.set('8901234567890', mockInput);

    const fresh = await cache.getWithStatus('8901234567890');
    expect(fresh.status).toBe('fresh');
    expect(fresh.data?.productName).toBe('Cached Oats');

    // 3. Wait until it becomes stale
    await new Promise(r => setTimeout(r, 30));
    const stale = await cache.getWithStatus('8901234567890');
    expect(stale.status).toBe('stale');
    expect(stale.data?.productName).toBe('Cached Oats');

    // 4. Stale fallback helper
    const fallbackRes = await cache.getStaleFallback('8901234567890');
    expect(fallbackRes?.isStale).toBe(true);
    expect(fallbackRes?.data.productName).toBe('Cached Oats');

    // 5. Expired beyond max stale window -> purged to missing
    await new Promise(r => setTimeout(r, 90));
    const expired = await cache.getWithStatus('8901234567890');
    expect(expired.status).toBe('missing');
    expect(expired.data).toBeNull();
  });
});

describe('IndexedDBAdapter Storage Failure Signalling', () => {
  it('should signal memory fallback when IndexedDB is unavailable', () => {
    let fallbackNotified = false;
    let fallbackMsg = '';

    const adapter = new IndexedDBAdapter({
      dbName: 'test_db',
      storeName: 'test_store',
      onFallbackActivated: (reason) => {
        fallbackNotified = true;
        fallbackMsg = reason;
      }
    });

    expect(adapter.isUsingFallback()).toBe(true);
    expect(adapter.getStorageType()).toBe('memory');
    expect(fallbackNotified).toBe(true);
    expect(fallbackMsg).toContain('IndexedDB');
  });
});
