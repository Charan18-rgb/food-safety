import { describe, it, expect } from 'vitest';
import { createNutrientValue, ProductInput } from '@foodgrade/shared-types';
import { evaluateProduct } from '../src/index.js';

describe('Synthetic Test Matrix (Mathematical Verification)', () => {
  it('Synthetic Product A: Wholesome Ragi & Oats Porridge -> Grade A (Score >= 80)', () => {
    const productA: ProductInput = {
      productName: 'Synthetic Wholesome Ragi Oats Bowl',
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(360, 'kcal'),
        carbohydratesG: createNutrientValue(62, 'g'),
        totalSugarsG: createNutrientValue(1.5, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(10, 'g'),
        proteinG: createNutrientValue(12, 'g'),
        totalFatG: createNutrientValue(4, 'g'),
        saturatedFatG: createNutrientValue(0.8, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(30, 'mg'),
        saltG: createNutrientValue(0.075, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Sprouted Ragi (60%)',
          canonicalId: 'finger_millet',
          canonicalName: 'Finger Millet (Ragi)',
          category: 'whole_grain',
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'none',
          positionIndex: 0
        },
        {
          rawText: 'Rolled Oats (40%)',
          canonicalId: 'oats',
          canonicalName: 'Whole Oats / Rolled Oats',
          category: 'whole_grain',
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'gluten',
          positionIndex: 1
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Sprouted Ragi (60%), Rolled Oats (40%)',
      provenance: {
        sourceType: 'verified_database',
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    };

    const res = evaluateProduct(productA);
    expect(res.grade).toBe('A');
    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(res.confidence.level).toBe('high');
    expect(res.positives.length).toBeGreaterThan(0);
  });

  it('Synthetic Product B: Whole Wheat Atta Biscuit with Moderate Sugar -> Grade B (Score 65-79)', () => {
    const productB: ProductInput = {
      productName: 'Synthetic Atta Digestive Biscuit',
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(440, 'kcal'),
        carbohydratesG: createNutrientValue(68, 'g'),
        totalSugarsG: createNutrientValue(15, 'g'),
        addedSugarsG: createNutrientValue(14, 'g'),
        dietaryFiberG: createNutrientValue(4.5, 'g'),
        proteinG: createNutrientValue(6, 'g'),
        totalFatG: createNutrientValue(16, 'g'),
        saturatedFatG: createNutrientValue(7, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(350, 'mg'),
        saltG: createNutrientValue(0.875, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Whole Wheat Flour (Atta) (55%)',
          canonicalId: 'whole_wheat_flour',
          canonicalName: 'Whole Wheat Flour (Atta)',
          category: 'whole_grain',
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'gluten',
          positionIndex: 0
        },
        {
          rawText: 'Sugar',
          canonicalId: 'sugar',
          canonicalName: 'Refined Sugar (Sucrose)',
          category: 'refined_sweetener',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 1
        },
        {
          rawText: 'Refined Palmolein Oil',
          canonicalId: 'palmolein',
          canonicalName: 'Refined Palmolein Oil',
          category: 'refined_oil',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 2
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Raising agent.'
        }
      ],
      rawIngredientsText: 'Whole Wheat Flour (Atta) (55%), Sugar, Palmolein, Raising Agent (INS 500)',
      provenance: {
        sourceType: 'verified_database',
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    };

    const res = evaluateProduct(productB);
    expect(res.grade).toBe('B');
    expect(res.score).toBeGreaterThanOrEqual(65);
    expect(res.score).toBeLessThan(80);
  });

  it('Synthetic Product C: Moderate Refined Flour & Sugar Snack -> Grade C (Score 50-64)', () => {
    const productC: ProductInput = {
      productName: 'Synthetic Semi-Refined Snack',
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(450, 'kcal'),
        carbohydratesG: createNutrientValue(70, 'g'),
        totalSugarsG: createNutrientValue(24, 'g'),
        addedSugarsG: createNutrientValue(22, 'g'),
        dietaryFiberG: createNutrientValue(2, 'g'),
        proteinG: createNutrientValue(5, 'g'),
        totalFatG: createNutrientValue(16, 'g'),
        saturatedFatG: createNutrientValue(8, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(480, 'mg'),
        saltG: createNutrientValue(1.2, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Refined Wheat Flour (Maida) (50%)',
          canonicalId: 'refined_wheat_flour',
          canonicalName: 'Refined Wheat Flour (Maida)',
          category: 'refined_cereal',
          isWholeGrain: false,
          isRefinedGrain: true,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'gluten',
          positionIndex: 0
        },
        {
          rawText: 'Sugar',
          canonicalId: 'sugar',
          canonicalName: 'Refined Sugar (Sucrose)',
          category: 'refined_sweetener',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 1
        },
        {
          rawText: 'Refined Palmolein',
          canonicalId: 'palmolein',
          canonicalName: 'Refined Palmolein Oil',
          category: 'refined_oil',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 2
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Raising agent.'
        }
      ],
      rawIngredientsText: 'Refined Wheat Flour (Maida), Sugar, Palmolein, Raising Agent (INS 500)',
      provenance: {
        sourceType: 'verified_database',
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    };

    const res = evaluateProduct(productC);
    expect(res.grade).toBe('C');
    expect(res.score).toBeGreaterThanOrEqual(50);
    expect(res.score).toBeLessThan(65);
  });

  it('Synthetic Product D: Commercial Refined Flour Sweet Biscuit with Additives -> Grade D (Score 35-49)', () => {
    const productD: ProductInput = {
      productName: 'Synthetic Commercial Sweet Biscuit',
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(490, 'kcal'),
        carbohydratesG: createNutrientValue(74, 'g'),
        totalSugarsG: createNutrientValue(30, 'g'),
        addedSugarsG: createNutrientValue(28, 'g'), // High sugar
        dietaryFiberG: createNutrientValue(1.0, 'g'),
        proteinG: createNutrientValue(4.5, 'g'),
        totalFatG: createNutrientValue(20, 'g'),
        saturatedFatG: createNutrientValue(10, 'g'), // High sat fat (excess 5g)
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(450, 'mg'),
        saltG: createNutrientValue(1.125, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Refined Wheat Flour (Maida) (60%)',
          canonicalId: 'refined_wheat_flour',
          canonicalName: 'Refined Wheat Flour (Maida)',
          category: 'refined_cereal',
          isWholeGrain: false,
          isRefinedGrain: true,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'gluten',
          positionIndex: 0
        },
        {
          rawText: 'Sugar',
          canonicalId: 'sugar',
          canonicalName: 'Refined Sugar (Sucrose)',
          category: 'refined_sweetener',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 1
        },
        {
          rawText: 'Refined Palmolein',
          canonicalId: 'palmolein',
          canonicalName: 'Refined Palmolein Oil',
          category: 'refined_oil',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 2
        },
        {
          rawText: 'Invert Sugar Syrup',
          canonicalId: 'invert_sugar_syrup',
          canonicalName: 'Invert Sugar Syrup',
          category: 'refined_sweetener',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 3
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 150d',
          canonicalName: 'Caramel IV',
          functionalClass: 'synthetic_colour',
          riskCategory: 'processing_indicator',
          neutralExplanation: 'Caramel colour IV.'
        },
        {
          insCode: 'INS 471',
          canonicalName: 'Mono- and Di-Glycerides of Fatty Acids',
          functionalClass: 'emulsifier_stabilizer',
          riskCategory: 'processing_indicator',
          neutralExplanation: 'Emulsifier.'
        },
        {
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Raising agent.'
        }
      ],
      rawIngredientsText: 'Refined Wheat Flour (Maida), Sugar, Palmolein, Invert Sugar Syrup, Colour (150d), Emulsifier (471)',
      provenance: {
        sourceType: 'verified_database',
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    };

    const res = evaluateProduct(productD);
    expect(res.grade).toBe('D');
    expect(res.score).toBeGreaterThanOrEqual(35);
    expect(res.score).toBeLessThan(50);
  });

  it('Synthetic Product E: Ultra-Processed Confectionery with Trans Fat & Multiple Azo Dyes -> Grade E (Score < 35)', () => {
    const productE: ProductInput = {
      productName: 'Synthetic Ultra-Processed Chemical Confectionery',
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(520, 'kcal'),
        carbohydratesG: createNutrientValue(82, 'g'),
        totalSugarsG: createNutrientValue(65, 'g'),
        addedSugarsG: createNutrientValue(60, 'g'), // Excessive sugar (> 40 pt deduction)
        dietaryFiberG: createNutrientValue(0, 'g'),
        proteinG: createNutrientValue(1, 'g'),
        totalFatG: createNutrientValue(22, 'g'),
        saturatedFatG: createNutrientValue(14, 'g'), // High sat fat (excess 9g)
        transFatG: createNutrientValue(1.2, 'g'), // High trans fat (-15 pts)
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(450, 'mg'),
        saltG: createNutrientValue(1.125, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Liquid Glucose',
          canonicalId: 'liquid_glucose',
          canonicalName: 'Liquid Glucose (Glucose Syrup)',
          category: 'refined_sweetener',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 0
        },
        {
          rawText: 'Hydrogenated Vegetable Fat (Vanaspati)',
          canonicalId: 'hydrogenated_vegetable_oil',
          canonicalName: 'Hydrogenated Vegetable Oil (Vanaspati)',
          category: 'hydrogenated_fat',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 1
        },
        {
          rawText: 'Invert Sugar Syrup',
          canonicalId: 'invert_sugar_syrup',
          canonicalName: 'Invert Sugar Syrup',
          category: 'refined_sweetener',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 2
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 102',
          canonicalName: 'Tartrazine',
          functionalClass: 'synthetic_colour',
          riskCategory: 'caution_load',
          neutralExplanation: 'Synthetic yellow azo dye.'
        },
        {
          insCode: 'INS 122',
          canonicalName: 'Carmoisine',
          functionalClass: 'synthetic_colour',
          riskCategory: 'caution_load',
          neutralExplanation: 'Synthetic red azo dye.'
        },
        {
          insCode: 'INS 211',
          canonicalName: 'Sodium Benzoate',
          functionalClass: 'preservative',
          riskCategory: 'caution_load',
          neutralExplanation: 'Preservative.'
        },
        {
          insCode: 'INS 950',
          canonicalName: 'Acesulfame Potassium',
          functionalClass: 'artificial_sweetener',
          riskCategory: 'caution_load',
          neutralExplanation: 'Artificial sweetener.'
        },
        {
          insCode: 'INS 951',
          canonicalName: 'Aspartame',
          functionalClass: 'artificial_sweetener',
          riskCategory: 'caution_load',
          neutralExplanation: 'Artificial sweetener.'
        }
      ],
      rawIngredientsText: 'Liquid Glucose, Vanaspati, Invert Sugar, Colours (INS 102, INS 122), Preservative (INS 211), Sweeteners (INS 950, INS 951)',
      provenance: {
        sourceType: 'verified_database',
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    };

    const res = evaluateProduct(productE);
    expect(res.grade).toBe('E');
    expect(res.score).toBeLessThan(35);
    expect(res.warnings.length).toBeGreaterThanOrEqual(3);
  });
});
