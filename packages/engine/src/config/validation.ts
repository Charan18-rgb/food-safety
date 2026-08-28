import { ScoringConfigV1 } from './scoringConfigV1.js';

export function validateScoringConfig(config: ScoringConfigV1): void {
  if (!config) {
    throw new Error('Scoring configuration cannot be null or undefined.');
  }

  if (!config.algorithmVersion || typeof config.algorithmVersion !== 'string') {
    throw new Error('Scoring configuration must define a valid algorithmVersion string.');
  }

  // Validate weights
  const { nutrition, ingredient, additive } = config.weights;
  if (
    typeof nutrition !== 'number' ||
    typeof ingredient !== 'number' ||
    typeof additive !== 'number' ||
    nutrition < 0 ||
    ingredient < 0 ||
    additive < 0
  ) {
    throw new Error('Scoring weights must be non-negative numbers.');
  }

  const weightSum = nutrition + ingredient + additive;
  if (Math.abs(weightSum - 1.0) > 0.001) {
    throw new Error(`Scoring weights must sum to 1.0 (received sum: ${weightSum.toFixed(4)})`);
  }

  // Validate Grade Thresholds (A > B > C > D > 0)
  const { A, B, C, D } = config.gradeThresholds;
  if (!(A > B && B > C && C > D && D > 0 && A <= 100)) {
    throw new Error(
      `Grade thresholds must be strictly descending and within (0, 100]: A(${A}) > B(${B}) > C(${C}) > D(${D})`
    );
  }

  // Validate Nutrition baseline
  if (config.nutrition.baseline < 0 || config.nutrition.baseline > 100) {
    throw new Error('Nutrition baseline must be between 0 and 100.');
  }

  // Validate liquidBeverageMultiplier
  if (
    typeof config.nutrition.liquidBeverageMultiplier !== 'number' ||
    config.nutrition.liquidBeverageMultiplier <= 0 ||
    config.nutrition.liquidBeverageMultiplier > 2.0
  ) {
    throw new Error('liquidBeverageMultiplier must be a positive number <= 2.0.');
  }

  // Validate Ingredient baseline
  if (config.ingredients.baseline < 0 || config.ingredients.baseline > 100) {
    throw new Error('Ingredient baseline must be between 0 and 100.');
  }

  // Validate Additive baseline
  if (config.additives.baseline < 0 || config.additives.baseline > 100) {
    throw new Error('Additive baseline must be between 0 and 100.');
  }
}
