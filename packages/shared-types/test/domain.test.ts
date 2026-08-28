import { describe, it, expect } from 'vitest';
import {
  ProductInputSchema,
  AnalysisResultSchema,
  createNutrientValue,
  DEFAULT_ALGORITHM_VERSION
} from '../src/index.js';

describe('Domain Models & Zod Schemas', () => {
  it('validates a structured ProductInput', () => {
    const input = {
      barcode: '8901063012487',
      productName: 'Sample Wheat Biscuit',
      brand: 'TestBrand',
      nutrition: {
        basis: 'per_100g' as const,
        energyKcal: createNutrientValue(420, 'kcal'),
        carbohydratesG: createNutrientValue(65, 'g'),
        totalSugarsG: createNutrientValue(22, 'g'),
        addedSugarsG: createNutrientValue(18, 'g'),
        dietaryFiberG: createNutrientValue(4, 'g'),
        proteinG: createNutrientValue(6, 'g'),
        totalFatG: createNutrientValue(14, 'g'),
        saturatedFatG: createNutrientValue(6, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(280, 'mg'),
        saltG: createNutrientValue(0.7, 'g')
      },
      rawIngredientsText: 'Whole Wheat Flour (50%), Sugar, Edible Vegetable Oil (Palmolein)',
      parsedIngredients: [
        {
          rawText: 'Whole Wheat Flour (50%)',
          canonicalId: 'whole_wheat_flour',
          canonicalName: 'Whole Wheat Flour',
          category: 'whole_grain' as const,
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'gluten' as const,
          positionIndex: 0
        }
      ],
      detectedAdditives: [],
      provenance: {
        sourceType: 'open_food_facts' as const,
        observationMode: 'directly_observed' as const,
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    };

    const parsed = ProductInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('validates a structured AnalysisResult with algorithm version', () => {
    const result = {
      algorithmVersion: DEFAULT_ALGORITHM_VERSION,
      score: 72,
      grade: 'B' as const,
      pillarScores: {
        nutritionScore: 68,
        ingredientScore: 75,
        additiveScore: 80
      },
      positives: [
        {
          id: 'high_fiber',
          title: 'Source of Dietary Fiber',
          description: 'Contains 4g fiber per 100g',
          pillar: 'nutrition' as const,
          impact: 'positive' as const,
          pointsDelta: 5
        }
      ],
      warnings: [],
      detectedIngredients: [],
      detectedAdditives: [],
      summaryExplanation: 'Balanced nutritional profile with whole grain ingredients.',
      confidence: {
        level: 'high' as const,
        numericScore: 0.95,
        reasons: ['Complete nutrition panel', 'Recognized barcode'],
        missingMandatoryFields: [],
        userRecommendations: []
      },
      analyzedAt: new Date().toISOString()
    };

    const parsed = AnalysisResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.algorithmVersion).toBe('foodgrade-v1.0.0');
    }
  });
});
