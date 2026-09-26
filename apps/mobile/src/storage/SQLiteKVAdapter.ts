import { IStorageAdapter } from '@foodgrade/client-services';
import { SQLiteStorage } from 'expo-sqlite/kv-store';

export interface SQLiteKVConfig {
  dbName: string;
  namespace: string;
}

export class SQLiteKVAdapter<T> implements IStorageAdapter<T> {
  private storage: SQLiteStorage;
  private namespace: string;
  private indexKey: string;
  private indexLock: Promise<void> = Promise.resolve();

  constructor(config: SQLiteKVConfig) {
    this.storage = new SQLiteStorage(config.dbName);
    this.namespace = config.namespace;
    this.indexKey = `foodgrade:${this.namespace}:index`;
  }

  private getKey(key: string): string {
    return `foodgrade:${this.namespace}:${key}`;
  }

  private async withIndexLock<R>(task: () => Promise<R>): Promise<R> {
    const previousLock = this.indexLock;
    let releaseLock: () => void = () => {};
    this.indexLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    try {
      await previousLock;
      return await task();
    } finally {
      releaseLock();
    }
  }

  private async getIndex(): Promise<Set<string>> {
    const indexStr = await this.storage.getItemAsync(this.indexKey);
    if (indexStr === null || indexStr === undefined) {
      return new Set<string>();
    }
    const arr = JSON.parse(indexStr);
    if (!Array.isArray(arr)) {
      throw new Error(`Index ${this.indexKey} is corrupted (not an array)`);
    }
    return new Set<string>(arr);
  }

  private async saveIndex(index: Set<string>): Promise<void> {
    const arr = Array.from(index);
    await this.storage.setItemAsync(this.indexKey, JSON.stringify(arr));
  }

  async get(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);
    const valStr = await this.storage.getItemAsync(fullKey);
    if (valStr === null || valStr === undefined) return null;
    return JSON.parse(valStr) as T;
  }

  async set(key: string, value: T): Promise<void> {
    await this.withIndexLock(async () => {
      const fullKey = this.getKey(key);
      const serialized = JSON.stringify(value);
      if (serialized === undefined) {
         throw new Error("Cannot serialize undefined value");
      }
      await this.storage.setItemAsync(fullKey, serialized);
      
      const index = await this.getIndex();
      if (!index.has(key)) {
        index.add(key);
        await this.saveIndex(index);
      }
    });
  }

  async delete(key: string): Promise<void> {
    await this.withIndexLock(async () => {
      const fullKey = this.getKey(key);
      await this.storage.removeItemAsync(fullKey);
      
      const index = await this.getIndex();
      if (index.has(key)) {
        index.delete(key);
        await this.saveIndex(index);
      }
    });
  }

  async clear(): Promise<void> {
    await this.withIndexLock(async () => {
      const index = await this.getIndex();
      const keysToRemove = Array.from(index).map(k => this.getKey(k));
      
      for (const fullKey of keysToRemove) {
        await this.storage.removeItemAsync(fullKey);
      }
      
      await this.storage.removeItemAsync(this.indexKey);
    });
  }

  async getAll(): Promise<T[]> {
    return await this.withIndexLock(async () => {
      const index = await this.getIndex();
      const results: T[] = [];
      for (const key of index) {
        const valStr = await this.storage.getItemAsync(this.getKey(key));
        if (valStr !== null && valStr !== undefined) {
          results.push(JSON.parse(valStr) as T);
        } else {
          throw new Error(`Data corruption: Key ${key} is in index but missing from storage`);
        }
      }
      return results;
    });
  }

  async count(): Promise<number> {
    return await this.withIndexLock(async () => {
      const index = await this.getIndex();
      return index.size;
    });
  }
}
