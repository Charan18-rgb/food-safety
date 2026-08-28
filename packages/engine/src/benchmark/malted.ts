import { BenchmarkProduct, createNutrientValue } from '@foodgrade/shared-types';

export const MALTED_BENCHMARKS: BenchmarkProduct[] = [
  {
    benchmarkId: 'cadbury-bournvita-chocolate',
    product: {
      barcode: '8901233020013',
      productName: 'Cadbury Bournvita Chocolate Health Food Drink',
      brand: 'Cadbury',
      category: 'Malted & Health Drinks',
      servingInfo: { servingSize: 20, servingUnit: 'g', servingsPerPackage: 25 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(382, 'kcal'),
        carbohydratesG: createNutrientValue(85.0, 'g'),
        totalSugarsG: createNutrientValue(37.0, 'g'),
        addedSugarsG: createNutrientValue(32.0, 'g'),
        dietaryFiberG: createNutrientValue(3.5, 'g'),
        proteinG: createNutrientValue(7.0, 'g'),
        totalFatG: createNutrientValue(1.8, 'g'),
        saturatedFatG: createNutrientValue(0.9, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(180, 'mg'),
        saltG: createNutrientValue(0.45, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Cereal Extract (44%)',
          canonicalId: 'malt_extract',
          canonicalName: 'Malt Extract',
          category: 'refined_sweetener',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
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
          rawText: 'Cocoa Solids (6.5%)',
          canonicalId: 'cocoa_solids',
          canonicalName: 'Cocoa Solids / Cocoa Powder',
          category: 'general',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 2
        },
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
          positionIndex: 3
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
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Raising agent.'
        }
      ],
      rawIngredientsText: 'Cereal Extract (44%), Sugar, Cocoa Solids (6.5%), Liquid Glucose, Milk Solids, Vitamins & Minerals, Emulsifier (322), Raising Agent (500(ii))',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Cadbury',
      productName: 'Cadbury Bournvita Chocolate Health Food Drink',
      category: 'Malted & Health Drinks',
      market: 'India',
      country: 'IN',
      barcode: '8901233020013'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Mondelez India Foods Pvt. Ltd. retail packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Prominently marketed health drink with 32g added sugar per 100g and liquid glucose.'
    }
  },
  {
    benchmarkId: 'horlicks-classic-malt',
    product: {
      barcode: '8901030865589',
      productName: 'Horlicks Classic Malt Health Drink',
      brand: 'Horlicks',
      category: 'Malted & Health Drinks',
      servingInfo: { servingSize: 27, servingUnit: 'g', servingsPerPackage: 18 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(377, 'kcal'),
        carbohydratesG: createNutrientValue(79.0, 'g'),
        totalSugarsG: createNutrientValue(26.0, 'g'),
        addedSugarsG: createNutrientValue(13.5, 'g'),
        dietaryFiberG: createNutrientValue(4.0, 'g'),
        proteinG: createNutrientValue(11.0, 'g'),
        totalFatG: createNutrientValue(2.0, 'g'),
        saturatedFatG: createNutrientValue(1.0, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(400, 'mg'),
        saltG: createNutrientValue(1.0, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Malted Barley (39%)',
          canonicalId: 'barley',
          canonicalName: 'Barley (Jau)',
          category: 'whole_grain',
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'gluten',
          positionIndex: 0
        },
        {
          rawText: 'Wheat Flour (Atta) (27%)',
          canonicalId: 'whole_wheat_flour',
          canonicalName: 'Whole Wheat Flour (Atta)',
          category: 'whole_grain',
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'gluten',
          positionIndex: 1
        },
        {
          rawText: 'Milk Solids (14%)',
          canonicalId: 'milk_solids',
          canonicalName: 'Milk Solids (Dairy Powder / Fat)',
          category: 'dairy',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'milk',
          positionIndex: 2
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
          positionIndex: 3
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Malted Barley (39%), Wheat Flour (Atta) (27%), Milk Solids (14%), Sugar, Minerals, Vitamins',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Horlicks',
      productName: 'Horlicks Classic Malt Health Drink',
      category: 'Malted & Health Drinks',
      market: 'India',
      country: 'IN',
      barcode: '8901030865589'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Hindustan Unilever Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Malted grain beverage with 11g protein, whole grains, and 13.5g added sugar.'
    }
  },
  {
    benchmarkId: 'complan-royal-chocolate',
    product: {
      barcode: '8901571000142',
      productName: 'Complan Royal Chocolate Nutrition and Health Drink',
      brand: 'Complan',
      category: 'Malted & Health Drinks',
      servingInfo: { servingSize: 33, servingUnit: 'g', servingsPerPackage: 15 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(419, 'kcal'),
        carbohydratesG: createNutrientValue(62.0, 'g'),
        totalSugarsG: createNutrientValue(28.0, 'g'),
        addedSugarsG: createNutrientValue(24.0, 'g'),
        dietaryFiberG: createNutrientValue(2.0, 'g'),
        proteinG: createNutrientValue(18.0, 'g'), // High milk protein (18g)
        totalFatG: createNutrientValue(11.0, 'g'),
        saturatedFatG: createNutrientValue(5.5, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(15, 'mg'),
        sodiumMg: createNutrientValue(220, 'mg'),
        saltG: createNutrientValue(0.55, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Milk Solids (54.8%)',
          canonicalId: 'milk_solids',
          canonicalName: 'Milk Solids (Dairy Powder / Fat)',
          category: 'dairy',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'milk',
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
          rawText: 'Cocoa Solids (4.5%)',
          canonicalId: 'cocoa_solids',
          canonicalName: 'Cocoa Solids / Cocoa Powder',
          category: 'general',
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
          insCode: 'INS 150d',
          canonicalName: 'Caramel IV',
          functionalClass: 'synthetic_colour',
          riskCategory: 'processing_indicator',
          neutralExplanation: 'Caramel colour.'
        }
      ],
      rawIngredientsText: 'Milk Solids (54.8%), Sugar, Peanut Oil, Cocoa Solids (4.5%), Minerals, Vitamins, Colour (150d)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Complan',
      productName: 'Complan Royal Chocolate Nutrition and Health Drink',
      category: 'Malted & Health Drinks',
      market: 'India',
      country: 'IN',
      barcode: '8901571000142'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Zydus Wellness Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High-protein milk solids beverage (18g protein) containing 24g added sugar per 100g.'
    }
  }
];
