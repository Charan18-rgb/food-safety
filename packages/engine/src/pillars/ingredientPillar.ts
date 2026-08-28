import { NormalizedIngredient, ScoringFactor } from '@foodgrade/shared-types';
import { IngredientPillarConfig } from '../config/scoringConfigV1.js';
import { clampScore } from '../grade/gradeMapping.js';

export interface IngredientPillarResult {
  score: number;
  rawScore: number;
  factors: ScoringFactor[];
}

/**
 * Evaluates the Ingredient Quality & Refinement Pillar (Pillar 2)
 */
export function evaluateIngredientPillar(
  ingredients: NormalizedIngredient[],
  config: IngredientPillarConfig
): IngredientPillarResult {
  const factors: ScoringFactor[] = [];
  let currentScore = config.baseline;
  let accumulatedSyrupPenalty = 0;

  if (!ingredients || ingredients.length === 0) {
    return {
      score: config.baseline,
      rawScore: config.baseline,
      factors: []
    };
  }

  for (const ing of ingredients) {
    const pos = ing.positionIndex >= 0 ? ing.positionIndex : 0;
    const positionFactor = 1 / Math.pow(pos + 1, config.positionDecayPower);

    // 1. Refined Wheat Flour (Maida)
    if (ing.canonicalId === 'refined_wheat_flour' || (ing.category === 'refined_cereal' && ing.isRefinedGrain)) {
      const penalty = Math.round(config.penalties.refinedWheatFlour * positionFactor * 10) / 10;
      if (penalty >= 3) {
        currentScore -= penalty;
        factors.push({
          id: `refined_flour_pos_${pos}`,
          title: pos <= 1 ? 'Primary Ingredient is Refined Flour (Maida)' : 'Contains Refined Flour',
          description: `Contains ${ing.canonicalName} as ingredient #${pos + 1} (-${penalty} pts deduction).`,
          pillar: 'ingredient',
          impact: 'warning',
          severity: pos <= 1 ? 'high' : 'moderate',
          pointsDelta: -penalty
        });
      }
    }

    // 2. Palm Oil / Palmolein
    if (ing.canonicalId === 'palmolein' || ing.canonicalId === 'palm_oil') {
      const penalty = Math.round(config.penalties.palmoleinAndPalmOil * positionFactor * 10) / 10;
      if (penalty >= 2) {
        currentScore -= penalty;
        factors.push({
          id: `palm_oil_pos_${pos}`,
          title: pos <= 2 ? 'Contains Palm Oil as a Main Fat' : 'Contains Palm Oil / Palmolein',
          description: `Contains ${ing.canonicalName} as ingredient #${pos + 1} (-${penalty} pts deduction).`,
          pillar: 'ingredient',
          impact: 'warning',
          severity: pos <= 2 ? 'high' : 'moderate',
          pointsDelta: -penalty,
          evidenceRef: 'High Saturated Palmitic Acid Profile'
        });
      }
    }

    // 3. Hydrogenated Vegetable Oil (Vanaspati)
    if (ing.category === 'hydrogenated_fat' || ing.canonicalId === 'hydrogenated_vegetable_oil') {
      const penalty = Math.round(config.penalties.hydrogenatedFat * positionFactor * 10) / 10;
      if (penalty >= 4) {
        currentScore -= penalty;
        factors.push({
          id: `vanaspati_pos_${pos}`,
          title: 'Contains Hydrogenated Vegetable Fat (Vanaspati)',
          description: `Contains ${ing.canonicalName} as ingredient #${pos + 1} (-${penalty} pts deduction).`,
          pillar: 'ingredient',
          impact: 'warning',
          severity: 'high',
          pointsDelta: -penalty,
          evidenceRef: 'FSSAI Trans-Fat Advisory'
        });
      }
    }

    // 4. Industrial Sweetener Syrups
    if (
      ing.category === 'refined_sweetener' &&
      ing.canonicalId !== 'sugar'
    ) {
      if (accumulatedSyrupPenalty < config.penalties.maxTotalSyrupPenalty) {
        const rawPenalty = Math.round(config.penalties.industrialSweetenerSyrup * positionFactor * 10) / 10;
        const penalty = Math.min(rawPenalty, config.penalties.maxTotalSyrupPenalty - accumulatedSyrupPenalty);
        if (penalty >= 2) {
          currentScore -= penalty;
          accumulatedSyrupPenalty += penalty;
          factors.push({
            id: `syrup_${ing.canonicalId}_pos_${pos}`,
            title: 'Contains Industrial Sweetener Syrup',
            description: `Contains ${ing.canonicalName} (ultra-processing carbohydrate marker) as ingredient #${pos + 1} (-${penalty} pts).`,
            pillar: 'ingredient',
            impact: 'warning',
            severity: 'moderate',
            pointsDelta: -penalty
          });
        }
      }
    }

    // 5. Positive Whole Grains
    if (ing.category === 'whole_grain' && ing.isWholeGrain) {
      const isMillet = [
        'finger_millet',
        'pearl_millet',
        'sorghum',
        'foxtail_millet',
        'kodo_millet',
        'barnyard_millet',
        'little_millet'
      ].includes(ing.canonicalId);

      const baseBonus = isMillet ? config.bonuses.millet : config.bonuses.wholeGrain;
      const bonus = Math.round(baseBonus * positionFactor * 10) / 10;

      if (bonus >= 3) {
        currentScore += bonus;
        factors.push({
          id: `wholegrain_${ing.canonicalId}_pos_${pos}`,
          title: isMillet ? `Contains Indian Millet (${ing.canonicalName})` : `Contains Whole Grain (${ing.canonicalName})`,
          description: `Contains wholesome ${ing.canonicalName} as ingredient #${pos + 1} (+${bonus} pts bonus).`,
          pillar: 'ingredient',
          impact: 'positive',
          pointsDelta: bonus
        });
      }
    }

    // 6. Positive Pulses, Nuts & Seeds
    if (ing.category === 'pulse_legume' || ing.category === 'nut_seed') {
      const bonus = Math.round(config.bonuses.pulseLegumeNutSeed * positionFactor * 10) / 10;
      if (bonus >= 2) {
        currentScore += bonus;
        factors.push({
          id: `pulse_nut_${ing.canonicalId}_pos_${pos}`,
          title: `Contains ${ing.canonicalName}`,
          description: `Contains nutrient-rich ${ing.canonicalName} (+${bonus} pts bonus).`,
          pillar: 'ingredient',
          impact: 'positive',
          pointsDelta: bonus
        });
      }
    }

    // 7. Traditional / Cold-Pressed Oils
    if (ing.category === 'cold_pressed_oil') {
      const bonus = Math.round(config.bonuses.coldPressedOil * positionFactor * 10) / 10;
      if (bonus >= 2) {
        currentScore += bonus;
        factors.push({
          id: `oil_${ing.canonicalId}_pos_${pos}`,
          title: `Contains ${ing.canonicalName}`,
          description: `Contains cold-pressed/traditional oil (${ing.canonicalName}) with healthy MUFA/Omega fats (+${bonus} pts).`,
          pillar: 'ingredient',
          impact: 'positive',
          pointsDelta: bonus
        });
      }
    }
  }

  const rawScore = currentScore;
  const score = clampScore(currentScore);

  return {
    score,
    rawScore,
    factors
  };
}
