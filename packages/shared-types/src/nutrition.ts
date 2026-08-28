import { z } from 'zod';

export const NutrientStatusSchema = z.enum([
  'measured',    // Laboratory or analytical test result
  'declared',    // Printed explicitly on package label
  'inferred',    // Calculated from sub-values (e.g. Salt = Sodium * 2.5)
  'missing',     // Expected field not present on label/source
  'unavailable'  // Not supported or unreadable
]);
export type NutrientStatus = z.infer<typeof NutrientStatusSchema>;

export const NutrientUnitSchema = z.enum([
  'g',
  'mg',
  'mcg',
  'kcal',
  'kJ',
  'IU',
  '%'
]);
export type NutrientUnit = z.infer<typeof NutrientUnitSchema>;

export const NutrientValueSchema = z.object({
  value: z.number().nullable(),
  status: NutrientStatusSchema,
  unit: NutrientUnitSchema,
  source: z.string().optional(),
  confidence: z.number().min(0).max(1).optional()
});
export type NutrientValue = z.infer<typeof NutrientValueSchema>;

export const NutritionBasisSchema = z.enum([
  'per_100g',
  'per_100ml',
  'per_serving'
]);
export type NutritionBasis = z.infer<typeof NutritionBasisSchema>;

export const ServingInfoSchema = z.object({
  servingSize: z.number().positive().optional(),
  servingUnit: z.enum(['g', 'ml', 'piece', 'pack', 'portion']).default('g'),
  servingsPerPackage: z.number().positive().optional(),
  servingDescription: z.string().optional()
});
export type ServingInfo = z.infer<typeof ServingInfoSchema>;

export const NutritionProfileSchema = z.object({
  basis: NutritionBasisSchema.default('per_100g'),
  energyKcal: NutrientValueSchema,
  carbohydratesG: NutrientValueSchema,
  totalSugarsG: NutrientValueSchema,
  addedSugarsG: NutrientValueSchema,
  dietaryFiberG: NutrientValueSchema,
  proteinG: NutrientValueSchema,
  totalFatG: NutrientValueSchema,
  saturatedFatG: NutrientValueSchema,
  transFatG: NutrientValueSchema,
  cholesterolMg: NutrientValueSchema,
  sodiumMg: NutrientValueSchema,
  saltG: NutrientValueSchema
});
export type NutritionProfile = z.infer<typeof NutritionProfileSchema>;

// Helper functions for safely creating and accessing nutrient values
export function createNutrientValue(
  value: number | null,
  unit: NutrientUnit,
  status: NutrientStatus = value !== null ? 'declared' : 'missing',
  confidence = 1.0
): NutrientValue {
  return {
    value,
    status: value !== null ? status : 'missing',
    unit,
    confidence
  };
}

export function getNutrientNumber(nutrient: NutrientValue | undefined): number | null {
  if (!nutrient || nutrient.value === null || nutrient.status === 'missing' || nutrient.status === 'unavailable') {
    return null;
  }
  return nutrient.value;
}

export function isNutrientKnownZero(nutrient: NutrientValue | undefined): boolean {
  if (!nutrient) return false;
  return nutrient.value === 0 && (nutrient.status === 'declared' || nutrient.status === 'measured' || nutrient.status === 'inferred');
}

export function isNutrientMissing(nutrient: NutrientValue | undefined): boolean {
  if (!nutrient) return true;
  return nutrient.value === null || nutrient.status === 'missing';
}

// Indian FSSAI RDA Reference Benchmarks (based on 2000 kcal diet for Indian adults)
export const FSSAI_RDA_REFERENCE = {
  energyKcal: 2000,
  addedSugarsG: 50,       // Max recommended daily added sugar (<10% of total energy)
  totalFatG: 67,          // 20-30% of total energy
  saturatedFatG: 22,      // Max recommended daily saturated fat (<10% of total energy)
  transFatG: 2,           // Max recommended daily trans fat (<1% of total energy)
  sodiumMg: 2000,         // Corresponds to ~5g Salt (NaCl)
  saltG: 5.0,
  dietaryFiberG: 30,
  proteinG: 54
} as const;
