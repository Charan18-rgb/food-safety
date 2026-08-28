import { describe, it, expect } from 'vitest';
import {
  exportHistoryToJSON,
  exportHistoryToCSV,
  importHistoryFromJSON
} from '../src/export/exportService.js';
import { ScanHistoryRecord } from '../src/types.js';
import { createNutrientValue } from '@foodgrade/shared-types';

function createMockScanRecord(id: string, name: string): ScanHistoryRecord {
  return {
    id,
    barcode: '8901234567890',
    productName: name,
    brand: 'Test, Brand "Special"',
    category: 'Biscuits',
    scannedAt: '2026-08-25T10:00:00.000Z',
    isFavorite: true,
    userNotes: 'Contains, commas and "quotes"',
    sourceType: 'open_food_facts',
    productInput: {
      productName: name,
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(450, 'kcal'),
        carbohydratesG: createNutrientValue(68, 'g'),
        totalSugarsG: createNutrientValue(20, 'g'),
        addedSugarsG: createNutrientValue(20, 'g'),
        dietaryFiberG: createNutrientValue(3, 'g'),
        proteinG: createNutrientValue(7, 'g'),
        totalFatG: createNutrientValue(15, 'g'),
        saturatedFatG: createNutrientValue(7, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(300, 'mg'),
        saltG: createNutrientValue(0.75, 'g')
      },
      rawIngredientsText: 'Wheat Flour, Sugar',
      parsedIngredients: [],
      detectedAdditives: [],
      provenance: {
        sourceType: 'open_food_facts',
        observationMode: 'fallback',
        rawConfidence: 0.85,
        missingMandatoryFields: []
      }
    },
    analysisResult: {
      algorithmVersion: '1.0.0',
      score: 80,
      grade: 'A',
      pillarScores: {
        nutritionScore: 75,
        ingredientScore: 85,
        additiveScore: 90
      },
      positives: [],
      warnings: [],
      detectedIngredients: [],
      detectedAdditives: [],
      summaryExplanation: 'Sample explanation',
      confidence: {
        level: 'high',
        numericScore: 1.0,
        reasons: [],
        missingMandatoryFields: [],
        userRecommendations: []
      },
      analyzedAt: '2026-08-25T10:00:00.000Z'
    }
  };
}

describe('Export & Import Service with Strong Schema Validation', () => {
  it('should export and import history records via JSON seamlessly', () => {
    const originalRecords = [
      createMockScanRecord('1', 'Whole Wheat Atta'),
      createMockScanRecord('2', 'Rolled Oats')
    ];

    const jsonStr = exportHistoryToJSON(originalRecords);
    expect(jsonStr).toContain('Whole Wheat Atta');
    expect(jsonStr).toContain('Rolled Oats');

    const importResult = importHistoryFromJSON(jsonStr);
    expect(importResult.importedCount).toBe(2);
    expect(importResult.skippedCount).toBe(0);
    expect(importResult.records).toHaveLength(2);
    expect(importResult.records[0].productName).toBe('Whole Wheat Atta');
  });

  it('should reject records with invalid FoodGrade grades', () => {
    const invalidRecord = createMockScanRecord('1', 'Bad Product');
    (invalidRecord.analysisResult as any).grade = 'F'; // 'F' is not a valid FoodGrade

    const jsonStr = JSON.stringify({ records: [invalidRecord] });
    const importResult = importHistoryFromJSON(jsonStr);

    expect(importResult.importedCount).toBe(0);
    expect(importResult.skippedCount).toBe(1);
    expect(importResult.errors[0]).toContain('analysisResult.grade');
  });

  it('should reject records with out-of-range scores (>100 or <0)', () => {
    const invalidRecord = createMockScanRecord('1', 'Bad Score Product');
    invalidRecord.analysisResult.score = 150; // out of range

    const jsonStr = JSON.stringify({ records: [invalidRecord] });
    const importResult = importHistoryFromJSON(jsonStr);

    expect(importResult.importedCount).toBe(0);
    expect(importResult.skippedCount).toBe(1);
    expect(importResult.errors[0]).toContain('Score must be <= 100');
  });

  it('should reject records with invalid non-ISO datetime strings', () => {
    const invalidRecord = createMockScanRecord('1', 'Bad Date Product');
    invalidRecord.scannedAt = 'not-a-real-date';

    const jsonStr = JSON.stringify({ records: [invalidRecord] });
    const importResult = importHistoryFromJSON(jsonStr);

    expect(importResult.importedCount).toBe(0);
    expect(importResult.skippedCount).toBe(1);
    expect(importResult.errors[0]).toContain('scannedAt');
  });

  it('should export CSV with properly escaped quotes and commas', () => {
    const records = [createMockScanRecord('1', 'Parle-G Gluco')];
    const csvStr = exportHistoryToCSV(records);

    expect(csvStr).toContain('ID,Barcode,Product Name');
    expect(csvStr).toContain('"Test, Brand ""Special"""');
    expect(csvStr).toContain('"Contains, commas and ""quotes"""');
  });
});
