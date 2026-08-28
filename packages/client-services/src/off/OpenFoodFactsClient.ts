import { ProductInput } from '@foodgrade/shared-types';
import { IOpenFoodFactsClient } from './IOpenFoodFactsClient.js';
import { adaptOpenFoodFactsV3Response } from './OpenFoodFactsAdapter.js';
import { OFFV3ProductResponse, OFF_V3_REQUESTED_FIELDS } from './types.js';
import { OfflineProductCache } from '../storage/OfflineProductCache.js';
import { OpenFoodFactsConfig } from '../types.js';
import { normalizeBarcode } from '../utils/barcodeNormalizer.js';
import {
  ProductNotFoundError,
  NetworkTimeoutError,
  NetworkOfflineError,
  RateLimitExceededError,
  InvalidOFFResponseError,
  FoodGradeError
} from '../errors.js';

export const DEFAULT_OFF_BASE_URL = 'https://world.openfoodfacts.org';
export const DEFAULT_OFF_USER_AGENT = 'FoodGrade-India - Web/PWA - Version 1.0 (https://github.com/foodgrade)';
export const DEFAULT_OFF_TIMEOUT_MS = 5000;
export const DEFAULT_OFF_MAX_RETRIES = 2;
export const DEFAULT_OFF_INITIAL_BACKOFF_MS = 200;

export type OFFLookupResult =
  | { success: true; product: ProductInput; source: 'network' | 'cache_fresh' | 'cache_stale' }
  | { success: false; error: FoodGradeError; barcode: string; staleProductFallback?: ProductInput };

export interface OFFClientOptions extends OpenFoodFactsConfig {
  maxRetries?: number;
  initialBackoffMs?: number;
  allowStaleFallbackOnNetworkError?: boolean;
}

/**
 * Open Food Facts API v3 Client with:
 * - Barcode normalization
 * - Fresh / Stale cache management
 * - Stale-cache emergency fallback on network failure
 * - Exponential backoff retry on transient HTTP 5xx / timeouts
 * - Typed error reporting
 */
export class OpenFoodFactsClient implements IOpenFoodFactsClient {
  private baseUrl: string;
  private userAgent: string;
  private timeoutMs: number;
  private maxRetries: number;
  private initialBackoffMs: number;
  private allowStaleFallback: boolean;
  private cache: OfflineProductCache | null;

  constructor(options: OFFClientOptions = {}, cache?: OfflineProductCache) {
    this.baseUrl = (options.baseUrl || DEFAULT_OFF_BASE_URL).replace(/\/+$/, '');
    this.userAgent = options.userAgent || DEFAULT_OFF_USER_AGENT;
    this.timeoutMs = options.timeoutMs || DEFAULT_OFF_TIMEOUT_MS;
    this.maxRetries = options.maxRetries !== undefined ? options.maxRetries : DEFAULT_OFF_MAX_RETRIES;
    this.initialBackoffMs = options.initialBackoffMs !== undefined ? options.initialBackoffMs : DEFAULT_OFF_INITIAL_BACKOFF_MS;
    this.allowStaleFallback = options.allowStaleFallbackOnNetworkError !== false;
    this.cache = cache !== undefined ? cache : new OfflineProductCache();
  }

  /**
   * Performs controlled fetch with exponential backoff on transient errors.
   */
  private async fetchWithRetry(url: string): Promise<Response> {
    let attempt = 0;
    let delay = this.initialBackoffMs;

    while (true) {
      attempt++;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timer);

        // Do NOT retry client errors (400, 404, 422)
        if (response.status === 404 || response.status === 400) {
          return response;
        }

        // Rate limit exceeded (429)
        if (response.status === 429) {
          throw new RateLimitExceededError();
        }

        // Retry on 5xx server errors
        if (response.status >= 500 && attempt <= this.maxRetries) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }

        return response;
      } catch (err) {
        clearTimeout(timer);

        if (err instanceof RateLimitExceededError) {
          throw err;
        }

        const isTimeout = (err as Error).name === 'AbortError';

        // Retry transient network/timeout errors up to maxRetries
        if (attempt <= this.maxRetries) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }

        if (isTimeout) {
          throw new NetworkTimeoutError(url, this.timeoutMs);
        }
        throw new NetworkOfflineError((err as Error).message || 'Network request failed');
      }
    }
  }

  /**
   * Detailed lookup providing execution status, source provenance, and typed errors.
   */
  async lookupBarcodeDetailed(barcode: string): Promise<OFFLookupResult> {
    let cleanBarcode: string;
    try {
      cleanBarcode = normalizeBarcode(barcode);
    } catch (err) {
      return {
        success: false,
        error: err as FoodGradeError,
        barcode
      };
    }

    let staleCandidate: ProductInput | null = null;

    // 1. Check local cache
    if (this.cache) {
      const cacheRes = await this.cache.getWithStatus(cleanBarcode);
      if (cacheRes.status === 'fresh' && cacheRes.data) {
        return {
          success: true,
          product: cacheRes.data,
          source: 'cache_fresh'
        };
      }
      if (cacheRes.status === 'stale' && cacheRes.data) {
        staleCandidate = cacheRes.data;
      }
    }

    // 2. Fetch from Open Food Facts API v3
    const url = `${this.baseUrl}/api/v3/product/${encodeURIComponent(cleanBarcode)}.json?fields=${encodeURIComponent(OFF_V3_REQUESTED_FIELDS)}`;

    try {
      const response = await this.fetchWithRetry(url);

      if (response.status === 404) {
        return {
          success: false,
          error: new ProductNotFoundError(cleanBarcode),
          barcode: cleanBarcode
        };
      }

      if (!response.ok) {
        throw new FoodGradeError(`Open Food Facts API returned HTTP ${response.status}`, `HTTP_${response.status}`);
      }

      let json: OFFV3ProductResponse;
      try {
        json = (await response.json()) as OFFV3ProductResponse;
      } catch (err) {
        throw new InvalidOFFResponseError('Failed to parse Open Food Facts JSON response', err);
      }

      const adapted = adaptOpenFoodFactsV3Response(json);

      if (!adapted) {
        return {
          success: false,
          error: new ProductNotFoundError(cleanBarcode),
          barcode: cleanBarcode
        };
      }

      // 3. Cache successful fresh product
      if (this.cache) {
        await this.cache.set(cleanBarcode, adapted);
      }

      return {
        success: true,
        product: adapted,
        source: 'network'
      };
    } catch (err) {
      // 4. Stale-cache emergency fallback on network failure
      if (this.allowStaleFallback && staleCandidate) {
        return {
          success: true,
          product: staleCandidate,
          source: 'cache_stale'
        };
      }

      return {
        success: false,
        error: err instanceof FoodGradeError ? err : new NetworkOfflineError((err as Error).message),
        barcode: cleanBarcode,
        staleProductFallback: staleCandidate || undefined
      };
    }
  }

  /**
   * Standard IOpenFoodFactsClient interface method.
   */
  async lookupByBarcode(barcode: string): Promise<ProductInput | null> {
    const result = await this.lookupBarcodeDetailed(barcode);
    return result.success ? result.product : null;
  }
}
