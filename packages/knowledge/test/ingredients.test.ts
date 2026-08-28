import { describe, it, expect } from 'vitest';
import {
  normalizeIngredient,
  lookupIngredient,
  getIngredientAliases,
  getAllIngredients,
  defaultKnowledgeBase
} from '../src/index.js';

describe('Indian Ingredient Normalization & Knowledge Base', () => {
  it('contains a rich verified dataset of canonical ingredients', () => {
    const all = getAllIngredients();
    expect(all.length).toBeGreaterThanOrEqual(60);
  });

  describe('50+ Indian Ingredient Normalization Test Matrix', () => {
    const testCases: Array<{
      input: string;
      expectedId: string;
      expectedName: string;
      expectedCategory: string;
      isPositive: boolean;
      isRefined: boolean;
      isUPF: boolean;
    }> = [
      // 1. Cereals & Flours
      { input: 'Atta', expectedId: 'whole_wheat_flour', expectedName: 'Whole Wheat Flour (Atta)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'chakki fresh atta', expectedId: 'whole_wheat_flour', expectedName: 'Whole Wheat Flour (Atta)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'Whole Wheat Flour (55%)', expectedId: 'whole_wheat_flour', expectedName: 'Whole Wheat Flour (Atta)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'gehun ka atta', expectedId: 'whole_wheat_flour', expectedName: 'Whole Wheat Flour (Atta)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'Maida', expectedId: 'refined_wheat_flour', expectedName: 'Refined Wheat Flour (Maida)', expectedCategory: 'refined_cereal', isPositive: false, isRefined: true, isUPF: true },
      { input: 'refined wheat flour', expectedId: 'refined_wheat_flour', expectedName: 'Refined Wheat Flour (Maida)', expectedCategory: 'refined_cereal', isPositive: false, isRefined: true, isUPF: true },
      { input: 'all purpose flour', expectedId: 'refined_wheat_flour', expectedName: 'Refined Wheat Flour (Maida)', expectedCategory: 'refined_cereal', isPositive: false, isRefined: true, isUPF: true },
      { input: 'sooji', expectedId: 'semolina', expectedName: 'Semolina (Sooji / Rava)', expectedCategory: 'refined_cereal', isPositive: false, isRefined: true, isUPF: false },
      { input: 'bombay rava', expectedId: 'semolina', expectedName: 'Semolina (Sooji / Rava)', expectedCategory: 'refined_cereal', isPositive: false, isRefined: true, isUPF: false },
      { input: 'ragi', expectedId: 'finger_millet', expectedName: 'Finger Millet (Ragi)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'nachni flour', expectedId: 'finger_millet', expectedName: 'Finger Millet (Ragi)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'bajra', expectedId: 'pearl_millet', expectedName: 'Pearl Millet (Bajra)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'jowar', expectedId: 'sorghum', expectedName: 'Sorghum (Jowar)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'kangni', expectedId: 'foxtail_millet', expectedName: 'Foxtail Millet (Kangni)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'rolled oats', expectedId: 'oats', expectedName: 'Whole Oats / Rolled Oats', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'brown rice', expectedId: 'brown_rice', expectedName: 'Brown Rice', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'poha', expectedId: 'flattened_rice', expectedName: 'Flattened Rice (Poha / Aval)', expectedCategory: 'refined_cereal', isPositive: false, isRefined: true, isUPF: false },
      { input: 'murmura', expectedId: 'puffed_rice', expectedName: 'Puffed Rice (Murmura)', expectedCategory: 'refined_cereal', isPositive: false, isRefined: true, isUPF: false },
      { input: 'barley', expectedId: 'barley', expectedName: 'Barley (Jau)', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },
      { input: 'quinoa seeds', expectedId: 'quinoa', expectedName: 'Quinoa', expectedCategory: 'whole_grain', isPositive: true, isRefined: false, isUPF: false },

      // 2. Pulses & Legumes
      { input: 'Besan', expectedId: 'chickpea_flour', expectedName: 'Chickpea Flour (Besan / Gram Flour)', expectedCategory: 'pulse_legume', isPositive: true, isRefined: false, isUPF: false },
      { input: 'gram flour', expectedId: 'chickpea_flour', expectedName: 'Chickpea Flour (Besan / Gram Flour)', expectedCategory: 'pulse_legume', isPositive: true, isRefined: false, isUPF: false },
      { input: 'chana dal', expectedId: 'split_chickpea', expectedName: 'Split Bengal Gram (Chana Dal)', expectedCategory: 'pulse_legume', isPositive: true, isRefined: false, isUPF: false },
      { input: 'toor dal', expectedId: 'pigeon_peas', expectedName: 'Pigeon Peas (Toor / Tuvar Dal)', expectedCategory: 'pulse_legume', isPositive: true, isRefined: false, isUPF: false },
      { input: 'moong dal', expectedId: 'mung_beans', expectedName: 'Mung Beans (Moong Dal)', expectedCategory: 'pulse_legume', isPositive: true, isRefined: false, isUPF: false },
      { input: 'urad dal', expectedId: 'black_gram', expectedName: 'Black Gram (Urad Dal)', expectedCategory: 'pulse_legume', isPositive: true, isRefined: false, isUPF: false },
      { input: 'masoor dal', expectedId: 'red_lentils', expectedName: 'Red Lentils (Masoor Dal)', expectedCategory: 'pulse_legume', isPositive: true, isRefined: false, isUPF: false },
      { input: 'soya chunks', expectedId: 'soybeans', expectedName: 'Soybean / Soya Protein', expectedCategory: 'pulse_legume', isPositive: true, isRefined: false, isUPF: false },
      { input: 'rajma', expectedId: 'kidney_beans', expectedName: 'Kidney Beans (Rajma)', expectedCategory: 'pulse_legume', isPositive: true, isRefined: false, isUPF: false },

      // 3. Oils & Fats
      { input: 'palmolein', expectedId: 'palmolein', expectedName: 'Refined Palmolein Oil', expectedCategory: 'refined_oil', isPositive: false, isRefined: false, isUPF: true },
      { input: 'edible vegetable oil (palmolein)', expectedId: 'palmolein', expectedName: 'Refined Palmolein Oil', expectedCategory: 'refined_oil', isPositive: false, isRefined: false, isUPF: true },
      { input: 'palm oil', expectedId: 'palm_oil', expectedName: 'Palm Oil / Palm Fat', expectedCategory: 'refined_oil', isPositive: false, isRefined: false, isUPF: true },
      { input: 'vanaspati', expectedId: 'hydrogenated_vegetable_oil', expectedName: 'Hydrogenated Vegetable Oil (Vanaspati)', expectedCategory: 'hydrogenated_fat', isPositive: false, isRefined: false, isUPF: true },
      { input: 'dalda', expectedId: 'hydrogenated_vegetable_oil', expectedName: 'Hydrogenated Vegetable Oil (Vanaspati)', expectedCategory: 'hydrogenated_fat', isPositive: false, isRefined: false, isUPF: true },
      { input: 'mustard oil', expectedId: 'mustard_oil', expectedName: 'Mustard Oil (Kachi Ghani)', expectedCategory: 'cold_pressed_oil', isPositive: true, isRefined: false, isUPF: false },
      { input: 'kachi ghani mustard oil', expectedId: 'mustard_oil', expectedName: 'Mustard Oil (Kachi Ghani)', expectedCategory: 'cold_pressed_oil', isPositive: true, isRefined: false, isUPF: false },
      { input: 'groundnut oil', expectedId: 'groundnut_oil', expectedName: 'Groundnut / Peanut Oil', expectedCategory: 'refined_oil', isPositive: true, isRefined: false, isUPF: false },
      { input: 'sesame oil', expectedId: 'sesame_oil', expectedName: 'Sesame Oil (Gingelly / Til Oil)', expectedCategory: 'cold_pressed_oil', isPositive: true, isRefined: false, isUPF: false },
      { input: 'coconut oil', expectedId: 'coconut_oil', expectedName: 'Coconut Oil', expectedCategory: 'refined_oil', isPositive: false, isRefined: false, isUPF: false },
      { input: 'rice bran oil', expectedId: 'rice_bran_oil', expectedName: 'Rice Bran Oil', expectedCategory: 'refined_oil', isPositive: true, isRefined: false, isUPF: false },
      { input: 'desi ghee', expectedId: 'ghee', expectedName: 'Clarified Butter (Desi Ghee)', expectedCategory: 'dairy', isPositive: false, isRefined: false, isUPF: false },

      // 4. Sweeteners
      { input: 'sugar', expectedId: 'sugar', expectedName: 'Refined Sugar (Sucrose)', expectedCategory: 'refined_sweetener', isPositive: false, isRefined: false, isUPF: true },
      { input: 'jaggery', expectedId: 'jaggery', expectedName: 'Jaggery (Gur)', expectedCategory: 'unrefined_sweetener', isPositive: false, isRefined: false, isUPF: false },
      { input: 'gur', expectedId: 'jaggery', expectedName: 'Jaggery (Gur)', expectedCategory: 'unrefined_sweetener', isPositive: false, isRefined: false, isUPF: false },
      { input: 'liquid glucose', expectedId: 'liquid_glucose', expectedName: 'Liquid Glucose (Glucose Syrup)', expectedCategory: 'refined_sweetener', isPositive: false, isRefined: false, isUPF: true },
      { input: 'invert sugar syrup', expectedId: 'invert_sugar_syrup', expectedName: 'Invert Sugar Syrup', expectedCategory: 'refined_sweetener', isPositive: false, isRefined: false, isUPF: true },
      { input: 'maltodextrin', expectedId: 'maltodextrin', expectedName: 'Maltodextrin', expectedCategory: 'refined_sweetener', isPositive: false, isRefined: false, isUPF: true },
      { input: 'dextrose monohydrate', expectedId: 'dextrose', expectedName: 'Dextrose (D-Glucose)', expectedCategory: 'refined_sweetener', isPositive: false, isRefined: false, isUPF: true },
      { input: 'pure honey', expectedId: 'honey', expectedName: 'Honey', expectedCategory: 'unrefined_sweetener', isPositive: false, isRefined: false, isUPF: false },

      // 5. Dairy, Nuts, Seeds & Spices
      { input: 'skimmed milk powder', expectedId: 'milk_solids', expectedName: 'Milk Solids', expectedCategory: 'dairy', isPositive: true, isRefined: false, isUPF: false },
      { input: 'whey protein concentrate', expectedId: 'whey_protein', expectedName: 'Whey Protein / Whey Solids', expectedCategory: 'dairy', isPositive: true, isRefined: false, isUPF: false },
      { input: 'paneer', expectedId: 'paneer', expectedName: 'Paneer (Cottage Cheese)', expectedCategory: 'dairy', isPositive: true, isRefined: false, isUPF: false },
      { input: 'almonds', expectedId: 'almonds', expectedName: 'Almonds (Badam)', expectedCategory: 'nut_seed', isPositive: true, isRefined: false, isUPF: false },
      { input: 'kaju', expectedId: 'cashews', expectedName: 'Cashews (Kaju)', expectedCategory: 'nut_seed', isPositive: true, isRefined: false, isUPF: false },
      { input: 'makhana', expectedId: 'fox_nuts', expectedName: 'Fox Nuts (Makhana)', expectedCategory: 'nut_seed', isPositive: true, isRefined: false, isUPF: false },
      { input: 'chia seeds', expectedId: 'chia_seeds', expectedName: 'Chia Seeds', expectedCategory: 'nut_seed', isPositive: true, isRefined: false, isUPF: false },
      { input: 'edible common salt', expectedId: 'iodized_salt', expectedName: 'Iodized Salt (Edible Common Salt)', expectedCategory: 'salt', isPositive: false, isRefined: false, isUPF: false },
      { input: 'cocoa solids', expectedId: 'cocoa_solids', expectedName: 'Cocoa Solids / Cocoa Powder', expectedCategory: 'vegetable_fruit', isPositive: true, isRefined: false, isUPF: false },
      { input: 'haldi', expectedId: 'turmeric', expectedName: 'Turmeric (Haldi)', expectedCategory: 'vegetable_fruit', isPositive: true, isRefined: false, isUPF: false },
      { input: 'jeera', expectedId: 'cumin', expectedName: 'Cumin (Jeera)', expectedCategory: 'vegetable_fruit', isPositive: true, isRefined: false, isUPF: false }
    ];

    testCases.forEach((tc, idx) => {
      it(`case #${idx + 1}: matches "${tc.input}" -> ${tc.expectedName}`, () => {
        const res = normalizeIngredient(tc.input, idx);
        expect(res.normalized.canonicalId).toBe(tc.expectedId);
        expect(res.normalized.canonicalName).toBe(tc.expectedName);
        expect(res.normalized.category).toBe(tc.expectedCategory);
        expect(res.normalized.isPositiveMarker).toBe(tc.isPositive);
        expect(res.normalized.isRefinedGrain).toBe(tc.isRefined);
        expect(res.normalized.isUltraProcessedMarker).toBe(tc.isUPF);
        expect(res.normalized.positionIndex).toBe(idx);
      });
    });
  });

  describe('Edge cases & Robustness', () => {
    it('preserves exact positionIndex across items', () => {
      const first = normalizeIngredient('Maida', 0);
      const second = normalizeIngredient('Sugar', 1);
      const third = normalizeIngredient('Palmolein', 2);

      expect(first.normalized.positionIndex).toBe(0);
      expect(second.normalized.positionIndex).toBe(1);
      expect(third.normalized.positionIndex).toBe(2);
    });

    it('handles case-insensitivity and irregular whitespace', () => {
      const res = normalizeIngredient('   wHoLe   WhEaT   fLoUr   ', 0);
      expect(res.normalized.canonicalId).toBe('whole_wheat_flour');
      expect(['exact', 'alias']).toContain(res.matchType);
      expect(res.confidence).toBeGreaterThanOrEqual(0.95);
    });

    it('classifies unrecognized ingredients as explicit unknown without false attributes', () => {
      const unknown = normalizeIngredient('RandomUnicornRootExtractXYZ', 3);
      expect(unknown.matchType).toBe('unknown');
      expect(unknown.confidence).toBe(0);
      expect(unknown.normalized.canonicalId).toBe('unknown');
      expect(unknown.normalized.canonicalName).toBe('RandomUnicornRootExtractXYZ');
      expect(unknown.normalized.category).toBe('general');
      expect(unknown.normalized.isPositiveMarker).toBe(false);
      expect(unknown.normalized.isUltraProcessedMarker).toBe(false);
      expect(unknown.normalized.positionIndex).toBe(3);
    });

    it('performs constrained fuzzy matching for minor typos', () => {
      const res = normalizeIngredient('palmoleine', 0); // Minor typo for palmolein
      expect(res.normalized.canonicalId).toBe('palmolein');
      expect(res.matchType).toBe('fuzzy');
      expect(res.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('correctly maps allergen types', () => {
      expect(normalizeIngredient('atta').normalized.allergenType).toBe('gluten');
      expect(normalizeIngredient('milk solids').normalized.allergenType).toBe('milk');
      expect(normalizeIngredient('peanuts').normalized.allergenType).toBe('peanuts');
      expect(normalizeIngredient('soya chunks').normalized.allergenType).toBe('soy');
      expect(normalizeIngredient('mustard oil').normalized.allergenType).toBe('mustard');
      expect(normalizeIngredient('sesame seeds').normalized.allergenType).toBe('sesame');
      expect(normalizeIngredient('ragi').normalized.allergenType).toBe('none');
    });

    it('retrieves registered aliases via getIngredientAliases', () => {
      const aliases = getIngredientAliases('whole_wheat_flour');
      expect(aliases).toContain('atta');
      expect(aliases).toContain('chakki atta');
      expect(aliases.length).toBeGreaterThan(3);
    });

    it('works seamlessly through defaultKnowledgeBase class instance', () => {
      const normalized = defaultKnowledgeBase.normalizeIngredient('Jaggery', 1);
      expect(normalized.canonicalId).toBe('jaggery');
      expect(normalized.positionIndex).toBe(1);
    });
  });
});
