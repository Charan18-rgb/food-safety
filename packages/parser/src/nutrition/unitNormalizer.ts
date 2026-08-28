import { NutrientUnit, NutrientValue, createNutrientValue } from '@foodgrade/shared-types';

export function normalizeNutrientValue(
  numericVal: number,
  declaredUnit: string,
  targetType: 'energy' | 'mass_g' | 'mass_mg' | 'percentage'
): { value: number; unit: NutrientUnit; note?: string } {
  const cleanUnit = declaredUnit.toLowerCase().trim();

  // 1. Energy
  if (targetType === 'energy') {
    if (cleanUnit === 'kj' || cleanUnit === 'kilojoules') {
      // 1 kcal = 4.184 kJ
      const converted = Math.round((numericVal / 4.184) * 10) / 10;
      return { value: converted, unit: 'kcal', note: 'Converted from kJ' };
    }
    return { value: numericVal, unit: 'kcal' };
  }

  // 2. Grams (carbs, protein, fat, fiber, sugars)
  if (targetType === 'mass_g') {
    if (cleanUnit === 'mg') {
      return { value: numericVal / 1000, unit: 'g', note: 'Converted from mg to g' };
    }
    if (cleanUnit === 'mcg' || cleanUnit === 'ug') {
      return { value: numericVal / 1000000, unit: 'g', note: 'Converted from mcg to g' };
    }
    return { value: numericVal, unit: 'g' };
  }

  // 3. Milligrams (sodium, cholesterol, micronutrients)
  if (targetType === 'mass_mg') {
    if (cleanUnit === 'g' || cleanUnit === 'gm' || cleanUnit === 'gms') {
      return { value: numericVal * 1000, unit: 'mg', note: 'Converted from g to mg' };
    }
    if (cleanUnit === 'mcg' || cleanUnit === 'ug') {
      return { value: numericVal / 1000, unit: 'mg', note: 'Converted from mcg to mg' };
    }
    return { value: numericVal, unit: 'mg' };
  }

  // 4. Percentage
  if (targetType === 'percentage') {
    return { value: numericVal, unit: '%' };
  }

  return { value: numericVal, unit: 'g' };
}

/**
 * Derives sodium in mg from declared salt in g (or vice versa).
 * FSSAI conversion: 1g salt ≈ 400mg sodium (sodium * 2.5 = salt).
 */
export function deriveSodiumFromSalt(saltG: number): NutrientValue {
  const sodiumMg = Math.round(saltG * 400);
  return createNutrientValue(sodiumMg, 'mg', 'inferred');
}

export function deriveSaltFromSodium(sodiumMg: number): NutrientValue {
  const saltG = Math.round((sodiumMg / 400) * 100) / 100;
  return createNutrientValue(saltG, 'g', 'inferred');
}
