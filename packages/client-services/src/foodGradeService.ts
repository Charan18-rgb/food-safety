import { ProductInput, AnalysisResult } from '@foodgrade/shared-types';
import { evaluateProduct } from '@foodgrade/engine';
import { ScanHistoryRecord, ScanHistoryFilter, ImportResult, OpenFoodFactsConfig } from './types.js';
import { IScanHistoryRepository, ScanHistoryRepository } from './storage/ScanHistoryRepository.js';
import { IOpenFoodFactsClient } from './off/IOpenFoodFactsClient.js';
import { OpenFoodFactsClient } from './off/OpenFoodFactsClient.js';
import { OfflineProductCache } from './storage/OfflineProductCache.js';
import { exportHistoryToJSON, exportHistoryToCSV, importHistoryFromJSON } from './export/exportService.js';

export interface FoodGradeServiceConfig {
  offConfig?: OpenFoodFactsConfig;
  historyRepository?: IScanHistoryRepository;
  offClient?: IOpenFoodFactsClient;
  cache?: OfflineProductCache;
}

export class FoodGradeClientService {
  private historyRepo: IScanHistoryRepository;
  private offClient: IOpenFoodFactsClient;

  constructor(config: FoodGradeServiceConfig = {}) {
    this.historyRepo = config.historyRepository || new ScanHistoryRepository();
    this.offClient = config.offClient || new OpenFoodFactsClient(config.offConfig, config.cache);
  }

  /**
   * Looks up product by barcode on Open Food Facts, analyzes it via FoodGrade Engine,
   * saves it to scan history, and returns the combined result.
   * @param signal - optional AbortSignal. When aborted, throws with name 'AbortError'.
   *   Critically: history is NOT saved if the signal was aborted before the save step.
   */
  async lookupBarcodeAndAnalyze(barcode: string, signal?: AbortSignal): Promise<{
    productInput: ProductInput;
    analysisResult: AnalysisResult;
    scanRecord: ScanHistoryRecord;
  } | null> {
    if (signal?.aborted) {
      const err = new Error('Cancelled'); err.name = 'AbortError'; throw err;
    }

    const result = await this.offClient.lookupBarcodeDetailed(barcode, signal);
    if (!result.success) {
      if (result.error.name === 'AbortError') {
        const err = new Error('Cancelled'); err.name = 'AbortError'; throw err;
      }
      if (result.error.name === 'ProductNotFoundError') {
        return null; // Keep returning null for not found
      }
      throw result.error; // Throw network or rate limit errors
    }

    // Guard: do not score or save if cancelled between network response and save
    if (signal?.aborted) {
      const err = new Error('Cancelled'); err.name = 'AbortError'; throw err;
    }

    const productInput = result.product;
    const analysisResult = evaluateProduct(productInput);

    // Final guard before the history write — this is the critical side-effect protection
    if (signal?.aborted) {
      const err = new Error('Cancelled'); err.name = 'AbortError'; throw err;
    }

    const scanRecord = await this.saveScan(productInput, analysisResult);

    return {
      productInput,
      analysisResult,
      scanRecord
    };
  }

  /**
   * Evaluates a ProductInput, saves the result to scan history, and returns the created record.
   */
  async analyzeAndSave(
    productInput: ProductInput,
    userNotes?: string,
    isFavorite = false
  ): Promise<{ analysisResult: AnalysisResult; scanRecord: ScanHistoryRecord }> {
    const analysisResult = evaluateProduct(productInput);
    const scanRecord = await this.saveScan(productInput, analysisResult, userNotes, isFavorite);
    return { analysisResult, scanRecord };
  }

  /**
   * Saves a product scan and evaluation to local history repository.
   */
  async saveScan(
    productInput: ProductInput,
    analysisResult: AnalysisResult,
    userNotes?: string,
    isFavorite = false
  ): Promise<ScanHistoryRecord> {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const record: ScanHistoryRecord = {
      id,
      barcode: productInput.barcode,
      productName: productInput.productName,
      brand: productInput.brand,
      category: productInput.category,
      scannedAt: new Date().toISOString(),
      productInput,
      analysisResult,
      isFavorite,
      userNotes,
      sourceType: productInput.provenance.sourceType
    };

    await this.historyRepo.save(record);
    return record;
  }

  async getHistory(filter?: ScanHistoryFilter): Promise<ScanHistoryRecord[]> {
    return this.historyRepo.list(filter);
  }

  async getScanById(id: string): Promise<ScanHistoryRecord | null> {
    return this.historyRepo.getById(id);
  }

  async toggleFavorite(id: string): Promise<boolean> {
    const record = await this.historyRepo.getById(id);
    if (!record) return false;

    const newFav = !record.isFavorite;
    await this.historyRepo.setFavorite(id, newFav);
    return newFav;
  }

  async updateNotes(id: string, notes: string): Promise<void> {
    await this.historyRepo.updateNotes(id, notes);
  }

  async deleteScan(id: string): Promise<void> {
    await this.historyRepo.delete(id);
  }

  async clearHistory(): Promise<void> {
    await this.historyRepo.clearAll();
  }

  async exportHistoryJSON(): Promise<string> {
    const records = await this.historyRepo.list();
    return exportHistoryToJSON(records);
  }

  async exportHistoryCSV(): Promise<string> {
    const records = await this.historyRepo.list();
    return exportHistoryToCSV(records);
  }

  async importHistoryJSON(jsonString: string): Promise<ImportResult> {
    const result = importHistoryFromJSON(jsonString);
    for (const record of result.records) {
      await this.historyRepo.save(record);
    }
    return {
      importedCount: result.importedCount,
      skippedCount: result.skippedCount,
      errors: result.errors
    };
  }
}
