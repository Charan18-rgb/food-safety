import { describe, it, expect } from 'vitest';
import { createNutrientValue, ProductInput } from '@foodgrade/shared-types';
import { evaluateProduct } from '../src/index.js';

describe('Missing Data & Confidence Handling', () => {
  it('does not treat missing sugar as zero and lowers confidence', () => {
    const incompleteProduct: ProductInput = {
      productName: 'Incomplete Test Product',
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(300, 'kcal'),
        carbohydratesG: createNutrientValue(null, 'g', 'missing'),
        totalSugarsG: createNutrientValue(null, 'g', 'missing'),
        addedSugarsG: createNutrientValue(null, 'g', 'missing'), // Missing!
        dietaryFiberG: createNutrientValue(null, 'g', 'missing'),
        proteinG: createNutrientValue(5, 'g'),
        totalFatG: createNutrientValue(10, 'g'),
        saturatedFatG: createNutrientValue(null, 'g', 'missing'),
        transFatG: createNutrientValue(null, 'g', 'missing'),
        cholesterolMg: createNutrientValue(null, 'mg', 'missing'),
        sodiumMg: createNutrientValue(null, 'mg', 'missing'),
        saltG: createNutrientValue(null, 'g', 'missing')
      },
      parsedIngredients: [],
      detectedAdditives: [],
      rawIngredientsText: '',
      provenance: {
        sourceType: 'label_ocr',
        rawConfidence: 0.5,
        missingMandatoryFields: []
      }
    };

    const res = evaluateProduct(incompleteProduct);
    // Confidence must be low
    expect(res.confidence.level).toBe('low');
    expect(res.confidence.numericScore).toBeLessThan(0.60);
    expect(res.confidence.missingMandatoryFields.length).toBeGreaterThan(3);
    // Sugar penalty was NOT applied because data was missing
    expect(res.warnings.some(w => w.id === 'high_added_sugar' || w.id === 'high_sugar')).toBe(false);
  });
});
