import { IngredientKnowledge } from '../types.js';
import { CEREAL_INGREDIENTS } from './cereals.js';
import { PULSE_INGREDIENTS } from './pulses.js';
import { OIL_INGREDIENTS } from './oils-fats.js';
import { SWEETENER_INGREDIENTS } from './sweeteners.js';
import { DAIRY_INGREDIENTS } from './dairy.js';
import { NUT_SEED_INGREDIENTS } from './nuts-seeds.js';
import { VEGETABLE_SPICE_INGREDIENTS } from './vegetables-spices.js';

export const ALL_CANONICAL_INGREDIENTS: IngredientKnowledge[] = [
  ...CEREAL_INGREDIENTS,
  ...PULSE_INGREDIENTS,
  ...OIL_INGREDIENTS,
  ...SWEETENER_INGREDIENTS,
  ...DAIRY_INGREDIENTS,
  ...NUT_SEED_INGREDIENTS,
  ...VEGETABLE_SPICE_INGREDIENTS
];

export const INGREDIENTS_BY_ID: Map<string, IngredientKnowledge> = new Map(
  ALL_CANONICAL_INGREDIENTS.map(item => [item.id, item])
);

export {
  CEREAL_INGREDIENTS,
  PULSE_INGREDIENTS,
  OIL_INGREDIENTS,
  SWEETENER_INGREDIENTS,
  DAIRY_INGREDIENTS,
  NUT_SEED_INGREDIENTS,
  VEGETABLE_SPICE_INGREDIENTS
};
