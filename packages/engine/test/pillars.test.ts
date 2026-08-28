import { describe, it, expect } from 'vitest';
import { createNutrientValue } from '@foodgrade/shared-types';
import {
  evaluateNutritionPillar,
  evaluateIngredientPillar,
  evaluateAdditivePillar,
  DEFAULT_SCORING_CONFIG_V1
} from '../src/index.js';

describe('Scoring Pillars Independent Evaluation', () => {
  describe('Pillar 1: Nutritional Balance', () => {
    it('starts at baseline (70) when no nutrients cause deductions or bonuses', () => {
      const neutralNutrition = {
        basis: 'per_100g' as const,
        energyKcal: createNutrientValue(150, 'kcal'),
        carbohydratesG: createNutrientValue(20, 'g'),
        totalSugarsG: createNutrientValue(3, 'g'),
        addedSugarsG: createNutrientValue(2, 'g'),
        dietaryFiberG: createNutrientValue(1, 'g'),
        proteinG: createNutrientValue(2, 'g'),
        totalFatG: createNutrientValue(3, 'g'),
        saturatedFatG: createNutrientValue(1, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(150, 'mg'),
        saltG: createNutrientValue(0.375, 'g')
      };

      const res = evaluateNutritionPillar(neutralNutrition, DEFAULT_SCORING_CONFIG_V1.nutrition);
      expect(res.score).toBe(70);
    });

    it('penalizes high added sugar smoothly and deterministically', () => {
      const highSugar = {
        basis: 'per_100g' as const,
        energyKcal: createNutrientValue(400, 'kcal'),
        carbohydratesG: createNutrientValue(80, 'g'),
        totalSugarsG: createNutrientValue(35, 'g'),
        addedSugarsG: createNutrientValue(30, 'g'), // > 25g
        dietaryFiberG: createNutrientValue(0, 'g'),
        proteinG: createNutrientValue(1, 'g'),
        totalFatG: createNutrientValue(5, 'g'),
        saturatedFatG: createNutrientValue(1, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(100, 'mg'),
        saltG: createNutrientValue(0.25, 'g')
      };

      const res = evaluateNutritionPillar(highSugar, DEFAULT_SCORING_CONFIG_V1.nutrition);
      expect(res.score).toBeLessThan(45);
      expect(res.factors.some(f => f.id === 'high_added_sugar')).toBe(true);
    });

    it('applies bonus for high protein and high dietary fiber', () => {
      const highFiberProtein = {
        basis: 'per_100g' as const,
        energyKcal: createNutrientValue(350, 'kcal'),
        carbohydratesG: createNutrientValue(55, 'g'),
        totalSugarsG: createNutrientValue(2, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(8, 'g'), // >= 6g -> +12
        proteinG: createNutrientValue(14, 'g'),      // >= 10g -> +10
        totalFatG: createNutrientValue(4, 'g'),
        saturatedFatG: createNutrientValue(1, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(120, 'mg'),
        saltG: createNutrientValue(0.3, 'g')
      };

      const res = evaluateNutritionPillar(highFiberProtein, DEFAULT_SCORING_CONFIG_V1.nutrition);
      // 70 baseline + 12 fiber + 10 protein = 92
      expect(res.score).toBe(92);
      expect(res.factors.some(f => f.id === 'high_fiber')).toBe(true);
      expect(res.factors.some(f => f.id === 'high_protein')).toBe(true);
    });

    it('penalizes trans fat presence heavily', () => {
      const transFatFood = {
        basis: 'per_100g' as const,
        energyKcal: createNutrientValue(450, 'kcal'),
        carbohydratesG: createNutrientValue(50, 'g'),
        totalSugarsG: createNutrientValue(0, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(1, 'g'),
        proteinG: createNutrientValue(4, 'g'),
        totalFatG: createNutrientValue(25, 'g'),
        saturatedFatG: createNutrientValue(5, 'g'),
        transFatG: createNutrientValue(0.8, 'g'), // > 0.1g -> -15
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(200, 'mg'),
        saltG: createNutrientValue(0.5, 'g')
      };

      const res = evaluateNutritionPillar(transFatFood, DEFAULT_SCORING_CONFIG_V1.nutrition);
      expect(res.score).toBe(55); // 70 - 15
      expect(res.factors.some(f => f.id === 'contains_trans_fat')).toBe(true);
    });
  });

  describe('Pillar 2: Ingredient Quality & Refinement', () => {
    it('applies higher penalty for Maida in position 0 than position 3', () => {
      const maidaPos0 = [
        {
          rawText: 'Maida',
          canonicalId: 'refined_wheat_flour',
          canonicalName: 'Refined Wheat Flour (Maida)',
          category: 'refined_cereal' as const,
          isWholeGrain: false,
          isRefinedGrain: true,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'gluten' as const,
          positionIndex: 0
        }
      ];

      const maidaPos3 = [
        {
          rawText: 'Maida',
          canonicalId: 'refined_wheat_flour',
          canonicalName: 'Refined Wheat Flour (Maida)',
          category: 'refined_cereal' as const,
          isWholeGrain: false,
          isRefinedGrain: true,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'gluten' as const,
          positionIndex: 3
        }
      ];

      const res0 = evaluateIngredientPillar(maidaPos0, DEFAULT_SCORING_CONFIG_V1.ingredients);
      const res3 = evaluateIngredientPillar(maidaPos3, DEFAULT_SCORING_CONFIG_V1.ingredients);

      // Pos 0: 80 - 20 = 60
      expect(res0.score).toBe(60);
      // Pos 3: 80 - (20 / sqrt(4)) = 80 - 10 = 70
      expect(res3.score).toBe(70);
      expect(res0.score).toBeLessThan(res3.score);
    });

    it('awards bonus for positive millets and whole grains', () => {
      const milletAtta = [
        {
          rawText: 'Ragi Flour (40%)',
          canonicalId: 'finger_millet',
          canonicalName: 'Finger Millet (Ragi)',
          category: 'whole_grain' as const,
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'none' as const,
          positionIndex: 0
        },
        {
          rawText: 'Whole Wheat Atta (30%)',
          canonicalId: 'whole_wheat_flour',
          canonicalName: 'Whole Wheat Flour (Atta)',
          category: 'whole_grain' as const,
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'gluten' as const,
          positionIndex: 1
        }
      ];

      const res = evaluateIngredientPillar(milletAtta, DEFAULT_SCORING_CONFIG_V1.ingredients);
      // 80 baseline + 15 (ragi pos 0) + 10.6 (atta pos 1) = 100 (clamped)
      expect(res.score).toBe(100);
      expect(res.factors.length).toBe(2);
    });
  });

  describe('Pillar 3: Additive Load & Processing Level', () => {
    it('gives score 100 for clean label with zero detected additives', () => {
      const res = evaluateAdditivePillar([], DEFAULT_SCORING_CONFIG_V1.additives);
      expect(res.score).toBe(100);
      expect(res.factors[0].id).toBe('no_additives_detected');
    });

    it('does not penalize neutral additives like Vitamin C (INS 300) or Soya Lecithin (INS 322)', () => {
      const neutralAdditives = [
        {
          insCode: 'INS 300',
          canonicalName: 'Ascorbic Acid (Vitamin C)',
          functionalClass: 'antioxidant' as const,
          riskCategory: 'neutral' as const,
          neutralExplanation: 'Natural antioxidant.'
        },
        {
          insCode: 'INS 322',
          canonicalName: 'Soya Lecithin',
          functionalClass: 'emulsifier_stabilizer' as const,
          riskCategory: 'neutral' as const,
          neutralExplanation: 'Plant-derived emulsifier.'
        }
      ];

      const res = evaluateAdditivePillar(neutralAdditives, DEFAULT_SCORING_CONFIG_V1.additives);
      expect(res.score).toBe(100);
    });

    it('deducts for synthetic colours and artificial sweeteners', () => {
      const additives = [
        {
          insCode: 'INS 102',
          canonicalName: 'Tartrazine',
          functionalClass: 'synthetic_colour' as const,
          riskCategory: 'caution_load' as const,
          neutralExplanation: 'Synthetic lemon yellow dye.'
        },
        {
          insCode: 'INS 955',
          canonicalName: 'Sucralose',
          functionalClass: 'artificial_sweetener' as const,
          riskCategory: 'caution_load' as const,
          neutralExplanation: 'Non-caloric artificial sweetener.'
        }
      ];

      const res = evaluateAdditivePillar(additives, DEFAULT_SCORING_CONFIG_V1.additives);
      // 100 - 10 (colour) - 12 (sweetener) = 78
      expect(res.score).toBe(78);
      expect(res.factors.length).toBe(2);
    });

    it('deduplicates duplicate mentions of the same INS code', () => {
      const duplicateAdditives = [
        {
          insCode: 'INS 621',
          canonicalName: 'Monosodium Glutamate',
          functionalClass: 'flavour_enhancer' as const,
          riskCategory: 'processing_indicator' as const,
          neutralExplanation: 'Flavour enhancer.'
        },
        {
          insCode: 'INS 621',
          canonicalName: 'Monosodium Glutamate',
          functionalClass: 'flavour_enhancer' as const,
          riskCategory: 'processing_indicator' as const,
          neutralExplanation: 'Flavour enhancer.'
        }
      ];

      const res = evaluateAdditivePillar(duplicateAdditives, DEFAULT_SCORING_CONFIG_V1.additives);
      // 100 - 6 (deduplicated) = 94
      expect(res.score).toBe(94);
    });
  });
});
