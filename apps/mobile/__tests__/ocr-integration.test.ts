import { describe, it, expect, vi, beforeEach } from 'vitest';
import { visionPipeline, analyzeOCRTextAndSave } from '../src/services/vision';
import { clientService } from '../src/services/client';

// Mock the SQLite backend so we don't try to write to actual native SQLite in Node tests
vi.mock('../src/storage/SQLiteKVAdapter', () => {
  return {
    SQLiteKVAdapter: class {
      store = new Map();
      async init() {}
      async get(key: string) { return this.store.get(key) || null; }
      async set(key: string, value: any) { this.store.set(key, value); }
      async remove(key: string) { this.store.delete(key); }
      async getAll() { return Array.from(this.store.values()); }
      async clear() { this.store.clear(); }
    }
  };
});

describe('OCR Pipeline Integration', () => {
  beforeEach(async () => {
    await clientService.clearHistory();
    vi.clearAllMocks();
  });

  it('successful OCR result extraction, parsing, and saving', async () => {
    // 1. Mock the provider to return fake OCR evidence
    const mockEvidence = {
      rawText: "Ingredients: Water, Sugar, Citric Acid, INS 211. Nutrition Facts: Energy 40kcal, Total Sugars 10g",
      confidence: 0.9,
      provider: 'mock_vision',
      processingTimeMs: 100
    };

    // We can spy on the provider's recognize method directly or just inject the raw text directly into analyzeOCRTextAndSave
    const result = await analyzeOCRTextAndSave(mockEvidence.rawText, mockEvidence);

    // 2. Verify ProductInput was assembled correctly
    expect(result.scanRecord.productInput.provenance.sourceType).toBe('label_ocr');
    expect(result.scanRecord.productInput.parsedIngredients.length).toBeGreaterThan(0);
    expect(result.scanRecord.productInput.parsedIngredients[0].canonicalName.toLowerCase()).toBe('water');
    
    // Check additive detection
    expect(result.scanRecord.productInput.detectedAdditives).toBeDefined();
    
    // Check nutrition structure
    expect(result.scanRecord.productInput.nutrition).toBeDefined();

    // 3. Verify it was scored
    expect(result.analysisResult).toBeDefined();
    expect(result.analysisResult.grade).toBeDefined();

    // 4. Verify it was saved to history
    const history = await clientService.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(result.scanRecord.id);
  });

  it('handles empty OCR result without crashing', async () => {
    const mockEvidence = {
      rawText: "    \n   ",
      confidence: 0.0,
      provider: 'mock_vision',
      processingTimeMs: 10
    };

    const result = await analyzeOCRTextAndSave(mockEvidence.rawText, mockEvidence);
    
    // It should still return a result, but with empty fields
    expect(result.scanRecord.productInput.parsedIngredients.length).toBe(0);
    expect(result.scanRecord.productInput.nutrition.energyKcal?.value).toBeNull();
    // Default engine score for empty product might be A
    expect(result.analysisResult.grade).toBeDefined();
  });

  it('handles network failure during OCR extraction', async () => {
    // Force the vision pipeline to fail
    const originalProvider = visionPipeline.getProvider();
    
    const mockProvider = {
      name: 'mock',
      isAvailable: () => true,
      recognize: vi.fn().mockRejectedValue(new Error('Network offline'))
    };
    
    // Temporarily replace provider (using any cast for testing)
    (visionPipeline as any).provider = mockProvider;
    
    await expect(visionPipeline.extractOCREvidence('data:image/jpeg;base64,abcd')).rejects.toThrow('Network offline');
    
    // Restore
    (visionPipeline as any).provider = originalProvider;
  });
});
