import { 
  FoodGradeClientService, 
  ScanHistoryRepository, 
  OfflineProductCache, 
  ScanHistoryRecord, 
  CachedProduct 
} from '@foodgrade/client-services';
import { SQLiteKVAdapter } from '../storage/SQLiteKVAdapter';

const historyAdapter = new SQLiteKVAdapter<ScanHistoryRecord>({
  dbName: 'foodgrade_mobile.db',
  namespace: 'history'
});

const cacheAdapter = new SQLiteKVAdapter<CachedProduct>({
  dbName: 'foodgrade_mobile.db',
  namespace: 'cache'
});

const apiBase = process.env.EXPO_PUBLIC_API_URL?.replace(/\/vision\/ocr\/?$/, '') || 'http://127.0.0.1:3000/api/v1';

export const clientService = new FoodGradeClientService({
  historyRepository: new ScanHistoryRepository(historyAdapter),
  cache: new OfflineProductCache(cacheAdapter),
  offConfig: {
    proxyUrl: `${apiBase}/barcode`
  }
});
