import { describe, it, expect, vi } from 'vitest';
import { adaptOpenFoodFactsV3Response } from '../src/off/OpenFoodFactsAdapter.js';
import { OpenFoodFactsClient } from '../src/off/OpenFoodFactsClient.js';
import { OFFV3ProductResponse } from '../src/off/types.js';
import { MemoryStorageAdapter } from '../src/storage/MemoryStorageAdapter.js';
import { OfflineProductCache } from '../src/storage/OfflineProductCache.js';
import { ProductNotFoundError, RateLimitExceededError, NetworkOfflineError } from '../src/errors.js';

describe('Open Food Facts API v3 Adapter & Provenance', () => {
  it('should transform Open Food Facts v3 payload and set correct fallback provenance', () => {
    const rawOFFV3: OFFV3ProductResponse = {
      code: '8901063012219',
      status: 'success',
      result: {
        id: 'product_found',
        name: 'Product found'
      },
      product: {
        product_name: 'Britannia NutriChoice Digestive',
        product_name_en: 'Britannia NutriChoice Digestive',
        brands: 'Britannia',
        categories: 'Biscuits',
        serving_size: '25 g',
        serving_quantity: 25,
        ingredients_text: 'Whole wheat flour (53.3%), Refined palm oil, Sugar, Invert sugar syrup, Iodised salt, Raising agents (INS 500(ii), INS 503(ii))',
        additives_tags: ['en:e500ii', 'en:e503ii'],
        nutriments: {
          'energy-kcal_100g': 486,
          'proteins_100g': 8.0,
          'carbohydrates_100g': 68.0,
          'sugars_100g': 14.0,
          'added-sugars_100g': 14.0,
          'fat_100g': 20.0,
          'saturated-fat_100g': 9.5,
          'trans-fat_100g': 0.0,
          'fiber_100g': 6.0,
          'sodium_100g': 0.28,
          'salt_100g': 0.70
        }
      }
    };

    const adapted = adaptOpenFoodFactsV3Response(rawOFFV3);
    expect(adapted).toBeDefined();
    expect(adapted?.barcode).toBe('8901063012219');
    expect(adapted?.productName).toBe('Britannia NutriChoice Digestive');

    // Provenance Verification
    expect(adapted?.provenance.sourceType).toBe('open_food_facts');
    expect(adapted?.provenance.observationMode).toBe('fallback');
    expect(adapted?.provenance.rawConfidence).toBe(0.85);
    expect(adapted?.provenance.sourceUri).toBe('https://world.openfoodfacts.org/product/8901063012219');
  });

  it('should return null for v3 "product_not_found" or failure status payloads', () => {
    const notFoundPayload: OFFV3ProductResponse = {
      code: '0000000000000',
      status: 'failure',
      result: {
        id: 'product_not_found',
        name: 'Product not found'
      },
      errors: [{ message: 'Product not found' }]
    };
    expect(adaptOpenFoodFactsV3Response(notFoundPayload)).toBeNull();
  });
});

describe('OpenFoodFactsClient Network, Retry & Stale Fallback', () => {
  it('should retry on transient HTTP 500 error up to maxRetries before succeeding', async () => {
    const mockV3Success: OFFV3ProductResponse = {
      code: '8901234567890',
      status: 'success',
      result: { id: 'product_found' },
      product: {
        product_name: 'Amul Butter',
        brands: 'Amul',
        nutriments: {
          'energy-kcal_100g': 720,
          'fat_100g': 80.0,
          'sodium_100g': 0.8
        }
      }
    };

    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 2) {
        return { ok: false, status: 500 };
      }
      return {
        ok: true,
        status: 200,
        json: async () => mockV3Success
      };
    });
    vi.stubGlobal('fetch', mockFetch);

    const client = new OpenFoodFactsClient({ maxRetries: 2, initialBackoffMs: 10 }, undefined);
    const result = await client.lookupBarcodeDetailed('8901234567890');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.product.productName).toBe('Amul Butter');
      expect(result.source).toBe('network');
    }
    expect(callCount).toBe(2); // Retried once on 500 then succeeded

    vi.unstubAllGlobals();
  });

  it('should NOT retry on HTTP 404 (ProductNotFoundError)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ status: 'failure', result: { id: 'product_not_found' } })
    });
    vi.stubGlobal('fetch', mockFetch);

    const client = new OpenFoodFactsClient({ maxRetries: 3 }, undefined);
    const result = await client.lookupBarcodeDetailed('8909999999999');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ProductNotFoundError);
    }
    expect(mockFetch).toHaveBeenCalledTimes(1); // Exactly 1 call, no retries!

    vi.unstubAllGlobals();
  });

  it('should return typed RateLimitExceededError on HTTP 429', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429
    });
    vi.stubGlobal('fetch', mockFetch);

    const client = new OpenFoodFactsClient({ maxRetries: 1 }, undefined);
    const result = await client.lookupBarcodeDetailed('8901234567890');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(RateLimitExceededError);
    }

    vi.unstubAllGlobals();
  });

  it('should serve stale-cache fallback when network is offline', async () => {
    const cache = new OfflineProductCache(new MemoryStorageAdapter(), 10, 10000); // 10ms fresh, 10s stale

    // Seed cache with a product
    const initialProduct = adaptOpenFoodFactsV3Response({
      code: '8901234567890',
      status: 'success',
      result: { id: 'product_found' },
      product: {
        product_name: 'Cached Stale Atta',
        brands: 'Aashirvaad',
        nutriments: { 'energy-kcal_100g': 360 }
      }
    })!;

    await cache.set('8901234567890', initialProduct);

    // Wait for product to become stale (>10ms)
    await new Promise(r => setTimeout(r, 25));

    // Verify cache status is stale
    const cacheStatus = await cache.getWithStatus('8901234567890');
    expect(cacheStatus.status).toBe('stale');

    // Simulate network offline failure
    const mockFetch = vi.fn().mockRejectedValue(new Error('TypeError: Failed to fetch'));
    vi.stubGlobal('fetch', mockFetch);

    const client = new OpenFoodFactsClient({ maxRetries: 0, allowStaleFallbackOnNetworkError: true }, cache);
    const result = await client.lookupBarcodeDetailed('8901234567890');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.source).toBe('cache_stale');
      expect(result.product.productName).toBe('Cached Stale Atta');
    }

    vi.unstubAllGlobals();
  });

  it('should report NetworkOfflineError when network fails and no stale cache is available', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network down'));
    vi.stubGlobal('fetch', mockFetch);

    const client = new OpenFoodFactsClient({ maxRetries: 0 }, new OfflineProductCache(new MemoryStorageAdapter()));
    const result = await client.lookupBarcodeDetailed('8901234567890');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(NetworkOfflineError);
    }

    vi.unstubAllGlobals();
  });
});
