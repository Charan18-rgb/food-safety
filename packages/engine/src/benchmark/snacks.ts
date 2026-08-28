import { BenchmarkProduct, createNutrientValue } from '@foodgrade/shared-types';

export const SNACK_BENCHMARKS: BenchmarkProduct[] = [
  {
    benchmarkId: 'lays-indias-magic-masala',
    product: {
      barcode: '8901491100236',
      productName: "Lay's India's Magic Masala Potato Chips",
      brand: "Lay's",
      category: 'Snacks & Namkeen',
      servingInfo: { servingSize: 30, servingUnit: 'g', servingsPerPackage: 2 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(544, 'kcal'),
        carbohydratesG: createNutrientValue(52.5, 'g'),
        totalSugarsG: createNutrientValue(4.5, 'g'),
        addedSugarsG: createNutrientValue(3.5, 'g'),
        dietaryFiberG: createNutrientValue(3.8, 'g'),
        proteinG: createNutrientValue(7.2, 'g'),
        totalFatG: createNutrientValue(34.0, 'g'),
        saturatedFatG: createNutrientValue(15.5, 'g'),
        transFatG: createNutrientValue(0.1, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(820, 'mg'),
        saltG: createNutrientValue(2.05, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Potato (52%)',
          canonicalId: 'potato',
          canonicalName: 'Potato',
          category: 'vegetable_fruit',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 0
        },
        {
          rawText: 'Edible Vegetable Oil (Palmolein)',
          canonicalId: 'palmolein',
          canonicalName: 'Refined Palmolein Oil',
          category: 'refined_oil',
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
      rawIngredientsText: 'Potato (52%), Edible Vegetable Oil (Palmolein), Spices, Salt, Sugar, Flavour Enhancers (627, 631)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: "Lay's",
      productName: "Lay's India's Magic Masala Potato Chips",
      category: 'Snacks & Namkeen',
      market: 'India',
      country: 'IN',
      barcode: '8901491100236'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'PepsiCo India Holdings retail packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High palmolein (15.5g saturated fat) and sodium (820mg).'
    }
  },
  {
    benchmarkId: 'kurkure-masala-munch',
    product: {
      barcode: '8901491001229',
      productName: 'Kurkure Masala Munch Crisps',
      brand: 'Kurkure',
      category: 'Snacks & Namkeen',
      servingInfo: { servingSize: 30, servingUnit: 'g', servingsPerPackage: 3 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(558, 'kcal'),
        carbohydratesG: createNutrientValue(54.0, 'g'),
        totalSugarsG: createNutrientValue(2.0, 'g'),
        addedSugarsG: createNutrientValue(1.5, 'g'),
        dietaryFiberG: createNutrientValue(3.0, 'g'),
        proteinG: createNutrientValue(6.0, 'g'),
        totalFatG: createNutrientValue(35.5, 'g'),
        saturatedFatG: createNutrientValue(16.0, 'g'),
        transFatG: createNutrientValue(0.1, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(890, 'mg'),
        saltG: createNutrientValue(2.225, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Rice Meal (42.8%)',
          canonicalId: 'white_rice',
          canonicalName: 'White Rice / Polished Rice',
          category: 'refined_cereal',
          isWholeGrain: false,
          isRefinedGrain: true,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 0
        },
        {
          rawText: 'Edible Vegetable Oil (Palmolein)',
          canonicalId: 'palmolein',
          canonicalName: 'Refined Palmolein Oil',
          category: 'refined_oil',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 1
        },
        {
          rawText: 'Gram Meal (Besan) (8.5%)',
          canonicalId: 'chickpea_flour',
          canonicalName: 'Gram Flour (Besan)',
          category: 'pulse_legume',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
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
        }
      ],
      rawIngredientsText: 'Rice Meal (42.8%), Edible Vegetable Oil (Palmolein), Corn Meal, Gram Meal (8.5%), Spices, Salt, Acidity Regulator (330)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Kurkure',
      productName: 'Kurkure Masala Munch Crisps',
      category: 'Snacks & Namkeen',
      market: 'India',
      country: 'IN',
      barcode: '8901491001229'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'PepsiCo India Holdings retail packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Extruded snack fried in Palmolein (16g sat fat) with 890mg sodium.'
    }
  },
  {
    benchmarkId: 'haldirams-bhujia-sev',
    product: {
      barcode: '8904004400103',
      productName: "Haldiram's Nagpur Bhujia Sev",
      brand: "Haldiram's",
      category: 'Snacks & Namkeen',
      servingInfo: { servingSize: 35, servingUnit: 'g', servingsPerPackage: 6 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(584, 'kcal'),
        carbohydratesG: createNutrientValue(42.0, 'g'),
        totalSugarsG: createNutrientValue(1.5, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(4.5, 'g'),
        proteinG: createNutrientValue(13.5, 'g'),
        totalFatG: createNutrientValue(42.0, 'g'),
        saturatedFatG: createNutrientValue(18.0, 'g'),
        transFatG: createNutrientValue(0.1, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(740, 'mg'),
        saltG: createNutrientValue(1.85, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Tepary Bean Flour (Moth Dal) (43%)',
          canonicalId: 'moth_beans',
          canonicalName: 'Moth Bean (Moth Dal)',
          category: 'pulse_legume',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'none',
          positionIndex: 0
        },
        {
          rawText: 'Gram Pulse Flour (Besan) (12%)',
          canonicalId: 'chickpea_flour',
          canonicalName: 'Gram Flour (Besan)',
          category: 'pulse_legume',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'none',
          positionIndex: 1
        },
        {
          rawText: 'Edible Vegetable Oil (Palmolein)',
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
      detectedAdditives: [],
      rawIngredientsText: 'Tepary Bean Flour (43%), Gram Pulse Flour (12%), Edible Vegetable Oil (Palmolein), Mixed Spices, Iodised Salt',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: "Haldiram's",
      productName: "Haldiram's Nagpur Bhujia Sev",
      category: 'Snacks & Namkeen',
      market: 'India',
      country: 'IN',
      barcode: '8904004400103'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Haldiram Foods International Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High-protein pulse namkeen (moth dal + besan), but deep-fried in palmolein (18g sat fat).'
    }
  },
  {
    benchmarkId: 'haldirams-aloo-bhujia',
    product: {
      barcode: '8904004400219',
      productName: "Haldiram's Nagpur Aloo Bhujia",
      brand: "Haldiram's",
      category: 'Snacks & Namkeen',
      servingInfo: { servingSize: 35, servingUnit: 'g', servingsPerPackage: 6 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(566, 'kcal'),
        carbohydratesG: createNutrientValue(44.0, 'g'),
        totalSugarsG: createNutrientValue(2.0, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(4.0, 'g'),
        proteinG: createNutrientValue(9.5, 'g'),
        totalFatG: createNutrientValue(39.0, 'g'),
        saturatedFatG: createNutrientValue(17.0, 'g'),
        transFatG: createNutrientValue(0.1, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(780, 'mg'),
        saltG: createNutrientValue(1.95, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Potato (22%)',
          canonicalId: 'potato',
          canonicalName: 'Potato',
          category: 'vegetable_fruit',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 0
        },
        {
          rawText: 'Edible Vegetable Oil (Palmolein)',
          canonicalId: 'palmolein',
          canonicalName: 'Refined Palmolein Oil',
          category: 'refined_oil',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: true,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 1
        },
        {
          rawText: 'Gram Pulse Flour (Besan) (18%)',
          canonicalId: 'chickpea_flour',
          canonicalName: 'Gram Flour (Besan)',
          category: 'pulse_legume',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
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
        }
      ],
      rawIngredientsText: 'Potato (22%), Edible Vegetable Oil (Palmolein), Gram Pulse Flour (Besan) (18%), Tepary Bean Flour, Spices, Salt, Acidity Regulator (330)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: "Haldiram's",
      productName: "Haldiram's Nagpur Aloo Bhujia",
      category: 'Snacks & Namkeen',
      market: 'India',
      country: 'IN',
      barcode: '8904004400219'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Haldiram Foods International Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Deep-fried potato-besan namkeen with 17g saturated fat and 780mg sodium.'
    }
  }
];
