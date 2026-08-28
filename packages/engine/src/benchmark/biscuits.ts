import { BenchmarkProduct, createNutrientValue } from '@foodgrade/shared-types';

export const BISCUIT_BENCHMARKS: BenchmarkProduct[] = [
  {
    benchmarkId: 'parle-g-original',
    product: {
      barcode: '8901719101052',
      productName: 'Parle-G Original Gluco Biscuits',
      brand: 'Parle',
      category: 'Biscuits & Cookies',
      servingInfo: { servingSize: 25, servingUnit: 'g', servingsPerPackage: 4 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(454, 'kcal'),
        carbohydratesG: createNutrientValue(78.2, 'g'),
        totalSugarsG: createNutrientValue(26.3, 'g'),
        addedSugarsG: createNutrientValue(25.5, 'g'),
        dietaryFiberG: createNutrientValue(1.5, 'g'),
        proteinG: createNutrientValue(6.7, 'g'),
        totalFatG: createNutrientValue(12.8, 'g'),
        saturatedFatG: createNutrientValue(6.0, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(280, 'mg'),
        saltG: createNutrientValue(0.7, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Refined Wheat Flour (Maida) (67%)',
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
          rawText: 'Refined Palm Oil',
          canonicalId: 'palm_oil',
          canonicalName: 'Palm Oil',
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
        },
        {
          rawText: 'Milk Solids',
          canonicalId: 'milk_solids',
          canonicalName: 'Milk Solids (Dairy Powder / Fat)',
          category: 'dairy',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'milk',
          positionIndex: 4
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Leavening raising agent.'
        },
        {
          insCode: 'INS 503',
          canonicalName: 'Ammonium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Leavening agent.'
        }
      ],
      rawIngredientsText: 'Refined Wheat Flour (Maida) (67%), Sugar, Refined Palm Oil, Invert Sugar Syrup, Milk Solids, Raising Agents [500(ii), 503(ii)]',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Parle',
      productName: 'Parle-G Original Gluco Biscuits',
      category: 'Biscuits & Cookies',
      market: 'India',
      country: 'IN',
      barcode: '8901719101052'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Parle Products Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High-volume staple Indian biscuit with Maida, sugar, and palm oil.',
      expectedProfile: 'Refined flour with 25.5g added sugar and palm oil.'
    }
  },
  {
    benchmarkId: 'britannia-good-day-butter',
    product: {
      barcode: '8901063013896',
      productName: 'Britannia Good Day Butter Cookies',
      brand: 'Britannia',
      category: 'Biscuits & Cookies',
      servingInfo: { servingSize: 30, servingUnit: 'g', servingsPerPackage: 4 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(493, 'kcal'),
        carbohydratesG: createNutrientValue(68.0, 'g'),
        totalSugarsG: createNutrientValue(23.0, 'g'),
        addedSugarsG: createNutrientValue(22.0, 'g'),
        dietaryFiberG: createNutrientValue(1.8, 'g'),
        proteinG: createNutrientValue(7.0, 'g'),
        totalFatG: createNutrientValue(21.5, 'g'),
        saturatedFatG: createNutrientValue(10.5, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(6, 'mg'),
        sodiumMg: createNutrientValue(310, 'mg'),
        saltG: createNutrientValue(0.775, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Refined Wheat Flour (Maida) (58%)',
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
          rawText: 'Refined Palm Oil',
          canonicalId: 'palm_oil',
          canonicalName: 'Palm Oil',
          category: 'refined_oil',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 2
        },
        {
          rawText: 'Butter (2%)',
          canonicalId: 'butter',
          canonicalName: 'Butter (Makhan)',
          category: 'dairy',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'milk',
          positionIndex: 3
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Leavening raising agent.'
        }
      ],
      rawIngredientsText: 'Refined Wheat Flour (Maida) (58%), Sugar, Refined Palm Oil, Butter (2%), Invert Sugar Syrup, Raising Agents [500(ii), 503(ii)]',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Britannia',
      productName: 'Britannia Good Day Butter Cookies',
      category: 'Biscuits & Cookies',
      market: 'India',
      country: 'IN',
      barcode: '8901063013896'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Britannia Industries Ltd. retail label 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Marketed butter cookie with 22g added sugar and 10.5g saturated fat.'
    }
  },
  {
    benchmarkId: 'britannia-nutrichoice-digestive',
    product: {
      barcode: '8901063024823',
      productName: 'Britannia NutriChoice Digestive High Fibre Biscuits',
      brand: 'Britannia',
      category: 'Biscuits & Cookies',
      servingInfo: { servingSize: 25, servingUnit: 'g', servingsPerPackage: 4 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(465, 'kcal'),
        carbohydratesG: createNutrientValue(68.0, 'g'),
        totalSugarsG: createNutrientValue(15.0, 'g'),
        addedSugarsG: createNutrientValue(14.0, 'g'),
        dietaryFiberG: createNutrientValue(6.0, 'g'),
        proteinG: createNutrientValue(8.0, 'g'),
        totalFatG: createNutrientValue(18.0, 'g'),
        saturatedFatG: createNutrientValue(8.5, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(380, 'mg'),
        saltG: createNutrientValue(0.95, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Whole Wheat Flour (Atta) (50%)',
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
          rawText: 'Refined Palm Oil',
          canonicalId: 'palm_oil',
          canonicalName: 'Palm Oil',
          category: 'refined_oil',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 1
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
          positionIndex: 2
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Leavening raising agent.'
        }
      ],
      rawIngredientsText: 'Whole Wheat Flour (Atta) (50%), Refined Palm Oil, Sugar, Wheat Bran (4.5%), Raising Agents [500(ii), 503(ii)]',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Britannia',
      productName: 'Britannia NutriChoice Digestive High Fibre Biscuits',
      category: 'Biscuits & Cookies',
      market: 'India',
      country: 'IN',
      barcode: '8901063024823'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Britannia NutriChoice retail packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Health-marketed digestive biscuit with 50% whole wheat flour and 6g fiber.'
    }
  },
  {
    benchmarkId: 'sunfeast-dark-fantasy-choco-fills',
    product: {
      barcode: '8901725181223',
      productName: 'Sunfeast Dark Fantasy Choco Fills',
      brand: 'ITC Sunfeast',
      category: 'Biscuits & Cookies',
      servingInfo: { servingSize: 25, servingUnit: 'g', servingsPerPackage: 3 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(515, 'kcal'),
        carbohydratesG: createNutrientValue(64.0, 'g'),
        totalSugarsG: createNutrientValue(38.0, 'g'),
        addedSugarsG: createNutrientValue(35.0, 'g'),
        dietaryFiberG: createNutrientValue(2.0, 'g'),
        proteinG: createNutrientValue(5.5, 'g'),
        totalFatG: createNutrientValue(26.5, 'g'),
        saturatedFatG: createNutrientValue(13.0, 'g'),
        transFatG: createNutrientValue(0.05, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(190, 'mg'),
        saltG: createNutrientValue(0.475, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Hydrogenated Vegetable Fat',
          canonicalId: 'hydrogenated_vegetable_oil',
          canonicalName: 'Hydrogenated Vegetable Oil (Vanaspati)',
          category: 'hydrogenated_fat',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 0
        },
        {
          rawText: 'Refined Wheat Flour (Maida)',
          canonicalId: 'refined_wheat_flour',
          canonicalName: 'Refined Wheat Flour (Maida)',
          category: 'refined_cereal',
          isWholeGrain: false,
          isRefinedGrain: true,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'gluten',
          positionIndex: 1
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
          positionIndex: 2
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 322',
          canonicalName: 'Soya Lecithin',
          functionalClass: 'emulsifier_stabilizer',
          riskCategory: 'neutral',
          neutralExplanation: 'Plant-derived emulsifier.'
        },
        {
          insCode: 'INS 150d',
          canonicalName: 'Caramel IV',
          functionalClass: 'synthetic_colour',
          riskCategory: 'processing_indicator',
          neutralExplanation: 'Caramel colour.'
        }
      ],
      rawIngredientsText: 'Choco Creme, Refined Wheat Flour (Maida), Hydrogenated Vegetable Fat, Sugar, Colour (150d)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'ITC Sunfeast',
      productName: 'Sunfeast Dark Fantasy Choco Fills',
      category: 'Biscuits & Cookies',
      market: 'India',
      country: 'IN',
      barcode: '8901725181223'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'ITC Limited retail packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High indulgence chocolate biscuit with 35g added sugar and hydrogenated fat.'
    }
  },
  {
    benchmarkId: 'oreo-original-vanilla',
    product: {
      barcode: '7622201737719',
      productName: 'Cadbury Oreo Original Vanilla Sandwich Biscuits',
      brand: 'Cadbury Oreo',
      category: 'Biscuits & Cookies',
      servingInfo: { servingSize: 28.5, servingUnit: 'g', servingsPerPackage: 4 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(483, 'kcal'),
        carbohydratesG: createNutrientValue(71.5, 'g'),
        totalSugarsG: createNutrientValue(38.0, 'g'),
        addedSugarsG: createNutrientValue(36.5, 'g'),
        dietaryFiberG: createNutrientValue(2.1, 'g'),
        proteinG: createNutrientValue(5.1, 'g'),
        totalFatG: createNutrientValue(19.5, 'g'),
        saturatedFatG: createNutrientValue(9.5, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(440, 'mg'),
        saltG: createNutrientValue(1.1, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Refined Wheat Flour (Maida)',
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
          rawText: 'Refined Palm Oil',
          canonicalId: 'palm_oil',
          canonicalName: 'Palm Oil',
          category: 'refined_oil',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 2
        },
        {
          rawText: 'Cocoa Solids (4.5%)',
          canonicalId: 'cocoa_solids',
          canonicalName: 'Cocoa Solids / Cocoa Powder',
          category: 'general',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 3
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
          positionIndex: 4
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Leavening raising agent.'
        },
        {
          insCode: 'INS 322',
          canonicalName: 'Soya Lecithin',
          functionalClass: 'emulsifier_stabilizer',
          riskCategory: 'neutral',
          neutralExplanation: 'Plant-derived emulsifier.'
        }
      ],
      rawIngredientsText: 'Refined Wheat Flour (Maida), Sugar, Refined Palm Oil, Cocoa Solids (4.5%), Invert Sugar Syrup, Raising Agents (500(ii), 503(ii)), Emulsifier (322)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Cadbury Oreo',
      productName: 'Cadbury Oreo Original Vanilla Sandwich Biscuits',
      category: 'Biscuits & Cookies',
      market: 'India',
      country: 'IN',
      barcode: '7622201737719'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Mondelez India Foods Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High-sugar creme-filled biscuit (36.5g added sugar per 100g).'
    }
  }
];
