import { NutritionProfile, ScoringFactor, getNutrientNumber } from '@foodgrade/shared-types';
import { NutritionPillarConfig } from '../config/scoringConfigV1.js';
import { clampScore } from '../grade/gradeMapping.js';

export interface NutritionPillarResult {
  score: number;
  rawScore: number;
  factors: ScoringFactor[];
  missingFields: string[];
}

/**
 * Evaluates the Nutritional Balance Pillar (Pillar 1)
 */
export function evaluateNutritionPillar(
  nutrition: NutritionProfile,
  config: NutritionPillarConfig
): NutritionPillarResult {
  const factors: ScoringFactor[] = [];
  const missingFields: string[] = [];
  let currentScore = config.baseline;

  // Scaling multiplier for liquids (per 100ml) vs solids (per 100g)
  // FoodGrade product-design assumption (configurable in config.liquidBeverageMultiplier)
  const isLiquid = nutrition.basis === 'per_100ml';
  const liquidMultiplier = isLiquid ? (config.liquidBeverageMultiplier ?? 0.5) : 1.0;
  const unitLabel = nutrition.basis.replace('_', ' ');

  // 1. Added Sugar vs Total Sugar Evaluation
  const addedSugarVal = getNutrientNumber(nutrition.addedSugarsG);
  const totalSugarVal = getNutrientNumber(nutrition.totalSugarsG);

  if (addedSugarVal !== null) {
    let penalty = 0;
    const thresholdZero = config.addedSugar.thresholdZero * liquidMultiplier;
    const thresholdModerate = config.addedSugar.thresholdModerate * liquidMultiplier;
    const thresholdHigh = config.addedSugar.thresholdHigh * liquidMultiplier;
    const { penaltyModerateMax, penaltyHighMax, maxPenalty } = config.addedSugar;

    if (addedSugarVal <= thresholdZero) {
      penalty = 0;
      if (addedSugarVal <= 2 * liquidMultiplier) {
        factors.push({
          id: 'low_added_sugar',
          title: 'Low Added Sugar',
          description: `Contains minimal added sugar (${addedSugarVal}g ${unitLabel}).`,
          pillar: 'nutrition',
          impact: 'positive',
          pointsDelta: 0
        });
      }
    } else if (addedSugarVal <= thresholdModerate) {
      const fraction = (addedSugarVal - thresholdZero) / (thresholdModerate - thresholdZero);
      penalty = Math.round(fraction * penaltyModerateMax * 10) / 10;
    } else if (addedSugarVal <= thresholdHigh) {
      const fraction = (addedSugarVal - thresholdModerate) / (thresholdHigh - thresholdModerate);
      penalty = Math.round((penaltyModerateMax + fraction * (penaltyHighMax - penaltyModerateMax)) * 10) / 10;
    } else {
      const excess = addedSugarVal - thresholdHigh;
      penalty = Math.min(
        Math.round((penaltyHighMax + (excess / (15 * liquidMultiplier)) * (maxPenalty - penaltyHighMax)) * 10) / 10,
        maxPenalty
      );
    }

    if (penalty > 0) {
      currentScore -= penalty;
      factors.push({
        id: 'high_added_sugar',
        title: penalty >= 20 ? 'High Added Sugar' : 'Moderate Added Sugar',
        description: `Contains ${addedSugarVal}g added sugar ${unitLabel} (-${penalty} pts nutritional assessment deduction).`,
        pillar: 'nutrition',
        impact: 'warning',
        severity: penalty >= 25 ? 'high' : penalty >= 12 ? 'moderate' : 'low',
        pointsDelta: -penalty,
        evidenceRef: 'ICMR-NIN Added Sugar Dietary Reference'
      });
    }
  } else if (totalSugarVal !== null) {
    // Added sugar is missing but total sugar is present:
    // Do NOT silently treat total sugar as added sugar (preserves natural sugar foods).
    missingFields.push('addedSugarsG');
    factors.push({
      id: 'added_sugar_unavailable',
      title: 'Added Sugar Breakdown Unavailable',
      description: `Total sugar is declared at ${totalSugarVal}g ${unitLabel}, but added sugar breakdown is not declared. Added-sugar scoring factor was not evaluated.`,
      pillar: 'nutrition',
      impact: 'neutral',
      pointsDelta: 0
    });
  } else {
    // Both added and total sugars are missing
    missingFields.push('addedSugarsG / totalSugarsG');
  }

  // 2. Saturated Fat
  const satFatVal = getNutrientNumber(nutrition.saturatedFatG);
  if (satFatVal !== null) {
    const thresholdZero = config.saturatedFat.thresholdZero * liquidMultiplier;
    const { penaltyPerGram, maxPenalty } = config.saturatedFat;

    if (satFatVal > thresholdZero) {
      const excess = satFatVal - thresholdZero;
      const penalty = Math.min(Math.round(excess * penaltyPerGram * 10) / 10, maxPenalty);
      currentScore -= penalty;
      factors.push({
        id: 'high_sat_fat',
        title: penalty >= 10 ? 'High Saturated Fat' : 'Moderate Saturated Fat',
        description: `Contains ${satFatVal}g saturated fat ${unitLabel} (-${penalty} pts deduction).`,
        pillar: 'nutrition',
        impact: 'warning',
        severity: penalty >= 12 ? 'high' : 'moderate',
        pointsDelta: -penalty,
        evidenceRef: 'FSSAI Saturated Fat Dietary Reference'
      });
    }
  } else {
    missingFields.push('saturatedFatG');
  }

  // 3. Trans Fat
  const transFatVal = getNutrientNumber(nutrition.transFatG);
  if (transFatVal !== null) {
    const { thresholdZero, penalty } = config.transFat;
    if (transFatVal > thresholdZero) {
      currentScore -= penalty;
      factors.push({
        id: 'contains_trans_fat',
        title: 'Contains Trans Fat',
        description: `Contains ${transFatVal}g trans fat ${unitLabel}, exceeding the recommended limit of 0.1g.`,
        pillar: 'nutrition',
        impact: 'warning',
        severity: 'high',
        pointsDelta: -penalty,
        evidenceRef: 'FSSAI Trans Fat Regulation 2022'
      });
    }
  } else {
    missingFields.push('transFatG');
  }

  // 4. Sodium
  const sodiumVal = getNutrientNumber(nutrition.sodiumMg);
  if (sodiumVal !== null) {
    const thresholdLow = config.sodium.thresholdLow * liquidMultiplier;
    const thresholdHigh = config.sodium.thresholdHigh * liquidMultiplier;
    const { penaltyLowMax, penaltyHighMax, maxPenalty } = config.sodium;
    let penalty = 0;

    if (sodiumVal <= thresholdLow) {
      penalty = 0;
    } else if (sodiumVal <= thresholdHigh) {
      const fraction = (sodiumVal - thresholdLow) / (thresholdHigh - thresholdLow);
      penalty = Math.round(fraction * penaltyLowMax * 10) / 10;
    } else {
      const fraction = Math.min((sodiumVal - thresholdHigh) / (400 * liquidMultiplier), 1.0);
      penalty = Math.min(Math.round((penaltyLowMax + fraction * (penaltyHighMax - penaltyLowMax)) * 10) / 10, maxPenalty);
    }

    if (penalty > 0) {
      currentScore -= penalty;
      const saltG = (sodiumVal * 2.5 / 1000).toFixed(1);
      factors.push({
        id: 'high_sodium',
        title: penalty >= 15 ? 'High Sodium / Salt' : 'Moderate Sodium',
        description: `Contains ${sodiumVal}mg sodium (~${saltG}g salt) ${unitLabel} (-${penalty} pts deduction).`,
        pillar: 'nutrition',
        impact: 'warning',
        severity: penalty >= 15 ? 'high' : 'moderate',
        pointsDelta: -penalty,
        evidenceRef: 'FSSAI Sodium Reference (2000mg/day)'
      });
    }
  } else {
    missingFields.push('sodiumMg');
  }

  // 5. Dietary Fiber Bonus
  const fiberVal = getNutrientNumber(nutrition.dietaryFiberG);
  if (fiberVal !== null) {
    const { thresholdSource, bonusSource, thresholdHigh, bonusHigh } = config.dietaryFiber;
    if (fiberVal >= thresholdHigh) {
      currentScore += bonusHigh;
      factors.push({
        id: 'high_fiber',
        title: 'High in Dietary Fiber',
        description: `Provides ${fiberVal}g dietary fiber ${unitLabel} (+${bonusHigh} pts bonus).`,
        pillar: 'nutrition',
        impact: 'positive',
        pointsDelta: bonusHigh,
        evidenceRef: 'FSSAI High Fiber Benchmark'
      });
    } else if (fiberVal >= thresholdSource) {
      currentScore += bonusSource;
      factors.push({
        id: 'source_fiber',
        title: 'Source of Dietary Fiber',
        description: `Provides ${fiberVal}g dietary fiber ${unitLabel} (+${bonusSource} pts bonus).`,
        pillar: 'nutrition',
        impact: 'positive',
        pointsDelta: bonusSource,
        evidenceRef: 'FSSAI Source of Fiber Benchmark'
      });
    }
  } else {
    missingFields.push('dietaryFiberG');
  }

  // 6. Protein Bonus
  const proteinVal = getNutrientNumber(nutrition.proteinG);
  if (proteinVal !== null) {
    const { thresholdSource, bonusSource, thresholdHigh, bonusHigh } = config.protein;
    if (proteinVal >= thresholdHigh) {
      currentScore += bonusHigh;
      factors.push({
        id: 'high_protein',
        title: 'High in Protein',
        description: `Provides ${proteinVal}g protein ${unitLabel} (+${bonusHigh} pts bonus).`,
        pillar: 'nutrition',
        impact: 'positive',
        pointsDelta: bonusHigh,
        evidenceRef: 'FSSAI High Protein Benchmark'
      });
    } else if (proteinVal >= thresholdSource) {
      currentScore += bonusSource;
      factors.push({
        id: 'source_protein',
        title: 'Source of Protein',
        description: `Provides ${proteinVal}g protein ${unitLabel} (+${bonusSource} pts bonus).`,
        pillar: 'nutrition',
        impact: 'positive',
        pointsDelta: bonusSource,
        evidenceRef: 'FSSAI Source of Protein Benchmark'
      });
    }
  } else {
    missingFields.push('proteinG');
  }

  // 7. Caloric Density Rule (Strict Missing Data Handling)
  // Only evaluates if energy is high AND both fiber and protein are known/declared
  const caloriesVal = getNutrientNumber(nutrition.energyKcal);
  if (caloriesVal !== null && caloriesVal > config.caloricDensity.thresholdCalories) {
    if (fiberVal !== null && proteinVal !== null) {
      if (fiberVal < 2.0 && proteinVal < 3.0) {
        currentScore -= config.caloricDensity.penalty;
        factors.push({
          id: 'high_caloric_density',
          title: 'High Caloric Density',
          description: `High energy (${caloriesVal} kcal/100g) with minimal dietary fiber (${fiberVal}g) and protein (${proteinVal}g).`,
          pillar: 'nutrition',
          impact: 'warning',
          severity: 'low',
          pointsDelta: -config.caloricDensity.penalty
        });
      }
    }
  }

  const rawScore = currentScore;
  const score = clampScore(currentScore);

  return {
    score,
    rawScore,
    factors,
    missingFields
  };
}
