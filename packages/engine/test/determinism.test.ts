import { describe, it, expect } from 'vitest';
import { createNutrientValue, ProductInput } from '@foodgrade/shared-types';
import { evaluateProduct } from '../src/index.js';

describe('Deterministic Scoring Invariant', () => {
  it('produces identical byte-for-byte scores across 100 evaluations for same input', () => {
    const input: ProductInput = {
      productName: 'Determinism Test Food',
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(420, 'kcal'),
        carbohydratesG: createNutrientValue(65, 'g'),
        totalSugarsG: createNutrientValue(20, 'g'),
        addedSugarsG: createNutrientValue(18, 'g'),
        dietaryFiberG: createNutrientValue(3.5, 'g'),
        proteinG: createNutrientValue(7, 'g'),
        totalFatG: createNutrientValue(14, 'g'),
        saturatedFatG: createNutrientValue(5, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(300, 'mg'),
        saltG: createNutrientValue(0.75, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Atta',
          canonicalId: 'whole_wheat_flour',
          canonicalName: 'Whole Wheat Flour (Atta)',
          category: 'whole_grain',
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'gluten',
          positionIndex: 0
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Atta',
      provenance: {
        sourceType: 'verified_database',
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    };

    const fixedTime = '2026-08-25T12:00:00.000Z';
    const firstResult = evaluateProduct(input, undefined, { analyzedAt: fixedTime });

    for (let i = 0; i < 100; i++) {
      const subsequentResult = evaluateProduct(input, undefined, { analyzedAt: fixedTime });
      expect(subsequentResult.score).toBe(firstResult.score);
      expect(subsequentResult.grade).toBe(firstResult.grade);
      expect(subsequentResult.pillarScores).toEqual(firstResult.pillarScores);
      expect(subsequentResult.positives).toEqual(firstResult.positives);
      expect(subsequentResult.warnings).toEqual(firstResult.warnings);
      expect(subsequentResult.confidence).toEqual(firstResult.confidence);
      expect(subsequentResult.analyzedAt).toBe(fixedTime);
    }
  });
});
