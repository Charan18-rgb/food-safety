import { describe, it, expect } from 'vitest';
import { createNutrientValue, ProductInput } from '@foodgrade/shared-types';
import {
  evaluateNutritionPillar,
  evaluateProduct,
  DEFAULT_SCORING_CONFIG_V1,
  ScoringConfigV1
} from '../src/index.js';

describe('Data Semantics & Missing-Data Invariant Tests (Milestone 3.1)', () => {
  describe('1. Caloric-Density Missing-Data Invariant', () => {
    const baseHighCalorieNutrition = {
      basis: 'per_100g' as const,
      energyKcal: createNutrientValue(500, 'kcal'), // > 450 kcal
      carbohydratesG: createNutrientValue(60, 'g'),
      totalSugarsG: createNutrientValue(5, 'g'),
      addedSugarsG: createNutrientValue(0, 'g'),
      totalFatG: createNutrientValue(25, 'g'),
      saturatedFatG: createNutrientValue(4, 'g'),
      transFatG: createNutrientValue(0, 'g'),
      cholesterolMg: createNutrientValue(0, 'mg'),
      sodiumMg: createNutrientValue(200, 'mg'),
      saltG: createNutrientValue(0.5, 'g')
    };

    it('applies penalty when high calories AND known low fibre (<2g) AND known low protein (<3g)', () => {
      const nutri = {
        ...baseHighCalorieNutrition,
        dietaryFiberG: createNutrientValue(0.8, 'g'),
        proteinG: createNutrientValue(1.5, 'g')
      };

      const res = evaluateNutritionPillar(nutri, DEFAULT_SCORING_CONFIG_V1.nutrition);
      // Baseline 70 - 5 (caloric density) = 65
      expect(res.score).toBe(65);
      expect(res.factors.some(f => f.id === 'high_caloric_density')).toBe(true);
    });

    it('does NOT apply penalty when fibre is missing, even if protein is known low', () => {
      const nutri = {
        ...baseHighCalorieNutrition,
        dietaryFiberG: createNutrientValue(null, 'g', 'missing'), // Missing fibre!
        proteinG: createNutrientValue(1.5, 'g')
      };

      const res = evaluateNutritionPillar(nutri, DEFAULT_SCORING_CONFIG_V1.nutrition);
      // Baseline 70 (no caloric density penalty applied)
      expect(res.score).toBe(70);
      expect(res.factors.some(f => f.id === 'high_caloric_density')).toBe(false);
    });

    it('does NOT apply penalty when protein is missing, even if fibre is known low', () => {
      const nutri = {
        ...baseHighCalorieNutrition,
        dietaryFiberG: createNutrientValue(0.8, 'g'),
        proteinG: createNutrientValue(null, 'g', 'missing') // Missing protein!
      };

      const res = evaluateNutritionPillar(nutri, DEFAULT_SCORING_CONFIG_V1.nutrition);
      expect(res.score).toBe(70);
      expect(res.factors.some(f => f.id === 'high_caloric_density')).toBe(false);
    });

    it('does NOT apply penalty when both fibre and protein are missing', () => {
      const nutri = {
        ...baseHighCalorieNutrition,
        dietaryFiberG: createNutrientValue(null, 'g', 'missing'),
        proteinG: createNutrientValue(null, 'g', 'missing')
      };

      const res = evaluateNutritionPillar(nutri, DEFAULT_SCORING_CONFIG_V1.nutrition);
      expect(res.score).toBe(70);
      expect(res.factors.some(f => f.id === 'high_caloric_density')).toBe(false);
    });

    it('correctly treats explicit zero fibre and zero protein as known zero and applies penalty', () => {
      const nutri = {
        ...baseHighCalorieNutrition,
        dietaryFiberG: createNutrientValue(0.0, 'g', 'declared'), // Explicit zero
        proteinG: createNutrientValue(0.0, 'g', 'declared')       // Explicit zero
      };

      const res = evaluateNutritionPillar(nutri, DEFAULT_SCORING_CONFIG_V1.nutrition);
      expect(res.score).toBe(65); // 70 - 5
      expect(res.factors.some(f => f.id === 'high_caloric_density')).toBe(true);
    });
  });

  describe('2. Added Sugar vs Total Sugar Semantics', () => {
    const baseNutrition = {
      basis: 'per_100g' as const,
      energyKcal: createNutrientValue(200, 'kcal'),
      carbohydratesG: createNutrientValue(30, 'g'),
      dietaryFiberG: createNutrientValue(2, 'g'),
      proteinG: createNutrientValue(3, 'g'),
      totalFatG: createNutrientValue(4, 'g'),
      saturatedFatG: createNutrientValue(1, 'g'),
      transFatG: createNutrientValue(0, 'g'),
      cholesterolMg: createNutrientValue(0, 'mg'),
      sodiumMg: createNutrientValue(100, 'mg'),
      saltG: createNutrientValue(0.25, 'g')
    };

    it('Case 1: Both Added and Total Sugar are present -> Uses added sugar for penalty', () => {
      const nutri = {
        ...baseNutrition,
        totalSugarsG: createNutrientValue(25, 'g'),
        addedSugarsG: createNutrientValue(15, 'g') // Uses 15g
      };

      const res = evaluateNutritionPillar(nutri, DEFAULT_SCORING_CONFIG_V1.nutrition);
      expect(res.factors.some(f => f.id === 'high_added_sugar')).toBe(true);
      expect(res.factors.find(f => f.id === 'high_added_sugar')?.description).toContain('15g added sugar');
      expect(res.missingFields.includes('addedSugarsG')).toBe(false);
    });

    it('Case 2: Added Sugar is present, Total Sugar is missing -> Uses added sugar for penalty', () => {
      const nutri = {
        ...baseNutrition,
        totalSugarsG: createNutrientValue(null, 'g', 'missing'),
        addedSugarsG: createNutrientValue(15, 'g')
      };

      const res = evaluateNutritionPillar(nutri, DEFAULT_SCORING_CONFIG_V1.nutrition);
      expect(res.factors.some(f => f.id === 'high_added_sugar')).toBe(true);
      expect(res.missingFields.includes('addedSugarsG')).toBe(false);
    });

    it('Case 3: Added Sugar is MISSING, Total Sugar is PRESENT -> Does NOT deduct added sugar penalty', () => {
      const nutri = {
        ...baseNutrition,
        totalSugarsG: createNutrientValue(25, 'g'), // High total sugar
        addedSugarsG: createNutrientValue(null, 'g', 'missing') // Missing added sugar
      };

      const res = evaluateNutritionPillar(nutri, DEFAULT_SCORING_CONFIG_V1.nutrition);
      // No penalty applied from total sugar alone
      expect(res.score).toBe(70);
      expect(res.factors.some(f => f.id === 'high_added_sugar')).toBe(false);
      // Explanatory neutral factor recorded
      expect(res.factors.some(f => f.id === 'added_sugar_unavailable')).toBe(true);
      // Missing field recorded for confidence reduction
      expect(res.missingFields.includes('addedSugarsG')).toBe(true);
    });

    it('Case 4: Both Added and Total Sugar are MISSING -> No sugar scoring, records missing', () => {
      const nutri = {
        ...baseNutrition,
        totalSugarsG: createNutrientValue(null, 'g', 'missing'),
        addedSugarsG: createNutrientValue(null, 'g', 'missing')
      };

      const res = evaluateNutritionPillar(nutri, DEFAULT_SCORING_CONFIG_V1.nutrition);
      expect(res.score).toBe(70);
      expect(res.missingFields.some(f => f.includes('addedSugarsG'))).toBe(true);
    });
  });

  describe('3. Natural Sugar vs Added Sugar Product Distinction', () => {
    it('distinguishes 20g natural sugar (0g added) from 20g added sugar', () => {
      // Product A: 100% Whole Milk / Pure Mango Pulp (20g natural lactose/fructose, 0g added sugar)
      const productA: ProductInput = {
        productName: 'Natural Whole Milk / Pure Fruit Pulp',
        nutrition: {
          basis: 'per_100g',
          energyKcal: createNutrientValue(90, 'kcal'),
          carbohydratesG: createNutrientValue(20, 'g'),
          totalSugarsG: createNutrientValue(20, 'g'), // 20g natural sugar
          addedSugarsG: createNutrientValue(0, 'g'),  // 0g added sugar
          dietaryFiberG: createNutrientValue(0, 'g'),
          proteinG: createNutrientValue(3.5, 'g'),
          totalFatG: createNutrientValue(4, 'g'),
          saturatedFatG: createNutrientValue(2.2, 'g'),
          transFatG: createNutrientValue(0, 'g'),
          cholesterolMg: createNutrientValue(10, 'mg'),
          sodiumMg: createNutrientValue(50, 'mg'),
          saltG: createNutrientValue(0.125, 'g')
        },
        parsedIngredients: [],
        detectedAdditives: [],
        rawIngredientsText: 'Fresh Cow Milk (100%)',
        provenance: { sourceType: 'verified_database', rawConfidence: 1.0, missingMandatoryFields: [] }
      };

      // Product B: Confectionery / Flavoured Sugar Syrup (20g added sugar)
      const productB: ProductInput = {
        productName: 'Flavoured Sweet Syrup',
        nutrition: {
          basis: 'per_100g',
          energyKcal: createNutrientValue(90, 'kcal'),
          carbohydratesG: createNutrientValue(20, 'g'),
          totalSugarsG: createNutrientValue(20, 'g'),
          addedSugarsG: createNutrientValue(20, 'g'),  // 20g ADDED sugar
          dietaryFiberG: createNutrientValue(0, 'g'),
          proteinG: createNutrientValue(0, 'g'),
          totalFatG: createNutrientValue(0, 'g'),
          saturatedFatG: createNutrientValue(0, 'g'),
          transFatG: createNutrientValue(0, 'g'),
          cholesterolMg: createNutrientValue(0, 'mg'),
          sodiumMg: createNutrientValue(50, 'mg'),
          saltG: createNutrientValue(0.125, 'g')
        },
        parsedIngredients: [],
        detectedAdditives: [],
        rawIngredientsText: 'Water, Sugar (20%)',
        provenance: { sourceType: 'verified_database', rawConfidence: 1.0, missingMandatoryFields: [] }
      };

      const resA = evaluateProduct(productA);
      const resB = evaluateProduct(productB);

      // Product A must have zero added-sugar warning and higher score
      expect(resA.warnings.some(w => w.id === 'high_added_sugar')).toBe(false);
      expect(resA.positives.some(p => p.id === 'low_added_sugar')).toBe(true);

      // Product B must have high added-sugar warning
      expect(resB.warnings.some(w => w.id === 'high_added_sugar')).toBe(true);
      expect(resB.warnings.find(w => w.id === 'high_added_sugar')?.pointsDelta).toBeLessThan(-15);

      // Product A must score significantly higher than Product B
      expect(resA.pillarScores.nutritionScore).toBeGreaterThan(resB.pillarScores.nutritionScore);
      expect(resA.score).toBeGreaterThan(resB.score);
    });
  });

  describe('4. Liquid Beverage Scaling per_100g vs per_100ml', () => {
    it('applies stricter thresholds to per_100ml beverages due to liquidBeverageMultiplier', () => {
      const solidProduct: ProductInput = {
        productName: 'Solid Food (10g added sugar / 100g)',
        nutrition: {
          basis: 'per_100g',
          energyKcal: createNutrientValue(250, 'kcal'),
          carbohydratesG: createNutrientValue(40, 'g'),
          totalSugarsG: createNutrientValue(10, 'g'),
          addedSugarsG: createNutrientValue(10, 'g'),
          dietaryFiberG: createNutrientValue(2, 'g'),
          proteinG: createNutrientValue(4, 'g'),
          totalFatG: createNutrientValue(6, 'g'),
          saturatedFatG: createNutrientValue(2, 'g'),
          transFatG: createNutrientValue(0, 'g'),
          cholesterolMg: createNutrientValue(0, 'mg'),
          sodiumMg: createNutrientValue(200, 'mg'),
          saltG: createNutrientValue(0.5, 'g')
        },
        parsedIngredients: [],
        detectedAdditives: [],
        rawIngredientsText: '',
        provenance: { sourceType: 'verified_database', rawConfidence: 1.0, missingMandatoryFields: [] }
      };

      const liquidProduct: ProductInput = {
        ...solidProduct,
        productName: 'Liquid Beverage (10g added sugar / 100ml)',
        nutrition: {
          ...solidProduct.nutrition,
          basis: 'per_100ml' // Liquid!
        }
      };

      const resSolid = evaluateProduct(solidProduct);
      const resLiquid = evaluateProduct(liquidProduct);

      // For solid: 10g is between thresholdZero (5g) and thresholdModerate (12g) -> moderate deduction
      // For liquid: 10g is between thresholdModerate (6g) and thresholdHigh (12.5g) -> higher deduction
      expect(resLiquid.pillarScores.nutritionScore).toBeLessThan(resSolid.pillarScores.nutritionScore);
      expect(resLiquid.score).toBeLessThan(resSolid.score);

      // Verify that ingredient, additive, and grade thresholds are NOT affected by liquidMultiplier
      expect(resLiquid.pillarScores.ingredientScore).toBe(resSolid.pillarScores.ingredientScore);
      expect(resLiquid.pillarScores.additiveScore).toBe(resSolid.pillarScores.additiveScore);
    });

    it('respects custom liquidBeverageMultiplier in ScoringConfigV1', () => {
      const liquidProduct: ProductInput = {
        productName: 'Liquid Test',
        nutrition: {
          basis: 'per_100ml',
          energyKcal: createNutrientValue(50, 'kcal'),
          carbohydratesG: createNutrientValue(10, 'g'),
          totalSugarsG: createNutrientValue(8, 'g'),
          addedSugarsG: createNutrientValue(8, 'g'),
          dietaryFiberG: createNutrientValue(0, 'g'),
          proteinG: createNutrientValue(0, 'g'),
          totalFatG: createNutrientValue(0, 'g'),
          saturatedFatG: createNutrientValue(0, 'g'),
          transFatG: createNutrientValue(0, 'g'),
          cholesterolMg: createNutrientValue(0, 'mg'),
          sodiumMg: createNutrientValue(50, 'mg'),
          saltG: createNutrientValue(0.125, 'g')
        },
        parsedIngredients: [],
        detectedAdditives: [],
        rawIngredientsText: '',
        provenance: { sourceType: 'verified_database', rawConfidence: 1.0, missingMandatoryFields: [] }
      };

      const customConfig: ScoringConfigV1 = {
        ...DEFAULT_SCORING_CONFIG_V1,
        nutrition: {
          ...DEFAULT_SCORING_CONFIG_V1.nutrition,
          liquidBeverageMultiplier: 1.0 // Disable scaling
        }
      };

      const resDefault = evaluateProduct(liquidProduct, DEFAULT_SCORING_CONFIG_V1);
      const resCustom = evaluateProduct(liquidProduct, customConfig);

      // Without liquid scaling (multiplier 1.0), 8g sugar has lower penalty than with 0.5 scaling
      expect(resCustom.pillarScores.nutritionScore).toBeGreaterThan(resDefault.pillarScores.nutritionScore);
    });
  });
});
