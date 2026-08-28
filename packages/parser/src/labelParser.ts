import {
  ProductInput,
  DataQualityProvenance
} from '@foodgrade/shared-types';
import {
  ParsedLabelResult,
  ParseOptions,
  ParserWarning
} from './types.js';
import { normalizeOCRText } from './ocr/ocrNormalizer.js';
import { parseNutritionText } from './nutrition/nutritionParser.js';
import { parseIngredientsText } from './ingredients/ingredientParser.js';
import { extractAdditives } from './additives/additiveExtractor.js';

/**
 * Splits raw label text into distinct nutrition and ingredient sections if combined.
 */
export function segmentLabelSections(text: string): {
  nutritionSection: string;
  ingredientsSection: string;
} {
  const nutritionIndex = text.search(/\b(?:nutritional?\s*information|nutrition\s*facts|typical\s*values)\b/i);
  const ingredientsIndex = text.search(/\b(?:ingredients|contents|contains|composition)\s*[:=-]/i);

  if (nutritionIndex !== -1 && ingredientsIndex !== -1) {
    if (nutritionIndex < ingredientsIndex) {
      return {
        nutritionSection: text.substring(nutritionIndex, ingredientsIndex).trim(),
        ingredientsSection: text.substring(ingredientsIndex).trim()
      };
    } else {
      return {
        ingredientsSection: text.substring(ingredientsIndex, nutritionIndex).trim(),
        nutritionSection: text.substring(nutritionIndex).trim()
      };
    }
  }

  // Fallback: If only one section or unsegmented, pass full text to both specialized parsers
  return {
    nutritionSection: text,
    ingredientsSection: text
  };
}

/**
 * Unified public entry point to parse unstructured label text.
 * Returns a validated ProductInput ready for @foodgrade/engine along with parsing diagnostics.
 */
export function parseLabelText(rawText: string, options: ParseOptions = {}): ParsedLabelResult {
  const allWarnings: ParserWarning[] = [];
  const normalizedText = options.normalizeOCR !== false ? normalizeOCRText(rawText) : rawText;

  const { nutritionSection, ingredientsSection } = segmentLabelSections(normalizedText);

  // 1. Parse nutrition table
  const nutritionResult = parseNutritionText(nutritionSection, options);
  allWarnings.push(...nutritionResult.warnings);

  // 2. Parse ingredients
  const ingredientsResult = parseIngredientsText(ingredientsSection, options);
  allWarnings.push(...ingredientsResult.warnings);

  // 3. Extract additives from ingredients section and full text
  const additivesResult = extractAdditives(normalizedText, options);
  allWarnings.push(...additivesResult.warnings);

  // 4. Assemble DataQualityProvenance
  const combinedConfidence = Math.round(
    ((nutritionResult.confidence * 0.5 + ingredientsResult.confidence * 0.35 + additivesResult.confidence * 0.15)) * 100
  ) / 100;

  const provenance: DataQualityProvenance = {
    sourceType: 'label_ocr',
    observationMode: 'directly_observed',
    rawConfidence: combinedConfidence,
    missingMandatoryFields: nutritionResult.missingMandatoryFields
  };

  // 5. Assemble ProductInput
  const productInput: ProductInput = {
    productName: 'Scanned Packaged Food Item',
    category: undefined,
    servingInfo: nutritionResult.servingInfo,
    nutrition: nutritionResult.nutrition,
    rawIngredientsText: ingredientsResult.cleanText || ingredientsResult.rawText,
    parsedIngredients: ingredientsResult.parsedIngredients,
    detectedAdditives: additivesResult.detectedAdditives,
    provenance
  };

  return {
    productInput,
    nutritionResult,
    ingredientsResult,
    additivesResult,
    detectedBasis: nutritionResult.basis,
    diagnostics: {
      ocrNoiseCorrected: options.normalizeOCR !== false,
      totalWarnings: allWarnings.length,
      warnings: allWarnings,
      parsingConfidence: combinedConfidence
    }
  };
}
