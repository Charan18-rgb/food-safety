import {
  ProductInput,
  NutritionProfile,
  NutrientValue,
  createNutrientValue,
  DataQualityProvenance,
  ServingInfo
} from '@foodgrade/shared-types';
import { parseIngredientsText, extractAdditives, deriveSodiumFromSalt, deriveSaltFromSodium } from '@foodgrade/parser';
import { lookupAdditiveByINS, lookupAdditive } from '@foodgrade/knowledge';
import { OFFV3ProductResponse } from './types.js';

/**
 * Validates if an Open Food Facts v3 response indicates a successful product lookup.
 */
export function isOFFV3ProductFound(response: OFFV3ProductResponse | null | undefined): boolean {
  if (!response || !response.product) return false;

  // v3 standard string status or result id
  if (response.status === 'success' || response.result?.id === 'product_found') {
    return true;
  }

  // Backwards compatibility with numeric 1 status
  if (response.status === 1 || response.status === '1') {
    return true;
  }

  return false;
}

/**
 * Transforms an Open Food Facts API v3 JSON response into a validated FoodGrade ProductInput.
 */
export function adaptOpenFoodFactsV3Response(payload: OFFV3ProductResponse): ProductInput | null {
  if (!isOFFV3ProductFound(payload)) {
    return null;
  }

  const p = payload.product!;
  const barcode = payload.code || '';
  const productName = p.product_name || p.product_name_en || 'Packaged Product';
  const brand = p.brands ? p.brands.split(',')[0].trim() : undefined;
  const category = p.categories ? p.categories.split(',')[0].trim() : undefined;

  // 1. Serving Info
  let servingInfo: ServingInfo | undefined;
  if (p.serving_size || p.serving_quantity) {
    const qty = typeof p.serving_quantity === 'number'
      ? p.serving_quantity
      : p.serving_quantity ? parseFloat(String(p.serving_quantity)) : undefined;

    servingInfo = {
      servingSize: !isNaN(qty || NaN) ? qty : undefined,
      servingUnit: p.serving_size && /ml/i.test(p.serving_size) ? 'ml' : 'g',
      servingDescription: p.serving_size
    };
  }

  // 2. Nutriments extraction
  const nm = p.nutriments || {};

  function getNutrient(keys: string[], unit: 'g' | 'mg' | 'kcal', multiplier = 1): NutrientValue {
    for (const key of keys) {
      const val = nm[key];
      if (val !== undefined && val !== null && val !== '') {
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        if (!isNaN(num)) {
          const finalVal = Math.round((num * multiplier) * 100) / 100;
          return createNutrientValue(finalVal, unit, 'declared');
        }
      }
    }
    return createNutrientValue(null, unit, 'missing');
  }

  // Extract energy
  let energyKcal = getNutrient(['energy-kcal_100g', 'energy-kcal', 'energy-kcal_value'], 'kcal');
  if (energyKcal.value === null) {
    // Try energy in kJ
    const energyKJ = getNutrient(['energy_100g', 'energy', 'energy_value'], 'kcal');
    if (energyKJ.value !== null) {
      energyKcal = createNutrientValue(Math.round((energyKJ.value / 4.184) * 10) / 10, 'kcal', 'inferred');
    }
  }

  const proteinG = getNutrient(['proteins_100g', 'proteins', 'protein_100g'], 'g');
  const carbohydratesG = getNutrient(['carbohydrates_100g', 'carbohydrates'], 'g');
  const totalSugarsG = getNutrient(['sugars_100g', 'sugars'], 'g');
  const addedSugarsG = getNutrient(['added-sugars_100g', 'added_sugars_100g', 'added-sugars'], 'g');
  const dietaryFiberG = getNutrient(['fiber_100g', 'fiber', 'dietary-fiber_100g'], 'g');
  const totalFatG = getNutrient(['fat_100g', 'fat'], 'g');
  const saturatedFatG = getNutrient(['saturated-fat_100g', 'saturated-fat'], 'g');
  const transFatG = getNutrient(['trans-fat_100g', 'trans-fat'], 'g');
  const cholesterolMg = getNutrient(['cholesterol_100g', 'cholesterol'], 'mg', 1000); // OFF stores in g

  // Sodium: OFF stores in grams, convert to mg (multiply by 1000)
  let sodiumMg = getNutrient(['sodium_100g', 'sodium'], 'mg', 1000);
  let saltG = getNutrient(['salt_100g', 'salt'], 'g');

  // Cross derivation if one is missing
  if (sodiumMg.value !== null && saltG.value === null) {
    saltG = deriveSaltFromSodium(sodiumMg.value);
  } else if (saltG.value !== null && sodiumMg.value === null) {
    sodiumMg = deriveSodiumFromSalt(saltG.value);
  }

  const nutrition: NutritionProfile = {
    basis: 'per_100g',
    energyKcal,
    carbohydratesG,
    totalSugarsG,
    addedSugarsG,
    dietaryFiberG,
    proteinG,
    totalFatG,
    saturatedFatG,
    transFatG,
    cholesterolMg,
    sodiumMg,
    saltG
  };

  // 3. Ingredients & Additives
  const rawIngredientsText = p.ingredients_text || p.ingredients_text_en || '';
  const parsedIngredientsResult = parseIngredientsText(rawIngredientsText);
  const parsedIngredients = parsedIngredientsResult.parsedIngredients;

  // Extract additives from ingredients text and additives_tags
  const extractedAdditivesResult = extractAdditives(rawIngredientsText);
  const detectedAdditivesMap = new Map(extractedAdditivesResult.detectedAdditives.map(a => [a.insCode, a]));

  if (p.additives_tags && Array.isArray(p.additives_tags)) {
    for (const tag of p.additives_tags) {
      // e.g. "en:e500ii" -> "500(ii)", "en:e330" -> "330"
      const cleanCode = tag.replace(/^en:e/i, '').trim();
      if (cleanCode) {
        const lookupRes = lookupAdditiveByINS(cleanCode) || lookupAdditive(cleanCode);
        if (lookupRes) {
          const insCode = 'insCode' in lookupRes ? lookupRes.insCode : lookupRes.detected.insCode;
          if (!detectedAdditivesMap.has(insCode)) {
            const detected = 'detected' in lookupRes ? lookupRes.detected : {
              insCode: lookupRes.insCode,
              canonicalName: lookupRes.canonicalName,
              functionalClass: lookupRes.functionalClass,
              riskCategory: lookupRes.riskCategory,
              neutralExplanation: lookupRes.neutralExplanation,
              fssaiMaxPermittedNote: lookupRes.fssaiMaxPermittedNote
            };
            detectedAdditivesMap.set(detected.insCode, detected);
          }
        }
      }
    }
  }

  const detectedAdditives = Array.from(detectedAdditivesMap.values());

  // 4. Provenance: Open Food Facts is external crowdsourced data -> observationMode: 'fallback', confidence: 0.85
  const missingMandatory: string[] = [];
  if (energyKcal.value === null) missingMandatory.push('energyKcal');
  if (proteinG.value === null) missingMandatory.push('proteinG');
  if (carbohydratesG.value === null) missingMandatory.push('carbohydratesG');
  if (totalSugarsG.value === null) missingMandatory.push('totalSugarsG');
  if (totalFatG.value === null) missingMandatory.push('totalFatG');
  if (saturatedFatG.value === null) missingMandatory.push('saturatedFatG');
  if (transFatG.value === null) missingMandatory.push('transFatG');
  if (sodiumMg.value === null) missingMandatory.push('sodiumMg');

  const provenance: DataQualityProvenance = {
    sourceType: 'open_food_facts',
    observationMode: 'fallback',
    sourceId: barcode,
    sourceUri: `https://world.openfoodfacts.org/product/${barcode}`,
    rawConfidence: 0.85,
    missingMandatoryFields: missingMandatory
  };

  return {
    barcode,
    productName,
    brand,
    category,
    servingInfo,
    nutrition,
    rawIngredientsText,
    parsedIngredients,
    detectedAdditives,
    provenance
  };
}

export const adaptOpenFoodFactsPayload = adaptOpenFoodFactsV3Response;
