import {
  ProductInput,
  AnalysisResult,
  DataSourceType,
  FoodGrade
} from '@foodgrade/shared-types';

export interface ScanHistoryRecord {
  id: string;
  barcode?: string;
  productName: string;
  brand?: string;
  category?: string;
  scannedAt: string; // ISO datetime
  productInput: ProductInput;
  analysisResult: AnalysisResult;
  isFavorite: boolean;
  userNotes?: string;
  sourceType: DataSourceType;
}

export interface ScanHistoryFilter {
  query?: string;
  grades?: FoodGrade[];
  category?: string;
  onlyFavorites?: boolean;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface CachedProduct {
  barcode: string;
  productInput: ProductInput;
  cachedAt: number; // timestamp in ms
  ttlMs: number;
}

export interface OpenFoodFactsConfig {
  baseUrl?: string;
  userAgent?: string;
  timeoutMs?: number;
  cacheTTLMs?: number;
}

export interface ImportResult {
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
