import { describe, it, expect } from 'vitest';
import {
  createNutrientValue,
  getNutrientNumber,
  isNutrientKnownZero,
  isNutrientMissing,
  NutritionProfileSchema
} from '../src/nutrition.js';

describe('NutrientValue & NutritionProfile', () => {
  it('distinguishes declared values from missing values', () => {
    const declaredSugar = createNutrientValue(12.5, 'g', 'declared');
    const zeroTransFat = createNutrientValue(0, 'g', 'declared');
    const missingFiber = createNutrientValue(null, 'g', 'missing');

    expect(declaredSugar.status).toBe('declared');
    expect(declaredSugar.value).toBe(12.5);
    expect(getNutrientNumber(declaredSugar)).toBe(12.5);

    expect(zeroTransFat.value).toBe(0);
    expect(isNutrientKnownZero(zeroTransFat)).toBe(true);
    expect(getNutrientNumber(zeroTransFat)).toBe(0);

    expect(missingFiber.status).toBe('missing');
    expect(missingFiber.value).toBe(null);
    expect(isNutrientMissing(missingFiber)).toBe(true);
    expect(getNutrientNumber(missingFiber)).toBe(null);
  });

  it('validates a complete nutrition profile via schema', () => {
    const profile = {
      basis: 'per_100g' as const,
      energyKcal: createNutrientValue(450, 'kcal'),
      carbohydratesG: createNutrientValue(60, 'g'),
      totalSugarsG: createNutrientValue(24, 'g'),
      addedSugarsG: createNutrientValue(20, 'g'),
      dietaryFiberG: createNutrientValue(3.5, 'g'),
      proteinG: createNutrientValue(7, 'g'),
      totalFatG: createNutrientValue(18, 'g'),
      saturatedFatG: createNutrientValue(8, 'g'),
      transFatG: createNutrientValue(0, 'g'),
      cholesterolMg: createNutrientValue(0, 'mg'),
      sodiumMg: createNutrientValue(350, 'mg'),
      saltG: createNutrientValue(0.875, 'g', 'inferred')
    };

    const parsed = NutritionProfileSchema.safeParse(profile);
    expect(parsed.success).toBe(true);
  });
});
