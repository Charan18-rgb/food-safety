import { NormalizedIngredient } from '@foodgrade/shared-types';
import { IngredientKnowledge, IngredientMatchResult } from './types.js';
import { ALL_CANONICAL_INGREDIENTS, INGREDIENTS_BY_ID } from './ingredients/index.js';

// Pre-computed lookup index of normalized alias -> IngredientKnowledge
const ALIAS_INDEX: Map<string, IngredientKnowledge> = new Map();

for (const ing of ALL_CANONICAL_INGREDIENTS) {
  // Index canonical ID
  ALIAS_INDEX.set(normalizeKey(ing.id), ing);
  // Index canonical Name
  ALIAS_INDEX.set(normalizeKey(ing.canonicalName), ing);
  // Index all aliases
  for (const alias of ing.aliases) {
    ALIAS_INDEX.set(normalizeKey(alias), ing);
  }
}

/**
 * Normalizes raw query text for matching:
 * - Lowercase & trim
 * - Replaces dashes/underscores with space
 * - Removes non-alphanumeric chars (except space)
 * - Collapses multiple spaces
 */
export function normalizeKey(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[_\-\/\\,;:.()[\]{}"'???]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips common statutory packaging prefixes and parenthetical percentage declarations
 * e.g., "edible vegetable oil (palmolein) (50%)" -> "palmolein"
 */
export function cleanRawIngredientText(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText
    // Remove percentage declarations e.g. (50%), 4.5%, (min. 15%)
    .replace(/\(?\s*(\bmin\b|\bapprox\b|\bmax\b)?\s*\d+(\.\d+)?\s*%\s*\)?/gi, '')
    // Remove common prefixes
    .replace(/\b(organic|pure|fresh|natural|traditional|edible|refined|blended|fortified with [a-z0-9\s]+)\b/gi, '')
    .trim();

  // If text has outer parentheses, extract inner
  const innerMatch = cleaned.match(/\(([^)]+)\)/);
  if (innerMatch && innerMatch[1].trim().length > 2) {
    // If the inner text is a known ingredient like "(palmolein)" or "(atta)", keep it
    const innerKey = normalizeKey(innerMatch[1]);
    if (ALIAS_INDEX.has(innerKey)) {
      return innerMatch[1].trim();
    }
  }

  return cleaned;
}

/**
 * Damerau-Levenshtein distance calculation for safe, constrained fuzzy matching
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }

  return d[m][n];
}

/**
 * Primary Normalization Pipeline:
 * 1. Normalized exact match against canonical name/id
 * 2. Alias dictionary match
 * 3. Sub-phrase & cleaned text alias match
 * 4. Constrained fuzzy match (similarity >= 0.85, max distance <= 2 for words >= 5 chars)
 * 5. Unknown fallback
 */
export function normalizeIngredient(
  rawText: string,
  positionIndex = 0
): IngredientMatchResult {
  const trimmedRaw = rawText.trim();
  const rawKey = normalizeKey(trimmedRaw);

  if (!rawKey) {
    return createUnknownResult(trimmedRaw, positionIndex);
  }

  // 1. Direct ID match
  if (INGREDIENTS_BY_ID.has(rawKey)) {
    const ing = INGREDIENTS_BY_ID.get(rawKey)!;
    return createMatchResult(trimmedRaw, ing, positionIndex, 'exact', 1.0, ing.canonicalName);
  }

  // 2. Direct exact alias match
  if (ALIAS_INDEX.has(rawKey)) {
    const ing = ALIAS_INDEX.get(rawKey)!;
    const isCanonical = normalizeKey(ing.canonicalName) === rawKey || normalizeKey(ing.id) === rawKey;
    return createMatchResult(
      trimmedRaw,
      ing,
      positionIndex,
      isCanonical ? 'exact' : 'alias',
      isCanonical ? 1.0 : 0.95,
      rawKey
    );
  }

  // 3. Cleaned text match (stripping percentages & filler words)
  const cleanedText = cleanRawIngredientText(trimmedRaw);
  const cleanedKey = normalizeKey(cleanedText);
  if (cleanedKey && ALIAS_INDEX.has(cleanedKey)) {
    const ing = ALIAS_INDEX.get(cleanedKey)!;
    return createMatchResult(trimmedRaw, ing, positionIndex, 'alias', 0.90, cleanedKey);
  }

  // 4. Sub-phrase / token containment match
  for (const [alias, ing] of ALIAS_INDEX.entries()) {
    if (alias.length >= 4 && (rawKey.includes(` ${alias} `) || rawKey.startsWith(`${alias} `) || rawKey.endsWith(` ${alias}`))) {
      return createMatchResult(trimmedRaw, ing, positionIndex, 'alias', 0.88, alias);
    }
  }

  // 5. Constrained fuzzy match
  if (rawKey.length >= 4) {
    let bestMatch: IngredientKnowledge | null = null;
    let bestMatchedAlias = '';
    let highestSimilarity = 0;

    for (const [alias, ing] of ALIAS_INDEX.entries()) {
      if (Math.abs(alias.length - rawKey.length) > 2) continue;

      const dist = calculateLevenshteinDistance(rawKey, alias);
      const maxLen = Math.max(rawKey.length, alias.length);
      const similarity = 1 - dist / maxLen;
      const maxAllowedDist = rawKey.length <= 6 ? 1 : 2;

      if (dist <= maxAllowedDist && similarity >= 0.85 && similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = ing;
        bestMatchedAlias = alias;
      }
    }

    if (bestMatch && highestSimilarity >= 0.85) {
      return createMatchResult(
        trimmedRaw,
        bestMatch,
        positionIndex,
        'fuzzy',
        Math.round(highestSimilarity * 0.85 * 100) / 100,
        bestMatchedAlias
      );
    }
  }

  // 6. Unknown fallback
  return createUnknownResult(trimmedRaw, positionIndex);
}

function createMatchResult(
  rawText: string,
  ing: IngredientKnowledge,
  positionIndex: number,
  matchType: 'exact' | 'alias' | 'fuzzy',
  confidence: number,
  matchedAlias: string
): IngredientMatchResult {
  const normalized: NormalizedIngredient = {
    rawText,
    canonicalId: ing.id,
    canonicalName: ing.canonicalName,
    category: ing.category,
    isWholeGrain: ing.isWholeGrain,
    isRefinedGrain: ing.isRefinedGrain,
    isUltraProcessedMarker: ing.isUltraProcessedMarker,
    isPositiveMarker: ing.isPositiveMarker,
    allergenType: ing.allergenType,
    positionIndex
  };

  return {
    normalized,
    matchType,
    confidence,
    matchedAlias,
    knowledgeRecord: ing
  };
}

function createUnknownResult(
  rawText: string,
  positionIndex: number
): IngredientMatchResult {
  const normalized: NormalizedIngredient = {
    rawText,
    canonicalId: 'unknown',
    canonicalName: rawText || 'Unknown Ingredient',
    category: 'general',
    isWholeGrain: false,
    isRefinedGrain: false,
    isUltraProcessedMarker: false,
    isPositiveMarker: false,
    allergenType: 'none',
    positionIndex
  };

  return {
    normalized,
    matchType: 'unknown',
    confidence: 0.0
  };
}
