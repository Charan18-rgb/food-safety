import { BenchmarkProduct, createNutrientValue } from '@foodgrade/shared-types';

export const STAPLE_BENCHMARKS: BenchmarkProduct[] = [
  {
    benchmarkId: 'aashirvaad-shudh-chakki-atta',
    product: {
      barcode: '8901725181155',
      productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta',
      brand: 'ITC Aashirvaad',
      category: 'Flour & Staples',
      servingInfo: { servingSize: 100, servingUnit: 'g', servingsPerPackage: 10 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(367, 'kcal'),
        carbohydratesG: createNutrientValue(74.0, 'g'),
        totalSugarsG: createNutrientValue(3.0, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(11.2, 'g'),
        proteinG: createNutrientValue(11.5, 'g'),
        totalFatG: createNutrientValue(1.9, 'g'),
        saturatedFatG: createNutrientValue(0.4, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(4, 'mg'),
        saltG: createNutrientValue(0.01, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Whole Wheat (100%)',
          canonicalId: 'whole_wheat_flour',
          canonicalName: 'Whole Wheat Flour (Atta)',
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
      rawIngredientsText: '100% Whole Wheat',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'ITC Aashirvaad',
      productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta',
      category: 'Flour & Staples',
      market: 'India',
      country: 'IN',
      barcode: '8901725181155'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'ITC Limited retail packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: '100% whole wheat chakki atta.'
    }
  },
  {
    benchmarkId: 'tata-sampann-unpolished-toor-dal',
    product: {
      barcode: '8904043900749',
      productName: 'Tata Sampann Unpolished Toor Dal',
      brand: 'Tata Sampann',
      category: 'Flour & Staples',
      servingInfo: { servingSize: 50, servingUnit: 'g', servingsPerPackage: 20 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(343, 'kcal'),
        carbohydratesG: createNutrientValue(60.0, 'g'),
        totalSugarsG: createNutrientValue(2.0, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(9.5, 'g'),
        proteinG: createNutrientValue(22.0, 'g'),
        totalFatG: createNutrientValue(1.5, 'g'),
        saturatedFatG: createNutrientValue(0.3, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(15, 'mg'),
        saltG: createNutrientValue(0.0375, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Unpolished Toor Dal (100%)',
          canonicalId: 'pigeon_peas',
          canonicalName: 'Pigeon Pea (Toor Dal)',
          category: 'pulse_legume',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'none',
          positionIndex: 0
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Unpolished Toor Dal (100%)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Tata Sampann',
      productName: 'Tata Sampann Unpolished Toor Dal',
      category: 'Flour & Staples',
      market: 'India',
      country: 'IN',
      barcode: '8904043900749'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Tata Consumer Products Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Nutrient-rich staple legume (22g protein, 9.5g fiber).'
    }
  },
  {
    benchmarkId: '24-mantra-organic-ragi-flour',
    product: {
      barcode: '8904083505218',
      productName: '24 Mantra Organic Finger Millet (Ragi) Flour',
      brand: '24 Mantra Organic',
      category: 'Flour & Staples',
      servingInfo: { servingSize: 50, servingUnit: 'g', servingsPerPackage: 10 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(336, 'kcal'),
        carbohydratesG: createNutrientValue(72.0, 'g'),
        totalSugarsG: createNutrientValue(0.6, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(11.5, 'g'),
        proteinG: createNutrientValue(7.5, 'g'),
        totalFatG: createNutrientValue(1.9, 'g'),
        saturatedFatG: createNutrientValue(0.4, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(5, 'mg'),
        saltG: createNutrientValue(0.0125, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Organic Ragi (Finger Millet) (100%)',
          canonicalId: 'finger_millet',
          canonicalName: 'Finger Millet (Ragi)',
          category: 'whole_grain',
          isWholeGrain: true,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: true,
          allergenType: 'none',
          positionIndex: 0
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Organic Finger Millet (Ragi) (100%)',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: '24 Mantra Organic',
      productName: '24 Mantra Organic Finger Millet (Ragi) Flour',
      category: 'Flour & Staples',
      market: 'India',
      country: 'IN',
      barcode: '8904083505218'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Sresta Natural Bioproducts Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Single-ingredient Indian millet flour (high calcium, 11.5g fiber).'
    }
  }
];
