import { z } from 'zod';
import { ScanHistoryRecord, ImportResult } from '../types.js';
import { FoodGradeSchema } from '@foodgrade/shared-types';

/**
 * Strict schema for validating imported ScanHistoryRecords.
 */
export const ScanHistoryRecordImportSchema = z.object({
  id: z.string().min(1, 'ID cannot be empty'),
  barcode: z.string().optional(),
  productName: z.string().min(1, 'Product name cannot be empty'),
  brand: z.string().optional(),
  category: z.string().optional(),
  scannedAt: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'scannedAt must be a valid ISO datetime string'
  }),
  productInput: z.object({
    productName: z.string().min(1),
    barcode: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    nutrition: z.object({
      basis: z.enum(['per_100g', 'per_100ml', 'per_serving'])
    }).passthrough(),
    rawIngredientsText: z.string().optional(),
    parsedIngredients: z.array(z.any()).default([]),
    detectedAdditives: z.array(z.any()).default([]),
    provenance: z.object({
      sourceType: z.enum(['open_food_facts', 'label_ocr', 'user_manual', 'verified_database', 'custom_api'])
    }).passthrough()
  }).passthrough(),
  analysisResult: z.object({
    algorithmVersion: z.string().min(1),
    score: z.number().min(0, 'Score must be >= 0').max(100, 'Score must be <= 100'),
    grade: FoodGradeSchema,
    pillarScores: z.object({
      nutritionScore: z.number().min(0).max(100),
      ingredientScore: z.number().min(0).max(100),
      additiveScore: z.number().min(0).max(100)
    }),
    positives: z.array(z.any()).default([]),
    warnings: z.array(z.any()).default([]),
    detectedIngredients: z.array(z.any()).default([]),
    detectedAdditives: z.array(z.any()).default([]),
    summaryExplanation: z.string().min(1),
    confidence: z.object({
      level: z.enum(['high', 'medium', 'low']),
      numericScore: z.number().min(0).max(1)
    }).passthrough()
  }).passthrough(),
  isFavorite: z.boolean().default(false),
  userNotes: z.string().optional(),
  sourceType: z.enum(['open_food_facts', 'label_ocr', 'user_manual', 'verified_database', 'custom_api']).default('label_ocr')
});

/**
 * Exports an array of ScanHistoryRecords to a formatted JSON string.
 */
export function exportHistoryToJSON(records: ScanHistoryRecord[]): string {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    totalRecords: records.length,
    records
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Exports an array of ScanHistoryRecords to a standard CSV string.
 */
export function exportHistoryToCSV(records: ScanHistoryRecord[]): string {
  const headers = [
    'ID',
    'Barcode',
    'Product Name',
    'Brand',
    'Category',
    'Scanned At',
    'Grade',
    'Score',
    'Nutrition Score',
    'Ingredient Score',
    'Additive Score',
    'Is Favorite',
    'Source Type',
    'User Notes'
  ];

  const escapeCSV = (val: unknown): string => {
    if (val === undefined || val === null) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map(r => [
    escapeCSV(r.id),
    escapeCSV(r.barcode || ''),
    escapeCSV(r.productName),
    escapeCSV(r.brand || ''),
    escapeCSV(r.category || ''),
    escapeCSV(r.scannedAt),
    escapeCSV(r.analysisResult.grade),
    escapeCSV(r.analysisResult.score),
    escapeCSV(r.analysisResult.pillarScores.nutritionScore),
    escapeCSV(r.analysisResult.pillarScores.ingredientScore),
    escapeCSV(r.analysisResult.pillarScores.additiveScore),
    escapeCSV(r.isFavorite ? 'Yes' : 'No'),
    escapeCSV(r.sourceType),
    escapeCSV(r.userNotes || '')
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Validates and imports a JSON history export string with strict schema checks.
 */
export function importHistoryFromJSON(jsonString: string): ImportResult & { records: ScanHistoryRecord[] } {
  const errors: string[] = [];
  const validRecords: ScanHistoryRecord[] = [];
  let skippedCount = 0;

  if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
    return { importedCount: 0, skippedCount: 0, errors: ['Empty or invalid JSON payload string'], records: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    return {
      importedCount: 0,
      skippedCount: 0,
      errors: [`JSON syntax parse error: ${(err as Error).message}`],
      records: []
    };
  }

  const rawList: unknown[] = Array.isArray(parsed)
    ? parsed
    : (parsed && typeof parsed === 'object' && 'records' in parsed && Array.isArray((parsed as Record<string, unknown>).records))
      ? (parsed as Record<string, unknown>).records as unknown[]
      : [];

  if (rawList.length === 0) {
    return { importedCount: 0, skippedCount: 0, errors: ['No records found in import payload'], records: [] };
  }

  for (let i = 0; i < rawList.length; i++) {
    const rawItem = rawList[i];

    const validationResult = ScanHistoryRecordImportSchema.safeParse(rawItem);
    if (!validationResult.success) {
      const issueMsgs = validationResult.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      errors.push(`Record [${i}] validation failed: ${issueMsgs}`);
      skippedCount++;
      continue;
    }

    validRecords.push(validationResult.data as ScanHistoryRecord);
  }

  return {
    importedCount: validRecords.length,
    skippedCount,
    errors,
    records: validRecords
  };
}
