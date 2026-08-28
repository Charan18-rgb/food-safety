import {
  ProductInput,
  ConfidenceAssessment,
  ConfidenceLevel,
  getNutrientNumber
} from '@foodgrade/shared-types';

export function calculateConfidence(
  input: ProductInput,
  missingPillarFields: string[] = []
): ConfidenceAssessment {
  const reasons: string[] = [];
  const missingMandatoryFields: string[] = [...missingPillarFields];
  const userRecommendations: string[] = [];

  // 1. Nutrition Completeness (Weight: 50%)
  const coreNutrients = [
    { name: 'Energy', val: getNutrientNumber(input.nutrition.energyKcal) },
    { name: 'Carbohydrates', val: getNutrientNumber(input.nutrition.carbohydratesG) },
    { name: 'Total Sugar', val: getNutrientNumber(input.nutrition.totalSugarsG) },
    { name: 'Added Sugar', val: getNutrientNumber(input.nutrition.addedSugarsG) },
    { name: 'Dietary Fiber', val: getNutrientNumber(input.nutrition.dietaryFiberG) },
    { name: 'Protein', val: getNutrientNumber(input.nutrition.proteinG) },
    { name: 'Total Fat', val: getNutrientNumber(input.nutrition.totalFatG) },
    { name: 'Saturated Fat', val: getNutrientNumber(input.nutrition.saturatedFatG) },
    { name: 'Sodium', val: getNutrientNumber(input.nutrition.sodiumMg) }
  ];

  const presentNutrients = coreNutrients.filter(n => n.val !== null).length;
  const nutritionScore = presentNutrients / coreNutrients.length;

  for (const n of coreNutrients) {
    if (n.val === null && !missingMandatoryFields.includes(n.name)) {
      missingMandatoryFields.push(n.name);
    }
  }

  if (nutritionScore >= 0.88) {
    reasons.push('Comprehensive nutrition panel provided.');
  } else if (nutritionScore >= 0.55) {
    reasons.push('Partial nutrition panel with key nutrients present.');
    userRecommendations.push('Check product packaging for missing nutrient values (e.g. Added Sugars, Sodium).');
  } else {
    reasons.push('Incomplete nutrition information.');
    userRecommendations.push('Retake a clearer photo of the complete Nutrition Facts table.');
  }

  // 2. Ingredient List Presence & Recognition (Weight: 35%)
  const ingredients = input.parsedIngredients || [];
  let ingredientScore = 0;

  if (ingredients.length > 0) {
    const recognizedCount = ingredients.filter(i => i.canonicalId !== 'unknown').length;
    const recognizedRatio = recognizedCount / ingredients.length;
    ingredientScore = 0.4 + 0.6 * recognizedRatio;

    if (recognizedRatio >= 0.8) {
      reasons.push(`Identified ${recognizedCount} of ${ingredients.length} declared ingredients.`);
    } else {
      reasons.push(`Identified ${recognizedCount} of ${ingredients.length} ingredients (some unclassified).`);
    }
  } else if (input.rawIngredientsText && input.rawIngredientsText.trim().length > 10) {
    ingredientScore = 0.5;
    reasons.push('Raw ingredient text present.');
  } else {
    ingredientScore = 0.0;
    missingMandatoryFields.push('Ingredients List');
    reasons.push('No ingredients list available.');
    userRecommendations.push('Photograph the ingredients label for a more accurate assessment.');
  }

  // 3. Provenance & Optical Reliability (Weight: 15%)
  const rawProvenance = input.provenance?.rawConfidence ?? 1.0;
  const provenanceScore = Math.max(0, Math.min(rawProvenance, 1.0));

  if (provenanceScore < 0.7) {
    reasons.push('Low OCR extraction confidence; text may have blur or reflection.');
    userRecommendations.push('Ensure the packaging is well-lit and held steady when capturing.');
  }

  // Final Composite Confidence Score
  const numericScore = Math.round((0.50 * nutritionScore + 0.35 * ingredientScore + 0.15 * provenanceScore) * 100) / 100;

  let level: ConfidenceLevel = 'low';
  if (numericScore >= 0.85) {
    level = 'high';
  } else if (numericScore >= 0.60) {
    level = 'moderate';
  } else {
    level = 'low';
  }

  return {
    level,
    numericScore,
    reasons,
    missingMandatoryFields,
    userRecommendations
  };
}
