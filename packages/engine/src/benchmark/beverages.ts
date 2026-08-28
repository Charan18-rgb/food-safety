import { BenchmarkProduct, createNutrientValue } from '@foodgrade/shared-types';

export const BEVERAGE_BENCHMARKS: BenchmarkProduct[] = [
  {
    benchmarkId: 'coca-cola-original',
    product: {
      barcode: '8901764012239',
      productName: 'Coca-Cola Original Taste Carbonated Beverage',
      brand: 'Coca-Cola',
      category: 'Beverages & Soft Drinks',
      servingInfo: { servingSize: 200, servingUnit: 'ml', servingsPerPackage: 1 },
      nutrition: {
        basis: 'per_100ml',
        energyKcal: createNutrientValue(44, 'kcal'),
        carbohydratesG: createNutrientValue(10.6, 'g'),
        totalSugarsG: createNutrientValue(10.6, 'g'),
        addedSugarsG: createNutrientValue(10.6, 'g'),
        dietaryFiberG: createNutrientValue(0, 'g'),
        proteinG: createNutrientValue(0, 'g'),
        totalFatG: createNutrientValue(0, 'g'),
        saturatedFatG: createNutrientValue(0, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(12, 'mg'),
        saltG: createNutrientValue(0.03, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Carbonated Water',
          canonicalId: 'water',
          canonicalName: 'Water',
          category: 'general',
          isWholeGrain: false,
          isRefinedGrain: false,
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
      detectedAdditives: [
        {
          insCode: 'INS 150d',
          canonicalName: 'Caramel IV',
          functionalClass: 'synthetic_colour',
          riskCategory: 'processing_indicator',
          neutralExplanation: 'Caramel colour.'
        },
        {
          insCode: 'INS 338',
          canonicalName: 'Phosphoric Acid',
          functionalClass: 'acidity_regulator',
          riskCategory: 'processing_indicator',
          neutralExplanation: 'Acidity regulator.'
        }
      ],
      rawIngredientsText: 'Carbonated Water, Sugar, Acidity Regulator (338), Colour (150d), Flavours, Caffeine',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Coca-Cola',
      productName: 'Coca-Cola Original Taste Carbonated Beverage',
      category: 'Beverages & Soft Drinks',
      market: 'India',
      country: 'IN',
      barcode: '8901764012239'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Coca-Cola India Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High sugar liquid drink (10.6g added sugar per 100ml) with Caramel IV (150d).'
    }
  },
  {
    benchmarkId: 'frooti-mango-drink',
    product: {
      barcode: '8901719114014',
      productName: 'Parle Frooti Fresh N Juicy Mango Drink',
      brand: 'Parle Agro',
      category: 'Beverages & Soft Drinks',
      servingInfo: { servingSize: 160, servingUnit: 'ml', servingsPerPackage: 1 },
      nutrition: {
        basis: 'per_100ml',
        energyKcal: createNutrientValue(65, 'kcal'),
        carbohydratesG: createNutrientValue(16.2, 'g'),
        totalSugarsG: createNutrientValue(15.2, 'g'),
        addedSugarsG: createNutrientValue(13.2, 'g'),
        dietaryFiberG: createNutrientValue(0.4, 'g'),
        proteinG: createNutrientValue(0.1, 'g'),
        totalFatG: createNutrientValue(0, 'g'),
        saturatedFatG: createNutrientValue(0, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(25, 'mg'),
        saltG: createNutrientValue(0.0625, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Water',
          canonicalId: 'water',
          canonicalName: 'Water',
          category: 'general',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 0
        },
        {
          rawText: 'Mango Pulp (19.5%)',
          canonicalId: 'mango_pulp',
          canonicalName: 'Mango Pulp / Puree',
          category: 'vegetable_fruit',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
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
          insCode: 'INS 330',
          canonicalName: 'Citric Acid',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Acidity regulator.'
        },
        {
          insCode: 'INS 211',
          canonicalName: 'Sodium Benzoate',
          functionalClass: 'preservative',
          riskCategory: 'caution_load',
          neutralExplanation: 'Chemical preservative.'
        },
        {
          insCode: 'INS 110',
          canonicalName: 'Sunset Yellow FCF',
          functionalClass: 'synthetic_colour',
          riskCategory: 'caution_load',
          neutralExplanation: 'Synthetic food colour.'
        }
      ],
      rawIngredientsText: 'Water, Mango Pulp (19.5%), Sugar, Acidity Regulator (330), Preservative (211), Synthetic Food Colour (110)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Parle Agro',
      productName: 'Parle Frooti Fresh N Juicy Mango Drink',
      category: 'Beverages & Soft Drinks',
      market: 'India',
      country: 'IN',
      barcode: '8901719114014'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Parle Agro Pvt. Ltd. retail packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Mango drink containing 19.5% fruit pulp, with 13.2g added sugar per 100ml, Sunset Yellow (110) and Sodium Benzoate (211).'
    }
  },
  {
    benchmarkId: 'tropicana-100-orange-juice',
    product: {
      barcode: '8901491103237',
      productName: 'Tropicana 100% Orange Juice',
      brand: 'Tropicana',
      category: 'Beverages & Soft Drinks',
      servingInfo: { servingSize: 200, servingUnit: 'ml', servingsPerPackage: 1 },
      nutrition: {
        basis: 'per_100ml',
        energyKcal: createNutrientValue(48, 'kcal'),
        carbohydratesG: createNutrientValue(11.2, 'g'),
        totalSugarsG: createNutrientValue(9.5, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(0.5, 'g'),
        proteinG: createNutrientValue(0.8, 'g'),
        totalFatG: createNutrientValue(0, 'g'),
        saturatedFatG: createNutrientValue(0, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(10, 'mg'),
        saltG: createNutrientValue(0.025, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Reconstituted Orange Juice (100%)',
          canonicalId: 'lemon_juice',
          canonicalName: 'Lemon / Lime Juice Concentrate',
          category: 'vegetable_fruit',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'none',
          positionIndex: 0
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Water, Orange Juice Concentrate (100% Juice Reconstituted)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Tropicana',
      productName: 'Tropicana 100% Orange Juice',
      category: 'Beverages & Soft Drinks',
      market: 'India',
      country: 'IN',
      barcode: '8901491103237'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Varun Beverages / PepsiCo packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: '100% fruit juice with zero added sugar and clean label.'
    }
  },
  {
    benchmarkId: 'real-fruit-power-mixed-fruit',
    product: {
      barcode: '8901207010414',
      productName: 'Dabur Real Fruit Power Mixed Fruit Juice',
      brand: 'Dabur Real',
      category: 'Beverages & Soft Drinks',
      servingInfo: { servingSize: 200, servingUnit: 'ml', servingsPerPackage: 5 },
      nutrition: {
        basis: 'per_100ml',
        energyKcal: createNutrientValue(56, 'kcal'),
        carbohydratesG: createNutrientValue(14.0, 'g'),
        totalSugarsG: createNutrientValue(13.0, 'g'),
        addedSugarsG: createNutrientValue(7.5, 'g'),
        dietaryFiberG: createNutrientValue(0.5, 'g'),
        proteinG: createNutrientValue(0.4, 'g'),
        totalFatG: createNutrientValue(0, 'g'),
        saturatedFatG: createNutrientValue(0, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(15, 'mg'),
        saltG: createNutrientValue(0.0375, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Water',
          canonicalId: 'water',
          canonicalName: 'Water',
          category: 'general',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 0
        },
        {
          rawText: 'Mixed Fruit Juice Concentrate',
          canonicalId: 'lemon_juice',
          canonicalName: 'Lemon / Lime Juice Concentrate',
          category: 'vegetable_fruit',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
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
          insCode: 'INS 330',
          canonicalName: 'Citric Acid',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Acidity regulator.'
        },
        {
          insCode: 'INS 300',
          canonicalName: 'Ascorbic Acid',
          functionalClass: 'antioxidant',
          riskCategory: 'neutral',
          neutralExplanation: 'Vitamin C antioxidant.'
        }
      ],
      rawIngredientsText: 'Water, Mixed Fruit Concentrate, Sugar, Acidity Regulator (330), Antioxidant (300)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Dabur Real',
      productName: 'Dabur Real Fruit Power Mixed Fruit Juice',
      category: 'Beverages & Soft Drinks',
      market: 'India',
      country: 'IN',
      barcode: '8901207010414'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Dabur India Ltd. retail carton 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Commercial fruit beverage with 7.5g added sugar per 100ml.'
    }
  }
];
