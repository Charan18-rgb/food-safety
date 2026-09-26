import { describe, it, expect, beforeEach, vi, assert } from 'vitest';
import { SQLiteKVAdapter } from '../src/storage/SQLiteKVAdapter';

const mockStore = new Map<string, string>();
let forceStorageError = false;

vi.mock('expo-sqlite/kv-store', () => {
  return {
    SQLiteStorage: vi.fn().mockImplementation(function() {
      return {
        getItemAsync: vi.fn(async (key: string) => {
          if (forceStorageError) throw new Error("Mock Storage Error");
          return mockStore.has(key) ? mockStore.get(key) : null;
        }),
        setItemAsync: vi.fn(async (key: string, value: string) => { 
          if (forceStorageError) throw new Error("Mock Storage Error");
          mockStore.set(key, value); 
        }),
        removeItemAsync: vi.fn(async (key: string) => { 
          if (forceStorageError) throw new Error("Mock Storage Error");
          mockStore.delete(key); 
          return true; 
        }),
      };
    })
  };
});

describe('SQLiteKVAdapter', () => {
  let adapter: SQLiteKVAdapter<any>;

  beforeEach(() => {
    mockStore.clear();
    forceStorageError = false;
    adapter = new SQLiteKVAdapter<any>({
      dbName: 'test.db',
      namespace: 'test'
    });
  });

  it('1. set/get', async () => {
    await adapter.set('key1', { foo: 'bar' });
    expect(await adapter.get('key1')).toEqual({ foo: 'bar' });
  });

  it('2. missing key -> null', async () => {
    expect(await adapter.get('missing')).toBeNull();
  });

  it('3. overwrite does not duplicate key', async () => {
    await adapter.set('key1', { val: 1 });
    await adapter.set('key1', { val: 2 });
    expect(await adapter.get('key1')).toEqual({ val: 2 });
    expect(await adapter.count()).toBe(1);
  });

  it('4. delete removes namespaced key and updates index', async () => {
    await adapter.set('key1', 123);
    await adapter.delete('key1');
    expect(await adapter.get('key1')).toBeNull();
    expect(await adapter.count()).toBe(0);
  });

  it('5. getAll returns FoodGrade-owned values only', async () => {
    await adapter.set('key1', 1);
    await adapter.set('key2', 2);
    const all = await adapter.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContainEqual(1);
    expect(all).toContainEqual(2);
  });

  it('6. count returns FoodGrade-owned keys only', async () => {
    await adapter.set('key1', 1);
    await adapter.set('key2', 2);
    expect(await adapter.count()).toBe(2);
  });

  it('7-9. clear removes only FoodGrade entries and preserves unrelated keys', async () => {
    await adapter.set('k1', 'val');
    mockStore.set('otherNamespace:key', 'someValue');
    mockStore.set('foodgrade:other:index', '["key"]');
    
    await adapter.clear();
    
    expect(await adapter.count()).toBe(0);
    expect(mockStore.has('otherNamespace:key')).toBe(true);
    expect(mockStore.has('foodgrade:other:index')).toBe(true);
  });

  it('10. JSON serialization for generic values', async () => {
    await adapter.set('k', { complex: [1, 2, 3] });
    expect(mockStore.get('foodgrade:test:k')).toBe('{"complex":[1,2,3]}');
    expect(await adapter.get('k')).toEqual({ complex: [1, 2, 3] });
  });

  it('11. malformed JSON -> throw', async () => {
    await adapter.set('k', 1);
    mockStore.set('foodgrade:test:k', '{"badJson');
    await expect(adapter.get('k')).rejects.toThrow();
  });

  it('12. serialization error -> throw', async () => {
    const circular: any = {};
    circular.self = circular;
    await expect(adapter.set('k', circular)).rejects.toThrow();
  });

  it('13. storage failure -> throw/report a real error', async () => {
    forceStorageError = true;
    await expect(adapter.get('k')).rejects.toThrow("Mock Storage Error");
    await expect(adapter.set('k', 1)).rejects.toThrow("Mock Storage Error");
  });

  it('14. repeated writes', async () => {
    for (let i = 0; i < 5; i++) {
      await adapter.set('k', i);
    }
    expect(await adapter.get('k')).toBe(4);
    expect(await adapter.count()).toBe(1);
  });

  it('15. repeated delete (missing key is safe)', async () => {
    await adapter.delete('k'); // safe
    await adapter.set('k', 1);
    await adapter.delete('k');
    await adapter.delete('k'); // safe
    expect(await adapter.count()).toBe(0);
  });

  it('16. index consistency: throw if value exists but index missing', async () => {
    await adapter.set('k', 1);
    mockStore.delete('foodgrade:test:k');
    await expect(adapter.getAll()).rejects.toThrow(/missing from storage/);
  });

  it('17. concurrency/order consistency', async () => {
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(adapter.set(`key_${i}`, i));
    }
    await Promise.all(promises);
    expect(await adapter.count()).toBe(50);
  });
});
