import {
  NutritionProfile,
  NutritionBasis,
  ServingInfo,
  NormalizedIngredient,
  DetectedAdditive,
  ProductInput
} from '@foodgrade/shared-types';

export interface ParseOptions {
  normalizeOCR?: boolean;
  defaultBasis?: NutritionBasis;
  requireMandatoryNutrients?: boolean;
  minIngredientTokens?: number;
}

export interface ParserWarning {
  code: string;
  message: string;
  field?: string;
  rawSnippet?: string;
}

export interface ParsedNutritionResult {
  nutrition: NutritionProfile;
  basis: NutritionBasis;
  servingInfo?: ServingInfo;
  extractedFields: string[];
  missingMandatoryFields: string[];
  unparsedLines: string[];
  warnings: ParserWarning[];
  confidence: number;
}

export interface ParsedIngredientsResult {
  rawText: string;
  cleanText: string;
  tokens: string[];
  parsedIngredients: NormalizedIngredient[];
  unrecognizedTokens: string[];
  warnings: ParserWarning[];
  confidence: number;
}

export interface ParsedAdditivesResult {
  detectedAdditives: DetectedAdditive[];
  extractedCodes: string[];
  warnings: ParserWarning[];
  confidence: number;
}

export interface ParsedLabelResult {
  productInput: ProductInput;
  nutritionResult?: ParsedNutritionResult;
  ingredientsResult?: ParsedIngredientsResult;
  additivesResult?: ParsedAdditivesResult;
  detectedBasis: NutritionBasis;
  diagnostics: {
    ocrNoiseCorrected: boolean;
    totalWarnings: number;
    warnings: ParserWarning[];
    parsingConfidence: number;
  };
}
