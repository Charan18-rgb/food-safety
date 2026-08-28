import { ScanHistoryRecord, ScanHistoryFilter } from '../types.js';
import { IStorageAdapter } from './IStorageAdapter.js';
import { IndexedDBAdapter } from './IndexedDBAdapter.js';
import { MemoryStorageAdapter } from './MemoryStorageAdapter.js';

export interface IScanHistoryRepository {
  save(record: ScanHistoryRecord): Promise<void>;
  getById(id: string): Promise<ScanHistoryRecord | null>;
  getByBarcode(barcode: string): Promise<ScanHistoryRecord | null>;
  list(filter?: ScanHistoryFilter): Promise<ScanHistoryRecord[]>;
  setFavorite(id: string, isFavorite: boolean): Promise<void>;
  updateNotes(id: string, notes: string): Promise<void>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
  count(): Promise<number>;
}

export class ScanHistoryRepository implements IScanHistoryRepository {
  private adapter: IStorageAdapter<ScanHistoryRecord>;

  constructor(adapter?: IStorageAdapter<ScanHistoryRecord>) {
    if (adapter) {
      this.adapter = adapter;
    } else if (typeof indexedDB !== 'undefined') {
      this.adapter = new IndexedDBAdapter<ScanHistoryRecord>({
        dbName: 'foodgrade_history_db',
        storeName: 'scan_history',
        version: 1
      });
    } else {
      this.adapter = new MemoryStorageAdapter<ScanHistoryRecord>();
    }
  }

  async save(record: ScanHistoryRecord): Promise<void> {
    await this.adapter.set(record.id, record);
  }

  async getById(id: string): Promise<ScanHistoryRecord | null> {
    return this.adapter.get(id);
  }

  async getByBarcode(barcode: string): Promise<ScanHistoryRecord | null> {
    const all = await this.adapter.getAll();
    return all.find(r => r.barcode === barcode) || null;
  }

  async list(filter?: ScanHistoryFilter): Promise<ScanHistoryRecord[]> {
    let records = await this.adapter.getAll();

    // Sort descending by scannedAt date (newest first)
    records.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());

    if (!filter) return records;

    if (filter.query) {
      const q = filter.query.toLowerCase().trim();
      records = records.filter(r =>
        r.productName.toLowerCase().includes(q) ||
        (r.brand && r.brand.toLowerCase().includes(q)) ||
        (r.barcode && r.barcode.includes(q))
      );
    }

    if (filter.grades && filter.grades.length > 0) {
      const gradeSet = new Set(filter.grades);
      records = records.filter(r => gradeSet.has(r.analysisResult.grade));
    }

    if (filter.category) {
      const cat = filter.category.toLowerCase();
      records = records.filter(r => r.category && r.category.toLowerCase() === cat);
    }

    if (filter.onlyFavorites) {
      records = records.filter(r => r.isFavorite);
    }

    if (filter.fromDate) {
      const fromTime = new Date(filter.fromDate).getTime();
      records = records.filter(r => new Date(r.scannedAt).getTime() >= fromTime);
    }

    if (filter.toDate) {
      const toTime = new Date(filter.toDate).getTime();
      records = records.filter(r => new Date(r.scannedAt).getTime() <= toTime);
    }

    const offset = filter.offset || 0;
    const limit = filter.limit || records.length;

    return records.slice(offset, offset + limit);
  }

  async setFavorite(id: string, isFavorite: boolean): Promise<void> {
    const record = await this.getById(id);
    if (record) {
      record.isFavorite = isFavorite;
      await this.save(record);
    }
  }

  async updateNotes(id: string, notes: string): Promise<void> {
    const record = await this.getById(id);
    if (record) {
      record.userNotes = notes;
      await this.save(record);
    }
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(id);
  }

  async clearAll(): Promise<void> {
    await this.adapter.clear();
  }

  async count(): Promise<number> {
    return this.adapter.count();
  }
}
