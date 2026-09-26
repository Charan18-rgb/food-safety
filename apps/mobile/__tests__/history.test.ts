import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientService } from '../src/services/client';

vi.mock('../src/storage/SQLiteKVAdapter', () => {
  return {
    SQLiteKVAdapter: class {
      store = new Map();
      async init() {}
      async get(key: string) { return this.store.get(key) || null; }
      async set(key: string, value: any) { this.store.set(key, value); }
      async delete(key: string) { this.store.delete(key); }
      async getAll() { return Array.from(this.store.values()); }
      async clear() { this.store.clear(); }
      async count() { return this.store.size; }
    }
  };
});

describe('History UX Integration', () => {
  beforeEach(async () => {
    await clientService.clearHistory();
  });

  it('can list, delete, and clear history', async () => {
    // 1. Add some records
    await clientService.analyzeAndSave({
      productName: 'Product 1',
      rawIngredientsText: 'water',
      parsedIngredients: [],
      detectedAdditives: [],
      nutrition: { basis: 'per_100g' } as any,
      provenance: { sourceType: 'barcode', observationMode: 'api', missingMandatoryFields: [], rawConfidence: 1 }
    });
    
    await clientService.analyzeAndSave({
      productName: 'Product 2',
      rawIngredientsText: 'sugar',
      parsedIngredients: [],
      detectedAdditives: [],
      nutrition: { basis: 'per_100g' } as any,
      provenance: { sourceType: 'label_ocr', observationMode: 'directly_observed', missingMandatoryFields: [], rawConfidence: 1 }
    });

    const list1 = await clientService.getHistory();
    expect(list1.length).toBe(2);

    // 2. Delete one
    await clientService.deleteScan(list1[0].id);
    const list2 = await clientService.getHistory();
    expect(list2.length).toBe(1);
    expect(list2[0].id).toBe(list1[1].id);

    // 3. Clear all
    await clientService.clearHistory();
    const list3 = await clientService.getHistory();
    expect(list3.length).toBe(0);
  });
});
