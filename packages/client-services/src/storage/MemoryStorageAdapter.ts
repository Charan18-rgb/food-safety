import { IStorageAdapter } from './IStorageAdapter.js';

export class MemoryStorageAdapter<T> implements IStorageAdapter<T> {
  private store: Map<string, T> = new Map();

  async get(key: string): Promise<T | null> {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  async set(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async getAll(): Promise<T[]> {
    return Array.from(this.store.values());
  }

  async count(): Promise<number> {
    return this.store.size;
  }
}
