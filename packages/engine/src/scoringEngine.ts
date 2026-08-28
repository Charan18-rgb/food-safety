import {
  ProductInput,
  AnalysisResult,
  AlgorithmVersion,
  DEFAULT_ALGORITHM_VERSION
} from '@foodgrade/shared-types';
import { ScoringConfigV1, DEFAULT_SCORING_CONFIG_V1 } from './config/scoringConfigV1.js';
import { validateScoringConfig } from './config/validation.js';
import { evaluateNutritionPillar } from './pillars/nutritionPillar.js';
import { evaluateIngredientPillar } from './pillars/ingredientPillar.js';
import { evaluateAdditivePillar } from './pillars/additivePillar.js';
import { getGrade, clampScore } from './grade/gradeMapping.js';
import { calculateConfidence } from './confidence/confidenceCalculator.js';
import { generateSummaryExplanation } from './explainers/summaryGenerator.js';

export interface EvaluationOptions {
  analyzedAt?: string;
}

/**
 * Pure, deterministic evaluation function for FoodGrade Algorithm v1.0
 */
export function evaluateProduct(
  input: ProductInput,
  config: ScoringConfigV1 = DEFAULT_SCORING_CONFIG_V1,
  options: EvaluationOptions = {}
): AnalysisResult {
  validateScoringConfig(config);

  // 1. Evaluate Pillar 1: Nutritional Balance
  const nutritionResult = evaluateNutritionPillar(input.nutrition, config.nutrition);

  // 2. Evaluate Pillar 2: Ingredient Quality & Refinement
  const ingredientResult = evaluateIngredientPillar(input.parsedIngredients || [], config.ingredients);

  // 3. Evaluate Pillar 3: Additive Load & Processing Level
  const additiveResult = evaluateAdditivePillar(input.detectedAdditives || [], config.additives);

  // 4. Compute Weighted Composite Score
  const { nutrition: wNutri, ingredient: wIng, additive: wAdd } = config.weights;
  const rawComposite =
    nutritionResult.score * wNutri +
    ingredientResult.score * wIng +
    additiveResult.score * wAdd;

  const score = Math.round(clampScore(rawComposite));
  const grade = getGrade(score, config.gradeThresholds);

  // 5. Aggregate Structured Factors
  const allFactors = [
    ...nutritionResult.factors,
    ...ingredientResult.factors,
    ...additiveResult.factors
  ];

  const positives = allFactors.filter(f => f.impact === 'positive');
  const warnings = allFactors.filter(f => f.impact === 'warning');

  // 6. Calculate Confidence Assessment
  const confidence = calculateConfidence(input, nutritionResult.missingFields);

  // 7. Generate Summary Explanation
  const summaryExplanation = generateSummaryExplanation(grade, score, positives, warnings);

  const analyzedAt = options.analyzedAt || new Date().toISOString();

  return {
    algorithmVersion: config.algorithmVersion || DEFAULT_ALGORITHM_VERSION,
    score,
    grade,
    pillarScores: {
      nutritionScore: nutritionResult.score,
      ingredientScore: ingredientResult.score,
      additiveScore: additiveResult.score
    },
    positives,
    warnings,
    detectedIngredients: input.parsedIngredients || [],
    detectedAdditives: input.detectedAdditives || [],
    summaryExplanation,
    confidence,
    analyzedAt
  };
}

export interface IScoringEngine {
  readonly version: AlgorithmVersion;
  evaluate(input: ProductInput, options?: EvaluationOptions): AnalysisResult;
}

export class ScoringEngineV1 implements IScoringEngine {
  public readonly version: AlgorithmVersion;
  private readonly config: ScoringConfigV1;

  constructor(config: ScoringConfigV1 = DEFAULT_SCORING_CONFIG_V1) {
    validateScoringConfig(config);
    this.config = config;
    this.version = config.algorithmVersion;
  }

  public evaluate(input: ProductInput, options?: EvaluationOptions): AnalysisResult {
    return evaluateProduct(input, this.config, options);
  }
}

export const defaultScoringEngine = new ScoringEngineV1();
