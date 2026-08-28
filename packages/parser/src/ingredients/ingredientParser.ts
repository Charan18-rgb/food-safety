import { NormalizedIngredient } from '@foodgrade/shared-types';
import { defaultKnowledgeBase } from '@foodgrade/knowledge';
import { ParsedIngredientsResult, ParseOptions, ParserWarning } from '../types.js';
import { normalizeOCRText } from '../ocr/ocrNormalizer.js';
import { tokenizeIngredientList } from './tokenizer.js';

/**
 * Extracts the ingredient clause from a messy or full label block.
 */
export function extractIngredientsClause(text: string): string {
  let cleaned = text;

  // 1. Locate start of ingredients section
  const startMatch = cleaned.match(/\b(?:ingredients|contents|contains|composition)\s*[:=-]?\s*/i);
  if (startMatch && startMatch.index !== undefined) {
    cleaned = cleaned.substring(startMatch.index + startMatch[0].length);
  }

  // 2. Locate end boundary (e.g. Allergen info, Storage, Mfd by, Nutrition)
  const endMatch = cleaned.match(
    /\b(?:allergen\s*information|allergen\s*advice|contains\s*added\s*flavour|mfd\.?\s*by|marketed\s*by|best\s*before|nutrition(?:al)?\s*information|storage\s*instructions|fssai|lic\.?\s*no)\b/i
  );
  if (endMatch && endMatch.index !== undefined) {
    cleaned = cleaned.substring(0, endMatch.index);
  }

  return cleaned.trim();
}

/**
 * Extracts sub-ingredients from parenthetical clauses inside an ingredient token.
 * e.g. "Choco Creme (Sugar, Palm Oil, Cocoa Solids (2%))" ->
 * { outerName: "Choco Creme", subIngredients: ["Sugar", "Palm Oil", "Cocoa Solids (2%)"] }
 */
export function extractSubIngredients(token: string): {
  primaryName: string;
  subIngredients?: string[];
} {
  const parenMatch = token.match(/^([^(]+)\((.+)\)$/);
  if (parenMatch) {
    const rawOuter = parenMatch[1].trim();
    const rawInner = parenMatch[2].trim();

    // Check if inner content is a sub-list containing commas
    if (rawInner.includes(',')) {
      const subTokens = tokenizeIngredientList(rawInner);
      if (subTokens.length > 1) {
        return {
          primaryName: rawOuter,
          subIngredients: subTokens
        };
      }
    }
  }

  return { primaryName: token };
}

/**
 * Parses raw ingredient list text into normalized structured ingredients using the knowledge base.
 */
export function parseIngredientsText(rawText: string, options: ParseOptions = {}): ParsedIngredientsResult {
  const warnings: ParserWarning[] = [];
  const text = options.normalizeOCR !== false ? normalizeOCRText(rawText) : rawText;

  const ingredientClause = extractIngredientsClause(text);
  const rawTokens = tokenizeIngredientList(ingredientClause);

  const parsedIngredients: NormalizedIngredient[] = [];
  const unrecognizedTokens: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const rawToken = rawTokens[i];
    const { primaryName, subIngredients } = extractSubIngredients(rawToken);

    // Call @foodgrade/knowledge normalizer
    const normalized = defaultKnowledgeBase.normalizeIngredient(primaryName, i);

    if (subIngredients && subIngredients.length > 0) {
      normalized.subIngredients = subIngredients;
    }

    if (normalized.canonicalId === 'unknown_ingredient' || normalized.canonicalName.startsWith('Unrecognized:')) {
      unrecognizedTokens.push(rawToken);
      warnings.push({
        code: 'UNRECOGNIZED_INGREDIENT',
        message: `Ingredient "${rawToken}" was not matched to a canonical record in the knowledge base.`,
        rawSnippet: rawToken
      });
    }

    parsedIngredients.push(normalized);
  }

  if (parsedIngredients.length === 0) {
    warnings.push({
      code: 'NO_INGREDIENTS_PARSED',
      message: 'No ingredient tokens could be parsed from the provided text.'
    });
  }

  // Calculate parsing confidence
  const recognizedCount = parsedIngredients.length - unrecognizedTokens.length;
  const confidence = parsedIngredients.length > 0
    ? Math.max(0.3, Math.round((recognizedCount / parsedIngredients.length) * 100) / 100)
    : 0.1;

  return {
    rawText,
    cleanText: ingredientClause,
    tokens: rawTokens,
    parsedIngredients,
    unrecognizedTokens,
    warnings,
    confidence
  };
}
