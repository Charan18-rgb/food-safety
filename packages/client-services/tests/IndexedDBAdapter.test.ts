import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import { IndexedDBAdapter } from '../src/storage/IndexedDBAdapter';
import 'fake-indexeddb/auto';

describe('IndexedDBAdapter', () => {
  test('Fresh DB initializes required stores', async () => {
    const adapter = new IndexedDBAdapter({ dbName: 'test_db_fresh', storeName: 'test_store' });
    await adapter.set('key', { data: 1 });
    const val = await adapter.get('key');
    expect(val).toEqual({ data: 1 });
  });

  test('Write and Read functionality', async () => {
    const adapter = new IndexedDBAdapter({ dbName: 'test_db_rw', storeName: 'rw_store' });
    await adapter.set('item1', { name: 'Item 1' });
    const read = await adapter.get('item1');
    expect(read).toEqual({ name: 'Item 1' });
  });

  test('Concurrent initialization', async () => {
    const adapter1 = new IndexedDBAdapter({ dbName: 'test_db_concurrent', storeName: 'conc_store' });
    const adapter2 = new IndexedDBAdapter({ dbName: 'test_db_concurrent', storeName: 'conc_store' });
    
    await Promise.all([
      adapter1.set('a', 1),
      adapter2.set('b', 2),
      adapter1.get('a'),
      adapter2.get('b')
    ]);

    expect(await adapter1.get('a')).toBe(1);
    expect(await adapter2.get('b')).toBe(2);
  });
});

