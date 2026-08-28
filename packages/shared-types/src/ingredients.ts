import { z } from 'zod';

export const IngredientCategorySchema = z.enum([
  'whole_grain',
  'refined_cereal',
  'pulse_legume',
  'dairy',
  'nut_seed',
  'vegetable_fruit',
  'unrefined_sweetener',
  'refined_sweetener',
  'refined_oil',
  'hydrogenated_fat',
  'cold_pressed_oil',
  'additive_preservative',
  'additive_emulsifier',
  'additive_sweetener',
  'additive_colour',
  'additive_flavour',
  'additive_other',
  'salt',
  'general'
]);
export type IngredientCategory = z.infer<typeof IngredientCategorySchema>;

export const AllergenTypeSchema = z.enum([
  'gluten',
  'milk',
  'soy',
  'nuts',
  'peanuts',
  'sulfites',
  'sesame',
  'mustard',
  'egg',
  'fish',
  'none'
]);
export type AllergenType = z.infer<typeof AllergenTypeSchema>;

export const NormalizedIngredientSchema = z.object({
  rawText: z.string(),
  canonicalId: z.string(),
  canonicalName: z.string(),
  category: IngredientCategorySchema,
  isWholeGrain: z.boolean().default(false),
  isRefinedGrain: z.boolean().default(false),
  isUltraProcessedMarker: z.boolean().default(false),
  isPositiveMarker: z.boolean().default(false),
  allergenType: AllergenTypeSchema.default('none'),
  positionIndex: z.number().int().min(0), // 0 = highest weight
  subIngredients: z.array(z.string()).optional()
});
export type NormalizedIngredient = z.infer<typeof NormalizedIngredientSchema>;
