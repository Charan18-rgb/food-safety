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
  proxyUrl?: string;
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
  private proxyUrl?: string;

  constructor(options: OFFClientOptions = {}, cache?: OfflineProductCache) {
    this.baseUrl = (options.baseUrl || DEFAULT_OFF_BASE_URL).replace(/\/+$/, '');
    this.userAgent = options.userAgent || DEFAULT_OFF_USER_AGENT;
    this.timeoutMs = options.timeoutMs || DEFAULT_OFF_TIMEOUT_MS;
    this.maxRetries = options.maxRetries !== undefined ? options.maxRetries : DEFAULT_OFF_MAX_RETRIES;
    this.initialBackoffMs = options.initialBackoffMs !== undefined ? options.initialBackoffMs : DEFAULT_OFF_INITIAL_BACKOFF_MS;
    this.allowStaleFallback = options.allowStaleFallbackOnNetworkError !== false;
    this.proxyUrl = options.proxyUrl?.replace(/\/+$/, '');
    this.cache = cache !== undefined ? cache : new OfflineProductCache();
  }

  /**
   * Performs controlled fetch with exponential backoff on transient errors.
   * @param callerSignal - optional AbortSignal from the caller (user cancellation).
   *   Distinct from the per-attempt timeout controller created internally.
   *   When callerSignal aborts, the error is immediately re-thrown as-is (AbortError)
   *   without being reclassified as a timeout.
   */
  private async fetchWithRetry(url: string, callerSignal?: AbortSignal): Promise<Response> {
    // Fail fast before the first network attempt if already cancelled
    if (callerSignal?.aborted) {
      throw new DOMException('Cancelled before fetch', 'AbortError');
    }

    let attempt = 0;
    let delay = this.initialBackoffMs;

    while (true) {
      // Check caller signal before each retry attempt
      if (callerSignal?.aborted) {
        throw new DOMException('Cancelled during retry', 'AbortError');
      }

      attempt++;

      // Merge: timeout controller + optional caller signal using AbortSignal.any() when available,
      // otherwise fall back to manual forwarding.
      const timeoutController = new AbortController();
      const timer = setTimeout(() => timeoutController.abort(), this.timeoutMs);

      let mergedSignal: AbortSignal;
      if (callerSignal) {
        // Abort the timeout controller if the caller cancels, so fetch unblocks immediately
        const forwardCancel = () => timeoutController.abort();
        callerSignal.addEventListener('abort', forwardCancel, { once: true });
        mergedSignal = timeoutController.signal;
        // Clean up listener on timer expiry
        const originalAbort = timeoutController.abort.bind(timeoutController);
        timeoutController.abort = () => {
          callerSignal.removeEventListener('abort', forwardCancel);
          originalAbort();
        };
      } else {
        mergedSignal = timeoutController.signal;
      }

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/json'
          },
          signal: mergedSignal
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

        // If the CALLER cancelled, propagate the AbortError immediately — do not retry,
        // do not reclassify as NetworkTimeoutError.
        if (callerSignal?.aborted) {
          throw new DOMException('Request cancelled by caller', 'AbortError');
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
   * @param signal - optional AbortSignal for caller-driven cancellation.
   */
  async lookupBarcodeDetailed(barcode: string, signal?: AbortSignal): Promise<OFFLookupResult> {
    if (signal?.aborted) {
      return {
        success: false,
        error: new FoodGradeError('Cancelled', 'AbortError'),
        barcode
      };
    }

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
      
      // Check negative cache
      if (cacheRes.status === 'fresh' && cacheRes.data === null) {
        return {
          success: false,
          error: new ProductNotFoundError(cleanBarcode),
          barcode: cleanBarcode
        };
      }
      
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
      const response = await this.fetchWithRetry(url, signal);

      if (response.status === 404) {
        if (this.proxyUrl) {
          try {
            const proxyRes = await this.fetchWithRetry(`${this.proxyUrl}/${cleanBarcode}`, signal);
            if (proxyRes.ok) {
              const proxyJson = await proxyRes.json();
              if (proxyJson.success && proxyJson.product) {
                if (this.cache) await this.cache.set(cleanBarcode, proxyJson.product);
                return { success: true, product: proxyJson.product, source: 'network' };
              }
            }
          } catch (e) {
            // Ignore proxy errors and just fall through to ProductNotFoundError
          }
        }
        
        if (this.cache) {
          // Negative cache for 2 hours
          await this.cache.set(cleanBarcode, null, 2 * 60 * 60 * 1000);
        }
        
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
