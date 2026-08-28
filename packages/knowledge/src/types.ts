import {
  IngredientCategory,
  AllergenType,
  NormalizedIngredient,
  DetectedAdditive,
  AdditiveFunctionalClass,
  AdditiveRiskCategory
} from '@foodgrade/shared-types';

export interface IngredientKnowledge {
  id: string;
  canonicalName: string;
  aliases: string[];
  category: IngredientCategory;
  isWholeGrain: boolean;
  isRefinedGrain: boolean;
  isUltraProcessedMarker: boolean;
  isPositiveMarker: boolean;
  allergenType: AllergenType;
  description: string;
  sourceRefs?: string[];
}

export interface AdditiveKnowledge {
  insNumber: string;
  insCode: string;
  canonicalName: string;
  aliases: string[];
  functionalClass: AdditiveFunctionalClass;
  riskCategory: AdditiveRiskCategory;
  neutralExplanation: string;
  fssaiMaxPermittedNote?: string;
  sourceRefs?: string[];
}

export type MatchType = 'exact' | 'alias' | 'fuzzy' | 'unknown';

export interface IngredientMatchResult {
  normalized: NormalizedIngredient;
  matchType: MatchType;
  confidence: number;
  matchedAlias?: string;
  knowledgeRecord?: IngredientKnowledge;
}

export interface AdditiveMatchResult {
  detected: DetectedAdditive;
  matchType: MatchType;
  confidence: number;
  knowledgeRecord: AdditiveKnowledge;
}
