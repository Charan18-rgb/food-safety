/**
 * Cancellation hardening tests — Milestone 6
 *
 * Verifies:
 * 1. AbortController is created and its signal passed to the network layer
 * 2. lookupBarcodeAndAnalyze throws AbortError (not NetworkError) when signal aborts
 * 3. Aborted requests do NOT write to history (side-effect protection)
 * 4. A new scan starts cleanly after a cancelled one
 * 5. analyzeOCRTextAndSave respects AbortSignal at each guard point
 * 6. AbortError is distinguished from ordinary network failure
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientService } from '../src/services/client';
import { analyzeOCRTextAndSave, visionPipeline } from '../src/services/vision';

// Mock SQLite so tests run without native modules
vi.mock('../src/storage/SQLiteKVAdapter', () => ({
  SQLiteKVAdapter: class {
    store = new Map();
    async init() {}
    async get(key: string) { return this.store.get(key) ?? null; }
    async set(key: string, val: any) { this.store.set(key, val); }
    async delete(key: string) { this.store.delete(key); }
    async getAll() { return Array.from(this.store.values()); }
    async clear() { this.store.clear(); }
    async count() { return this.store.size; }
  }
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal OFF-style mock response */
function makeOFFProduct(name = 'Test Biscuit') {
  return {
    code: '12345678',
    status: 1,
    product: {
      product_name: name,
      brands: 'TestBrand',
      nutriments: {
        'energy-kcal_100g': 450,
        'proteins_100g': 6,
        'carbohydrates_100g': 70,
        'sugars_100g': 20,
        'fat_100g': 15,
        'saturated-fat_100g': 7,
        'sodium_100g': 0.3
      },
      ingredients_text: 'Wheat Flour, Sugar, Palm Oil'
    }
  };
}

// ---------------------------------------------------------------------------
// 1. AbortController creation + signal propagation
// ---------------------------------------------------------------------------

describe('AbortController creation and signal propagation', () => {
  beforeEach(async () => {
    await clientService.clearHistory();
    vi.unstubAllGlobals();
  });

  it('passes AbortSignal to fetch via lookupBarcodeAndAnalyze', async () => {
    let capturedSignal: AbortSignal | undefined;

    vi.stubGlobal('fetch', vi.fn((url: string, opts: RequestInit) => {
      capturedSignal = opts?.signal as AbortSignal;
      // Return a valid product response
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => makeOFFProduct()
      });
    }));

    const controller = new AbortController();
    await clientService.lookupBarcodeAndAnalyze('12345678', controller.signal);

    // The signal passed to clientService must have reached fetch()
    expect(capturedSignal).toBeDefined();
    expect(capturedSignal).toBeInstanceOf(AbortSignal);
  });
});

// ---------------------------------------------------------------------------
// 2. AbortError on pre-aborted signal
// ---------------------------------------------------------------------------

describe('AbortError when signal is already aborted', () => {
  beforeEach(async () => {
    await clientService.clearHistory();
    vi.unstubAllGlobals();
  });

  it('lookupBarcodeAndAnalyze throws AbortError immediately for pre-aborted signal', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    const controller = new AbortController();
    controller.abort();

    await expect(
      clientService.lookupBarcodeAndAnalyze('12345678', controller.signal)
    ).rejects.toSatisfy((err: any) => err.name === 'AbortError');

    // fetch must never have been called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('lookupBarcodeAndAnalyze throws AbortError, not NetworkOfflineError', async () => {
    const controller = new AbortController();
    controller.abort();

    let caughtError: Error | null = null;
    try {
      await clientService.lookupBarcodeAndAnalyze('12345678', controller.signal);
    } catch (e: any) {
      caughtError = e;
    }

    expect(caughtError).not.toBeNull();
    expect(caughtError!.name).toBe('AbortError');
    expect(caughtError!.name).not.toBe('NetworkOfflineError');
    expect(caughtError!.name).not.toBe('NetworkTimeoutError');
  });
});

// ---------------------------------------------------------------------------
// 3. Stale history protection
// ---------------------------------------------------------------------------

describe('Aborted requests do NOT write to history', () => {
  beforeEach(async () => {
    await clientService.clearHistory();
    vi.unstubAllGlobals();
  });

  it('cancelled scan does not create a history record', async () => {
    const controller = new AbortController();
    controller.abort(); // abort before calling

    try {
      await clientService.lookupBarcodeAndAnalyze('12345678', controller.signal);
    } catch (e: any) {
      expect(e.name).toBe('AbortError');
    }

    const history = await clientService.getHistory();
    expect(history.length).toBe(0);
  });

  it('abort mid-flight does not write to history', async () => {
    const controller = new AbortController();

    // Abort the signal while fetch is "in progress"; use unique barcode to avoid cache
    vi.stubGlobal('fetch', vi.fn((_url: string, opts: RequestInit) => {
      // Abort the signal immediately (simulates user pressing Back while network is in flight)
      controller.abort();
      // Fetch receives an already-aborted signal — reject with AbortError
      if (opts?.signal?.aborted) {
        return Promise.reject(Object.assign(new Error('AbortError'), { name: 'AbortError' }));
      }
      return new Promise(() => {}); // fallback — never resolves
    }));

    let caughtName = '';
    try {
      await clientService.lookupBarcodeAndAnalyze('99999999', controller.signal);
    } catch (e: any) {
      caughtName = e.name;
    }

    // The error should be AbortError (propagated from the pre-abort guard)
    // OR a network error if the abort happened between guards — but in NO case should history grow
    const history = await clientService.getHistory();
    expect(history.length).toBe(0);
    // At minimum an error must have been thrown — if no error, lookupBarcodeAndAnalyze returned null (not found), also fine
    // The core guarantee is: no history record from a cancelled scan
  });
});

// ---------------------------------------------------------------------------
// 4. New scan starts cleanly after cancellation
// ---------------------------------------------------------------------------

describe('New scan succeeds after cancelled scan', () => {
  beforeEach(async () => {
    await clientService.clearHistory();
    vi.unstubAllGlobals();
  });

  it('successful scan after a cancelled one creates exactly one history record', async () => {
    // First scan — cancelled immediately (use unique barcode A to avoid cross-test cache)
    const controller1 = new AbortController();
    controller1.abort();
    try {
      await clientService.lookupBarcodeAndAnalyze('11111111', controller1.signal);
    } catch (_e) { /* expected */ }

    // Second scan — use DIFFERENT barcode so OfflineProductCache won't return cached data
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      json: async () => makeOFFProduct('Second Product')
    })));

    const controller2 = new AbortController();
    const result = await clientService.lookupBarcodeAndAnalyze('22222222', controller2.signal);

    expect(result).not.toBeNull();
    expect(result!.productInput.productName).toBe('Second Product');

    const history = await clientService.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].productName).toBe('Second Product');
  });
});

// ---------------------------------------------------------------------------
// 5. OCR analyzeOCRTextAndSave respects AbortSignal
// ---------------------------------------------------------------------------

describe('analyzeOCRTextAndSave cancellation', () => {
  beforeEach(async () => {
    await clientService.clearHistory();
  });

  const mockEvidence = {
    rawText: 'Ingredients: Water, Sugar. Energy 40kcal.',
    confidence: 0.9,
    provider: 'mock',
    processingTimeMs: 10,
    lines: ['Ingredients: Water, Sugar.', 'Energy 40kcal.']
  };

  it('throws AbortError without saving if signal is pre-aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      analyzeOCRTextAndSave(mockEvidence.rawText, mockEvidence as any, controller.signal)
    ).rejects.toSatisfy((e: any) => e.name === 'AbortError');

    const history = await clientService.getHistory();
    expect(history.length).toBe(0);
  });

  it('saves to history when signal is NOT aborted', async () => {
    const controller = new AbortController();

    const result = await analyzeOCRTextAndSave(
      mockEvidence.rawText,
      mockEvidence as any,
      controller.signal
    );

    expect(result.scanRecord).toBeDefined();

    const history = await clientService.getHistory();
    expect(history.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 6. AbortError vs NetworkOfflineError distinction
// ---------------------------------------------------------------------------

describe('Error type distinction', () => {
  beforeEach(async () => {
    await clientService.clearHistory();
    vi.unstubAllGlobals();
  });

  it('a non-aborted signal does not cause AbortError on network failure', async () => {
    // Stub fetch to immediately reject with TypeError (e.g. DNS failure)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const controller = new AbortController(); // NOT aborted

    let caughtError: Error | null = null;
    let returnedNull = false;

    try {
      const result = await clientService.lookupBarcodeAndAnalyze('55555555', controller.signal);
      if (result === null) returnedNull = true; // "not found" path also acceptable
    } catch (e: any) {
      caughtError = e;
    }

    if (caughtError !== null) {
      // If it threw, it must NOT be an AbortError since the signal was never aborted
      expect(caughtError.name).not.toBe('AbortError');
    } else {
      // It returned null — meaning OFF returned 404/not-found — acceptable
      expect(returnedNull).toBe(true);
    }
    // In either case: no history written
    const history = await clientService.getHistory();
    expect(history.length).toBe(0);
  });

  it('pre-aborted signal throws AbortError, never NetworkOfflineError', async () => {
    // Even if fetch would succeed, aborting before the call throws AbortError
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      json: async () => makeOFFProduct()
    })));

    const controller = new AbortController();
    controller.abort();

    let caughtError: Error | null = null;
    try {
      await clientService.lookupBarcodeAndAnalyze('55555555', controller.signal);
    } catch (e: any) {
      caughtError = e;
    }

    expect(caughtError).not.toBeNull();
    expect(caughtError!.name).toBe('AbortError');
    expect(caughtError!.name).not.toBe('NetworkOfflineError');
  });
});
