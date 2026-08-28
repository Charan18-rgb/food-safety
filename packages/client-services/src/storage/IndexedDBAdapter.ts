import { IStorageAdapter } from './IStorageAdapter.js';
import { MemoryStorageAdapter } from './MemoryStorageAdapter.js';
import { StorageError } from '../errors.js';

export interface IndexedDBConfig {
  dbName: string;
  storeName: string;
  version?: number;
  onFallbackActivated?: (reason: string) => void;
}

export class IndexedDBAdapter<T> implements IStorageAdapter<T> {
  private dbName: string;
  private storeName: string;
  private version: number;
  private onFallbackActivated?: (reason: string) => void;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private fallbackAdapter: MemoryStorageAdapter<T> | null = null;
  private fallbackReason: string | null = null;

  constructor(config: IndexedDBConfig) {
    this.dbName = config.dbName;
    this.storeName = config.storeName;
    this.version = config.version || 1;
    this.onFallbackActivated = config.onFallbackActivated;

    if (typeof indexedDB === 'undefined') {
      this.activateFallback('IndexedDB global is undefined in this runtime environment');
    }
  }

  private activateFallback(reason: string): void {
    if (!this.fallbackAdapter) {
      this.fallbackAdapter = new MemoryStorageAdapter<T>();
      this.fallbackReason = reason;
      if (this.onFallbackActivated) {
        this.onFallbackActivated(reason);
      }
    }
  }

  public isUsingFallback(): boolean {
    return this.fallbackAdapter !== null;
  }

  public getFallbackReason(): string | null {
    return this.fallbackReason;
  }

  public getStorageType(): 'indexeddb' | 'memory' {
    return this.fallbackAdapter !== null ? 'memory' : 'indexeddb';
  }

  private getFallback(): MemoryStorageAdapter<T> {
    if (!this.fallbackAdapter) {
      this.activateFallback('Manual fallback requested');
    }
    return this.fallbackAdapter!;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.fallbackAdapter) {
      throw new StorageError(`IndexedDB fallback is active: ${this.fallbackReason}`);
    }

    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.version);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          const reason = `IndexedDB open error: ${request.error?.message || 'Unknown error'}`;
          this.activateFallback(reason);
          reject(new StorageError(reason, request.error));
        };
      } catch (err) {
        const reason = `IndexedDB exception during open: ${(err as Error).message}`;
        this.activateFallback(reason);
        reject(new StorageError(reason, err));
      }
    });

    return this.dbPromise;
  }

  async get(key: string): Promise<T | null> {
    if (this.fallbackAdapter) {
      return this.fallbackAdapter.get(key);
    }

    try {
      const db = await this.getDB();
      return new Promise<T | null>((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => {
          this.activateFallback(`Read error: ${req.error?.message}`);
          resolve(this.getFallback().get(key));
        };
      });
    } catch {
      return this.getFallback().get(key);
    }
  }

  async set(key: string, value: T): Promise<void> {
    if (this.fallbackAdapter) {
      return this.fallbackAdapter.set(key, value);
    }

    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(value, key);

        req.onsuccess = () => resolve();
        req.onerror = () => {
          this.activateFallback(`Write error: ${req.error?.message}`);
          this.getFallback().set(key, value).then(resolve, reject);
        };
      });
    } catch {
      return this.getFallback().set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    if (this.fallbackAdapter) {
      return this.fallbackAdapter.delete(key);
    }

    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => {
          this.activateFallback(`Delete error: ${req.error?.message}`);
          this.getFallback().delete(key).then(resolve, reject);
        };
      });
    } catch {
      return this.getFallback().delete(key);
    }
  }

  async clear(): Promise<void> {
    if (this.fallbackAdapter) {
      return this.fallbackAdapter.clear();
    }

    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => {
          this.activateFallback(`Clear error: ${req.error?.message}`);
          this.getFallback().clear().then(resolve, reject);
        };
      });
    } catch {
      return this.getFallback().clear();
    }
  }

  async getAll(): Promise<T[]> {
    if (this.fallbackAdapter) {
      return this.fallbackAdapter.getAll();
    }

    try {
      const db = await this.getDB();
      return new Promise<T[]>((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => {
          this.activateFallback(`GetAll error: ${req.error?.message}`);
          resolve(this.getFallback().getAll());
        };
      });
    } catch {
      return this.getFallback().getAll();
    }
  }

  async count(): Promise<number> {
    if (this.fallbackAdapter) {
      return this.fallbackAdapter.count();
    }

    try {
      const db = await this.getDB();
      return new Promise<number>((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.count();

        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => {
          this.activateFallback(`Count error: ${req.error?.message}`);
          resolve(this.getFallback().count());
        };
      });
    } catch {
      return this.getFallback().count();
    }
  }
}
