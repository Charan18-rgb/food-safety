import { describe, it, expect, vi } from 'vitest';
import { FoodGradeClientService } from '../src/foodGradeService.js';
import { ScanHistoryRepository } from '../src/storage/ScanHistoryRepository.js';
import { MemoryStorageAdapter } from '../src/storage/MemoryStorageAdapter.js';
import { OpenFoodFactsClient } from '../src/off/OpenFoodFactsClient.js';
import { createNutrientValue, ProductInput } from '@foodgrade/shared-types';

describe('FoodGradeClientService Facade', () => {
  it('should analyze a ProductInput, save to scan history, and toggle favorites', async () => {
    const memoryRepo = new ScanHistoryRepository(new MemoryStorageAdapter());
    const service = new FoodGradeClientService({ historyRepository: memoryRepo });

    const input: ProductInput = {
      barcode: '8901234567890',
      productName: 'Aashirvaad Whole Wheat Atta',
      brand: 'Aashirvaad',
      category: 'Flour',
      nutrition: {
        basis: 'per_100g',
        energyKcal: createNutrientValue(360, 'kcal'),
        proteinG: createNutrientValue(12, 'g'),
        carbohydratesG: createNutrientValue(72, 'g'),
        totalSugarsG: createNutrientValue(2, 'g'),
        addedSugarsG: createNutrientValue(0, 'g'),
        dietaryFiberG: createNutrientValue(11, 'g'),
        totalFatG: createNutrientValue(1.8, 'g'),
        saturatedFatG: createNutrientValue(0.4, 'g'),
        transFatG: createNutrientValue(0, 'g'),
        cholesterolMg: createNutrientValue(0, 'mg'),
        sodiumMg: createNutrientValue(5, 'mg'),
        saltG: createNutrientValue(0.01, 'g')
      },
      rawIngredientsText: 'Whole Wheat (100%)',
      parsedIngredients: [
        {
          canonicalId: 'whole_wheat_flour',
          canonicalName: 'Whole Wheat Flour (Atta)',
          rawText: 'Whole Wheat (100%)',
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
      provenance: {
        sourceType: 'label_ocr',
        observationMode: 'directly_observed',
        rawConfidence: 1.0,
        missingMandatoryFields: []
      }
    };

    const { analysisResult, scanRecord } = await service.analyzeAndSave(input, 'Pantry staple', false);

    expect(analysisResult.grade).toBe('A');
    expect(analysisResult.score).toBeGreaterThanOrEqual(90);
    expect(scanRecord.id).toBeDefined();

    // Verify retrieval from history
    const history = await service.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].productName).toBe('Aashirvaad Whole Wheat Atta');
    expect(history[0].isFavorite).toBe(false);

    // Toggle favorite
    const newFavStatus = await service.toggleFavorite(scanRecord.id);
    expect(newFavStatus).toBe(true);

    const updated = await service.getScanById(scanRecord.id);
    expect(updated?.isFavorite).toBe(true);
  });

  it('should lookup barcode on Open Food Facts, evaluate, and save to history', async () => {
    const mockOFFPayload = {
      code: '8901063012219',
      status: 1,
      product: {
        product_name: 'Parle-G Gluco Biscuits',
        brands: 'Parle',
        nutriments: {
          'energy-kcal_100g': 454,
          'proteins_100g': 6.5,
          'carbohydrates_100g': 78.0,
          'sugars_100g': 25.5,
          'added-sugars_100g': 25.5,
          'fat_100g': 13.0,
          'saturated-fat_100g': 6.5,
          'sodium_100g': 0.28
        },
        ingredients_text: 'Refined Wheat Flour, Sugar, Palm Oil, Invert Sugar Syrup'
      }
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOFFPayload
    });
    vi.stubGlobal('fetch', mockFetch);

    const memoryRepo = new ScanHistoryRepository(new MemoryStorageAdapter());
    const offClient = new OpenFoodFactsClient({}, undefined);
    const service = new FoodGradeClientService({
      historyRepository: memoryRepo,
      offClient
    });

    const result = await service.lookupBarcodeAndAnalyze('8901063012219');
    expect(result).toBeDefined();
    expect(result?.productInput.productName).toBe('Parle-G Gluco Biscuits');
    expect(result?.analysisResult.score).toBeGreaterThan(0);
    expect(result?.scanRecord.id).toBeDefined();

    const history = await service.getHistory();
    expect(history).toHaveLength(1);

    vi.unstubAllGlobals();
  });
});
