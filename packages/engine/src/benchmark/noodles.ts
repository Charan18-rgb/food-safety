import { BenchmarkProduct, createNutrientValue } from '@foodgrade/shared-types';

export const NOODLE_BENCHMARKS: BenchmarkProduct[] = [
  {
    benchmarkId: 'maggi-2-minute-masala',
    product: {
      barcode: '8901058852325',
      productName: 'Nestlé Maggi 2-Minute Masala Instant Noodles',
      brand: 'Nestlé Maggi',
      category: 'Noodles & Instant Foods',
      servingInfo: { servingSize: 70, servingUnit: 'g', servingsPerPackage: 1 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(427, 'kcal'),
        carbohydratesG: createNutrientValue(63.5, 'g'),
        totalSugarsG: createNutrientValue(2.2, 'g'),
        addedSugarsG: createNutrientValue(1.5, 'g'),
        dietaryFiberG: createNutrientValue(3.6, 'g'),
        proteinG: createNutrientValue(8.0, 'g'),
        totalFatG: createNutrientValue(15.7, 'g'),
        saturatedFatG: createNutrientValue(6.8, 'g'),
        transFatG: createNutrientValue(0.08, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(1020, 'mg'),
        saltG: createNutrientValue(2.55, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Refined Wheat Flour (Maida) (79.6%)',
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
          rawText: 'Palm Oil',
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
          insCode: 'INS 635',
          canonicalName: 'Disodium 5-Ribonucleotides',
          functionalClass: 'flavour_enhancer',
          riskCategory: 'processing_indicator',
          neutralExplanation: 'Flavour enhancer.'
        },
        {
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Acidity regulator.'
        }
      ],
      rawIngredientsText: 'Refined Wheat Flour (Maida) (79.6%), Palm Oil, Iodised Salt, Mixed Spices, Flavour Enhancer (635)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Nestlé Maggi',
      productName: 'Nestlé Maggi 2-Minute Masala Instant Noodles',
      category: 'Noodles & Instant Foods',
      market: 'India',
      country: 'IN',
      barcode: '8901058852325'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Nestlé India Ltd. retail packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Leading instant noodle with 1020mg sodium and Maida/palm oil base.'
    }
  },
  {
    benchmarkId: 'sunfeast-yippee-magic-masala',
    product: {
      barcode: '8901725134120',
      productName: 'Sunfeast YiPPee! Magic Masala Instant Noodles',
      brand: 'ITC Sunfeast',
      category: 'Noodles & Instant Foods',
      servingInfo: { servingSize: 65, servingUnit: 'g', servingsPerPackage: 1 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(468, 'kcal'),
        carbohydratesG: createNutrientValue(63.0, 'g'),
        totalSugarsG: createNutrientValue(3.5, 'g'),
        addedSugarsG: createNutrientValue(2.0, 'g'),
        dietaryFiberG: createNutrientValue(3.2, 'g'),
        proteinG: createNutrientValue(8.8, 'g'),
        totalFatG: createNutrientValue(20.1, 'g'),
        saturatedFatG: createNutrientValue(9.5, 'g'),
        transFatG: createNutrientValue(0.05, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(980, 'mg'),
        saltG: createNutrientValue(2.45, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Refined Wheat Flour (Maida) (76%)',
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
      rawIngredientsText: 'Refined Wheat Flour (Maida) (76%), Refined Palm Oil, Spices, Flavour Enhancers (627, 631)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'ITC Sunfeast',
      productName: 'Sunfeast YiPPee! Magic Masala Instant Noodles',
      category: 'Noodles & Instant Foods',
      market: 'India',
      country: 'IN',
      barcode: '8901725134120'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'ITC Limited YiPPee packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High-sodium instant noodle with palm oil.'
    }
  },
  {
    benchmarkId: 'chings-secret-hakka-noodles',
    product: {
      barcode: '8901595851416',
      productName: "Ching's Secret Just Soak Veg Hakka Noodles",
      brand: "Ching's Secret",
      category: 'Noodles & Instant Foods',
      servingInfo: { servingSize: 75, servingUnit: 'g', servingsPerPackage: 2 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(360, 'kcal'),
        carbohydratesG: createNutrientValue(74.0, 'g'),
        totalSugarsG: createNutrientValue(1.0, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(2.8, 'g'),
        proteinG: createNutrientValue(11.0, 'g'),
        totalFatG: createNutrientValue(1.5, 'g'),
        saturatedFatG: createNutrientValue(0.4, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(320, 'mg'),
        saltG: createNutrientValue(0.8, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Wheat Flour (98%)',
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
          rawText: 'Iodised Salt',
          canonicalId: 'iodized_salt',
          canonicalName: 'Iodized Salt (Edible Common Salt)',
          category: 'salt',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'none',
          positionIndex: 1
        }
      ],
      detectedAdditives: [
        {
          insCode: 'INS 500',
          canonicalName: 'Sodium Bicarbonate',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Leavening / dough conditioner.'
        }
      ],
      rawIngredientsText: 'Wheat Flour (98%), Iodised Salt, Raising Agent (500(ii))',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: "Ching's Secret",
      productName: "Ching's Secret Just Soak Veg Hakka Noodles",
      category: 'Noodles & Instant Foods',
      market: 'India',
      country: 'IN',
      barcode: '8901595851416'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Capital Foods Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Un-fried plain noodle cake (low fat 1.5g, zero added sugar) compared to oil-fried instant noodles.'
    }
  },
  {
    benchmarkId: 'knorr-soupy-noodles-mast-masala',
    product: {
      barcode: '8901030384110',
      productName: 'Knorr Mast Masala Soupy Noodles',
      brand: 'Knorr',
      category: 'Noodles & Instant Foods',
      servingInfo: { servingSize: 70, servingUnit: 'g', servingsPerPackage: 1 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(440, 'kcal'),
        carbohydratesG: createNutrientValue(64.0, 'g'),
        totalSugarsG: createNutrientValue(4.0, 'g'),
        addedSugarsG: createNutrientValue(2.5, 'g'),
        dietaryFiberG: createNutrientValue(3.0, 'g'),
        proteinG: createNutrientValue(8.5, 'g'),
        totalFatG: createNutrientValue(17.0, 'g'),
        saturatedFatG: createNutrientValue(7.5, 'g'),
        transFatG: createNutrientValue(0.05, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(1150, 'mg'),
        saltG: createNutrientValue(2.875, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Refined Wheat Flour (Maida) (72%)',
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
          rawText: 'Palm Oil',
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
        },
        {
          insCode: 'INS 330',
          canonicalName: 'Citric Acid',
          functionalClass: 'acidity_regulator',
          riskCategory: 'neutral',
          neutralExplanation: 'Acidity regulator.'
        }
      ],
      rawIngredientsText: 'Refined Wheat Flour (Maida), Palm Oil, Iodised Salt, Mixed Spices, Flavour Enhancers (627, 631), Acidity Regulator (330)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Knorr',
      productName: 'Knorr Mast Masala Soupy Noodles',
      category: 'Noodles & Instant Foods',
      market: 'India',
      country: 'IN',
      barcode: '8901030384110'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Hindustan Unilever Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Soupy instant noodle with very high sodium content (1150mg/100g).'
    }
  }
];
