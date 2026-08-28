import { describe, it, expect } from 'vitest';
import { createNutrientValue, ProductInput } from '@foodgrade/shared-types';
import { evaluateProduct, DEFAULT_SCORING_CONFIG_V1 } from '../src/index.js';

describe('Mathematical Reconciliation & Explainability', () => {
  it('strictly reconciles composite score from individual pillar scores', () => {
    const sampleProduct: ProductInput = {
      productName: 'Reconciliation Sample',
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(400, 'kcal'),
        carbohydratesG: createNutrientValue(60, 'g'),
        totalSugarsG: createNutrientValue(15, 'g'),
        addedSugarsG: createNutrientValue(12, 'g'),
        dietaryFiberG: createNutrientValue(4, 'g'),
        proteinG: createNutrientValue(6, 'g'),
        totalFatG: createNutrientValue(12, 'g'),
        saturatedFatG: createNutrientValue(4, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(250, 'mg'),
        saltG: createNutrientValue(0.625, 'g')
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
      rawIngredientsText: 'Atta, Sugar, Oil',
      provenance: {
        sourceType: 'verified_database',
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    };

    const res = evaluateProduct(sampleProduct);
    const { nutritionScore, ingredientScore, additiveScore } = res.pillarScores;
    const { nutrition: wN, ingredient: wI, additive: wA } = DEFAULT_SCORING_CONFIG_V1.weights;

    const expectedScore = Math.round(nutritionScore * wN + ingredientScore * wI + additiveScore * wA);
    expect(res.score).toBe(expectedScore);
  });
});
