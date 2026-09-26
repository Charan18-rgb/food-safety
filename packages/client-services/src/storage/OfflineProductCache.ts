import { ProductInput } from '@foodgrade/shared-types';
import { CachedProduct } from '../types.js';
import { IStorageAdapter } from './IStorageAdapter.js';
import { MemoryStorageAdapter } from './MemoryStorageAdapter.js';
import { IndexedDBAdapter } from './IndexedDBAdapter.js';

export const DEFAULT_PRODUCT_CACHE_FRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days fresh
export const DEFAULT_PRODUCT_CACHE_MAX_STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days stale retention

export type CacheStatus = 'fresh' | 'stale' | 'missing';

export interface CacheResult<T> {
  status: CacheStatus;
  data: T | null;
  cachedAt?: number;
  ageMs?: number;
}

export class OfflineProductCache {
  private adapter: IStorageAdapter<CachedProduct>;
  private freshTTLMs: number;
  private maxStaleMs: number;

  constructor(
    adapter?: IStorageAdapter<CachedProduct>,
    freshTTLMs = DEFAULT_PRODUCT_CACHE_FRESH_TTL_MS,
    maxStaleMs = DEFAULT_PRODUCT_CACHE_MAX_STALE_MS
  ) {
    this.freshTTLMs = freshTTLMs;
    this.maxStaleMs = maxStaleMs;

    if (adapter) {
      this.adapter = adapter;
    } else if (typeof indexedDB !== 'undefined') {
      this.adapter = new IndexedDBAdapter<CachedProduct>({
        dbName: 'foodgrade_cache_db',
        storeName: 'product_cache',
        version: 1
      });
    } else {
      this.adapter = new MemoryStorageAdapter<CachedProduct>();
    }
  }

  /**
   * Evaluates cache entry status with fine-grained fresh/stale/missing semantics.
   */
  async getWithStatus(barcode: string): Promise<CacheResult<ProductInput>> {
    const cached = await this.adapter.get(barcode);
    if (!cached) {
      return { status: 'missing', data: null };
    }

    const now = Date.now();
    const ageMs = now - cached.cachedAt;

    // Use explicit expiresAt if available, otherwise compute from ttlMs/freshTTLMs
    const expiry = cached.expiresAt || (cached.cachedAt + (cached.ttlMs || this.freshTTLMs));
    const isFresh = now <= expiry;

    // 1. Fresh: within fresh TTL
    if (isFresh) {
      return {
        status: 'fresh',
        data: cached.productInput, // May be null for negative caching
        cachedAt: cached.cachedAt,
        ageMs
      };
    }

    // 2. Stale: beyond fresh TTL but within maximum stale retention
    // Note: Negative cache (data: null) is never considered "stale fallback", only missing.
    if (ageMs <= this.maxStaleMs && cached.productInput !== null) {
      return {
        status: 'stale',
        data: cached.productInput,
        cachedAt: cached.cachedAt,
        ageMs
      };
    }

    // 3. Expired beyond max stale window: purge and report missing
    await this.adapter.delete(barcode);
    return { status: 'missing', data: null };
  }

  /**
   * Returns data only if it is strictly fresh.
   * Can return null if missing OR if there is a fresh negative cache.
   * To distinguish, check the negative cache explicitly if needed.
   */
  async get(barcode: string): Promise<ProductInput | null> {
    const res = await this.getWithStatus(barcode);
    return res.status === 'fresh' ? res.data : null;
  }

  /**
   * Check if there is a negative cache (recently failed lookup).
   */
  async isNegativeCache(barcode: string): Promise<boolean> {
    const res = await this.getWithStatus(barcode);
    return res.status === 'fresh' && res.data === null;
  }

  /**
   * Returns data if available (either fresh or stale fallback).
   */
  async getStaleFallback(barcode: string): Promise<{ data: ProductInput; isStale: boolean } | null> {
    const res = await this.getWithStatus(barcode);
    if (res.data) {
      return {
        data: res.data,
        isStale: res.status === 'stale'
      };
    }
    return null;
  }

  async set(barcode: string, productInput: ProductInput | null, ttlMs?: number): Promise<void> {
    const now = Date.now();
    const effectiveTtl = ttlMs || this.freshTTLMs;
    const cached: CachedProduct = {
      barcode,
      productInput,
      cachedAt: now,
      ttlMs: effectiveTtl,
      expiresAt: now + effectiveTtl
    };
    await this.adapter.set(barcode, cached);
  }

  async delete(barcode: string): Promise<void> {
    await this.adapter.delete(barcode);
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  async count(): Promise<number> {
    return this.adapter.count();
  }
}
