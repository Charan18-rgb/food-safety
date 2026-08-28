import { BenchmarkProduct, createNutrientValue } from '@foodgrade/shared-types';

export const DAIRY_BENCHMARKS: BenchmarkProduct[] = [
  {
    benchmarkId: 'amul-taaza-toned-milk',
    product: {
      barcode: '8901262010054',
      productName: 'Amul Taaza Homogenised Toned Milk',
      brand: 'Amul',
      category: 'Dairy & Milk Products',
      servingInfo: { servingSize: 200, servingUnit: 'ml', servingsPerPackage: 5 },
      nutrition: {
        basis: 'per_100ml',
        energyKcal: createNutrientValue(58, 'kcal'),
        carbohydratesG: createNutrientValue(4.7, 'g'),
        totalSugarsG: createNutrientValue(4.7, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(0, 'g'),
        proteinG: createNutrientValue(3.1, 'g'),
        totalFatG: createNutrientValue(3.0, 'g'),
        saturatedFatG: createNutrientValue(1.9, 'g'),
        transFatG: createNutrientValue(0.08, 'g'),
        cholesterolMg: createNutrientValue(8, 'mg'),
        sodiumMg: createNutrientValue(50, 'mg'),
        saltG: createNutrientValue(0.125, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Toned Milk',
          canonicalId: 'milk_solids',
          canonicalName: 'Milk Solids (Dairy Powder / Fat)',
          category: 'dairy',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'milk',
          positionIndex: 0
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Toned Milk',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Amul',
      productName: 'Amul Taaza Homogenised Toned Milk',
      category: 'Dairy & Milk Products',
      market: 'India',
      country: 'IN',
      barcode: '8901262010054'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'GCMMF Ltd. (Amul) retail carton 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Staple Indian liquid toned milk with 0g added sugars.'
    }
  },
  {
    benchmarkId: 'amul-butter-pasteurised',
    product: {
      barcode: '8901262010122',
      productName: 'Amul Pasteurised Butter',
      brand: 'Amul',
      category: 'Dairy & Milk Products',
      servingInfo: { servingSize: 10, servingUnit: 'ml', servingsPerPackage: 10 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(722, 'kcal'),
        carbohydratesG: createNutrientValue(0, 'g'),
        totalSugarsG: createNutrientValue(0, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(0, 'g'),
        proteinG: createNutrientValue(0.5, 'g'),
        totalFatG: createNutrientValue(80.0, 'g'),
        saturatedFatG: createNutrientValue(51.0, 'g'),
        transFatG: createNutrientValue(1.5, 'g'),
        cholesterolMg: createNutrientValue(180, 'mg'),
        sodiumMg: createNutrientValue(830, 'mg'),
        saltG: createNutrientValue(2.075, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Butter (Milk Fat)',
          canonicalId: 'butter',
          canonicalName: 'Butter (Makhan)',
          category: 'dairy',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'milk',
          positionIndex: 0
        },
        {
          rawText: 'Common Salt (2.5%)',
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
      detectedAdditives: [],
      rawIngredientsText: 'Butter (Milk Fat 80%), Common Salt (2.5%), Curd Solids',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Amul',
      productName: 'Amul Pasteurised Butter',
      category: 'Dairy & Milk Products',
      market: 'India',
      country: 'IN',
      barcode: '8901262010122'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'GCMMF Ltd. retail carton 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High-fat pure dairy fat (80% milkfat, 51g sat fat, 830mg sodium).'
    }
  },
  {
    benchmarkId: 'epigamia-greek-yogurt-plain',
    product: {
      barcode: '8906074490013',
      productName: 'Epigamia Natural Greek Yogurt',
      brand: 'Epigamia',
      category: 'Dairy & Milk Products',
      servingInfo: { servingSize: 90, servingUnit: 'ml', servingsPerPackage: 1 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(82, 'kcal'),
        carbohydratesG: createNutrientValue(5.0, 'g'),
        totalSugarsG: createNutrientValue(4.5, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(0, 'g'),
        proteinG: createNutrientValue(6.5, 'g'),
        totalFatG: createNutrientValue(4.0, 'g'),
        saturatedFatG: createNutrientValue(2.5, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(12, 'mg'),
        sodiumMg: createNutrientValue(55, 'mg'),
        saltG: createNutrientValue(0.1375, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Pasteurised Double Toned Milk',
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
          rawText: 'Milk Solids',
          canonicalId: 'milk_solids',
          canonicalName: 'Milk Solids (Dairy Powder / Fat)',
          category: 'dairy',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'milk',
          positionIndex: 1
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Pasteurised Double Toned Milk, Milk Solids, Active Live Cultures',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Epigamia',
      productName: 'Epigamia Natural Greek Yogurt',
      category: 'Dairy & Milk Products',
      market: 'India',
      country: 'IN',
      barcode: '8906074490013'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Drums Food International Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'High-protein strained yogurt with zero added sugar and live cultures.'
    }
  },
  {
    benchmarkId: 'mother-dairy-classic-dahi',
    product: {
      barcode: '8901648001021',
      productName: 'Mother Dairy Classic Dahi (Curd)',
      brand: 'Mother Dairy',
      category: 'Dairy & Milk Products',
      servingInfo: { servingSize: 100, servingUnit: 'ml', servingsPerPackage: 4 },
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(62, 'kcal'),
        carbohydratesG: createNutrientValue(4.8, 'g'),
        totalSugarsG: createNutrientValue(4.8, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(0, 'g'),
        proteinG: createNutrientValue(3.7, 'g'),
        totalFatG: createNutrientValue(3.1, 'g'),
        saturatedFatG: createNutrientValue(2.0, 'g'),
        transFatG: createNutrientValue(0.08, 'g'),
        cholesterolMg: createNutrientValue(8, 'mg'),
        sodiumMg: createNutrientValue(48, 'mg'),
        saltG: createNutrientValue(0.12, 'g')
      },
      parsedIngredients: [
        {
          rawText: 'Pasteurised Toned Milk',
          canonicalId: 'milk_solids',
          canonicalName: 'Milk Solids (Dairy Powder / Fat)',
          category: 'dairy',
          isWholeGrain: false,
          isRefinedGrain: false,
          isUltraProcessedMarker: false,
          isPositiveMarker: false,
          allergenType: 'milk',
          positionIndex: 0
        }
      ],
      detectedAdditives: [],
      rawIngredientsText: 'Pasteurised Toned Milk, Active Lactic Culture',
      provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }
    },
    productMetadata: {
      brand: 'Mother Dairy',
      productName: 'Mother Dairy Classic Dahi (Curd)',
      category: 'Dairy & Milk Products',
      market: 'India',
      country: 'IN',
      barcode: '8901648001021'
    },
    verification: {
      sourceType: 'official_packaging',
      sourceReference: 'Mother Dairy Fruit & Vegetable Pvt. Ltd. packaging 2024',
      verifiedAt: '2026-08-25',
      labelVersion: '2024-FSSAI',
      dataCompleteness: 'complete'
    },
    reviewerNotes: {
      selectionRationale: 'Traditional Indian cultured dairy curd with zero added sugars.'
    }
  }
];
