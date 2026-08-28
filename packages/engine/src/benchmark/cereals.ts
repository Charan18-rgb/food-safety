import { BenchmarkProduct, createNutrientValue } from '@foodgrade/shared-types';

export const CEREAL_BENCHMARKS: BenchmarkProduct[] = [
  {
    benchmarkId: 'quaker-rolled-oats',
    product: {
      barcode: '8901491101837',
      productName: 'Quaker 100% Wholegrain Rolled Oats',
      brand: 'Quaker',
      category: 'Breakfast Cereals & Oats',
      servingInfo: { servingSize: 40, servingUnit: 'g', servingsPerPackage: 10 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(407, 'kcal'),
        carbohydratesG: createNutrientValue(68.5, 'g'),
        totalSugarsG: createNutrientValue(0.5, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(10.5, 'g'),
        proteinG: createNutrientValue(12.5, 'g'),
        totalFatG: createNutrientValue(9.0, 'g'),
        saturatedFatG: createNutrientValue(1.9, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(9, 'mg'),
        saltG: createNutrientValue(0.0225, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Rolled Oats (100%)',
          canonicalId: 'oats',
          canonicalName: 'Whole Oats / Rolled Oats',
          category: 'whole_grain',
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'gluten',
          positionIndex: 0
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Rolled Oats (100%)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Quaker',
      productName: 'Quaker 100% Wholegrain Rolled Oats',
      category: 'Breakfast Cereals & Oats',
      market: 'India',
      country: 'IN',
      barcode: '8901491101837'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'PepsiCo India Holdings Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Pure single-ingredient whole grain oats with 0g added sugar.'
    }
  },
  {
    benchmarkId: 'kelloggs-corn-flakes-original',
    product: {
      barcode: '8901499008107',
      productName: "Kellogg's Corn Flakes Original",
      brand: "Kellogg's",
      category: 'Breakfast Cereals & Oats',
      servingInfo: { servingSize: 30, servingUnit: 'g', servingsPerPackage: 15 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(378, 'kcal'),
        carbohydratesG: createNutrientValue(84.0, 'g'),
        totalSugarsG: createNutrientValue(8.5, 'g'),
        addedSugarsG: createNutrientValue(7.5, 'g'),
        dietaryFiberG: createNutrientValue(2.5, 'g'),
        proteinG: createNutrientValue(7.0, 'g'),
        totalFatG: createNutrientValue(0.8, 'g'),
        saturatedFatG: createNutrientValue(0.2, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(680, 'mg'),
        saltG: createNutrientValue(1.7, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Corn Grits (91%)',
          canonicalId: 'corn_flour',
          canonicalName: 'Corn Flour / Maize Starch',
          category: 'refined_cereal',
          isWholeGrain: false,
          isRefinedGrain: true,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
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
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Corn Grits (91%), Sugar, Cereal Extract, Iodized Salt',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: "Kellogg's",
      productName: "Kellogg's Corn Flakes Original",
      category: 'Breakfast Cereals & Oats',
      market: 'India',
      country: 'IN',
      barcode: '8901499008107'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Kellogg India Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Corn flakes with 7.5g added sugar and 680mg sodium.'
    }
  },
  {
    benchmarkId: 'kelloggs-chocos',
    product: {
      barcode: '8901499009210',
      productName: "Kellogg's Chocos Chocolate Cereal",
      brand: "Kellogg's",
      category: 'Breakfast Cereals & Oats',
      servingInfo: { servingSize: 30, servingUnit: 'g', servingsPerPackage: 12 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(385, 'kcal'),
        carbohydratesG: createNutrientValue(83.0, 'g'),
        totalSugarsG: createNutrientValue(30.0, 'g'),
        addedSugarsG: createNutrientValue(28.0, 'g'),
        dietaryFiberG: createNutrientValue(4.5, 'g'),
        proteinG: createNutrientValue(8.5, 'g'),
        totalFatG: createNutrientValue(2.8, 'g'),
        saturatedFatG: createNutrientValue(1.2, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(350, 'mg'),
        saltG: createNutrientValue(0.875, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Whole Wheat Flour (28%)',
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
          rawText: 'Refined Wheat Flour (Maida) (27%)',
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
        },
        {
          rawText: 'Cocoa Solids (5.5%)',
          canonicalId: 'cocoa_solids',
          canonicalName: 'Cocoa Solids / Cocoa Powder',
          category: 'general',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
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
          neutralExplanation: 'Caramel colour.'
        }
      ],
      rawIngredientsText: 'Whole Wheat Flour (28%), Refined Wheat Flour (Maida) (27%), Sugar, Cocoa Solids (5.5%), Cereal Extract, Colour (150d)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: "Kellogg's",
      productName: "Kellogg's Chocos Chocolate Cereal",
      category: 'Breakfast Cereals & Oats',
      market: 'India',
      country: 'IN',
      barcode: '8901499009210'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Kellogg India Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Child-targeted chocolate cereal with 28g added sugar.'
    }
  },
  {
    benchmarkId: 'saffola-masala-oats-classic',
    product: {
      barcode: '8901088056236',
      productName: 'Saffola Masala Oats Classic Masala',
      brand: 'Saffola',
      category: 'Breakfast Cereals & Oats',
      servingInfo: { servingSize: 38, servingUnit: 'g', servingsPerPackage: 1 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(392, 'kcal'),
        carbohydratesG: createNutrientValue(68.0, 'g'),
        totalSugarsG: createNutrientValue(5.5, 'g'),
        addedSugarsG: createNutrientValue(2.0, 'g'),
        dietaryFiberG: createNutrientValue(7.5, 'g'),
        proteinG: createNutrientValue(9.5, 'g'),
        totalFatG: createNutrientValue(9.0, 'g'),
        saturatedFatG: createNutrientValue(1.8, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(880, 'mg'), // High sodium for oats
        saltG: createNutrientValue(2.2, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Rolled Oats (73.6%)',
          canonicalId: 'oats',
          canonicalName: 'Whole Oats / Rolled Oats',
          category: 'whole_grain',
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'gluten',
          positionIndex: 0
        },
        {
          rawText: 'Refined Rice Bran Oil',
          canonicalId: 'rice_bran_oil',
          canonicalName: 'Rice Bran Oil',
          category: 'refined_oil',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 1
        },
        {
          rawText: 'Iodised Salt',
          canonicalId: 'iodized_salt',
          canonicalName: 'Iodized Salt (Edible Common Salt)',
          category: 'salt',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 2
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 627',
          canonicalName: 'Disodium Guanylate',
          functionalClass: 'flavour_enhancer',
          riskCategory: 'processing_indicator',
          neutralExplanation: 'Flavour enhancer.'
        },
        {
          insCode: 'INS 631',
          canonicalName: 'Disodium Inosinate',
          functionalClass: 'flavour_enhancer',
          riskCategory: 'processing_indicator',
          neutralExplanation: 'Flavour enhancer.'
        }
      ],
      rawIngredientsText: 'Rolled Oats (73.6%), Spices & Condiments, Refined Rice Bran Oil, Dried Vegetables, Iodised Salt, Flavour Enhancers (627, 631)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Saffola',
      productName: 'Saffola Masala Oats Classic Masala',
      category: 'Breakfast Cereals & Oats',
      market: 'India',
      country: 'IN',
      barcode: '8901088056236'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Marico Limited packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Savory oats product combining 73.6% whole grain oats with 880mg sodium and flavour enhancers.'
    }
  }
];
