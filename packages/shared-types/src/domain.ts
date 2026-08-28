import { z } from 'zod';
import { NutritionProfileSchema, ServingInfoSchema } from './nutrition.js';
import { NormalizedIngredientSchema } from './ingredients.js';
import { DetectedAdditiveSchema } from './additives.js';
import { DataQualityProvenanceSchema } from './source.js';
import { AlgorithmVersionSchema, DEFAULT_ALGORITHM_VERSION } from './algorithm.js';

export const FoodGradeSchema = z.enum(['A', 'B', 'C', 'D', 'E']);
export type FoodGrade = z.infer<typeof FoodGradeSchema>;

export const ConfidenceLevelSchema = z.enum(['high', 'moderate', 'low']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const ProductInputSchema = z.object({
  barcode: z.string().optional(),
  productName: z.string().min(1),
  brand: z.string().optional(),
  category: z.string().optional(),
  servingInfo: ServingInfoSchema.optional(),
  nutrition: NutritionProfileSchema,
  rawIngredientsText: z.string().default(''),
  parsedIngredients: z.array(NormalizedIngredientSchema).default([]),
  detectedAdditives: z.array(DetectedAdditiveSchema).default([]),
  provenance: DataQualityProvenanceSchema
});
export type ProductInput = z.infer<typeof ProductInputSchema>;

export const ScoringFactorSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  pillar: z.enum(['nutrition', 'ingredient', 'additive']),
  impact: z.enum(['positive', 'warning', 'neutral']),
  severity: z.enum(['low', 'moderate', 'high']).optional(),
  pointsDelta: z.number(),
  evidenceRef: z.string().optional()
});
export type ScoringFactor = z.infer<typeof ScoringFactorSchema>;

export const ConfidenceAssessmentSchema = z.object({
  level: ConfidenceLevelSchema,
  numericScore: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  missingMandatoryFields: z.array(z.string()),
  userRecommendations: z.array(z.string())
});
export type ConfidenceAssessment = z.infer<typeof ConfidenceAssessmentSchema>;

export const PillarScoresSchema = z.object({
  nutritionScore: z.number().min(0).max(100),
  ingredientScore: z.number().min(0).max(100),
  additiveScore: z.number().min(0).max(100)
});
export type PillarScores = z.infer<typeof PillarScoresSchema>;

export const AnalysisResultSchema = z.object({
  algorithmVersion: AlgorithmVersionSchema.default(DEFAULT_ALGORITHM_VERSION),
  score: z.number().min(0).max(100),
  grade: FoodGradeSchema,
  pillarScores: PillarScoresSchema,
  positives: z.array(ScoringFactorSchema),
  warnings: z.array(ScoringFactorSchema),
  detectedIngredients: z.array(NormalizedIngredientSchema),
  detectedAdditives: z.array(DetectedAdditiveSchema),
  summaryExplanation: z.string(),
  confidence: ConfidenceAssessmentSchema,
  analyzedAt: z.string().datetime()
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
