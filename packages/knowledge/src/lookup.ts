import { DetectedAdditive } from '@foodgrade/shared-types';
import { IngredientKnowledge, AdditiveKnowledge, AdditiveMatchResult, IngredientMatchResult } from './types.js';
import { ALL_CANONICAL_INGREDIENTS, INGREDIENTS_BY_ID } from './ingredients/index.js';
import { ALL_CANONICAL_ADDITIVES, ADDITIVES_BY_INS } from './additives/index.js';
import { normalizeIngredient, normalizeKey } from './normalizer.js';

// Pre-computed index of additive aliases -> AdditiveKnowledge
const ADDITIVE_ALIAS_INDEX: Map<string, AdditiveKnowledge> = new Map();

for (const add of ALL_CANONICAL_ADDITIVES) {
  ADDITIVE_ALIAS_INDEX.set(normalizeKey(add.insNumber), add);
  ADDITIVE_ALIAS_INDEX.set(normalizeKey(add.insCode), add);
  ADDITIVE_ALIAS_INDEX.set(normalizeKey(add.canonicalName), add);
  for (const alias of add.aliases) {
    ADDITIVE_ALIAS_INDEX.set(normalizeKey(alias), add);
  }
}

/**
 * Normalizes an additive query text (e.g. "INS 621", "E621", "(621)", "621", "Tartrazine", "Flavour Enhancer 621")
 */
export function lookupAdditive(query: string): AdditiveMatchResult | null {
  if (!query) return null;
  const rawKey = normalizeKey(query);

  // 1. Direct match in additive alias index
  if (ADDITIVE_ALIAS_INDEX.has(rawKey)) {
    const add = ADDITIVE_ALIAS_INDEX.get(rawKey)!;
    return createAdditiveMatchResult(add, 'exact', 1.0);
  }

  // 2. Extract number with INS / E / parenthetical pattern
  const insPattern = /(?:ins|e|e-)?\s*\(?\s*([0-9]{3,4}[a-z]?(?:\([i|v|x]+\))?)\s*\)?/i;
  const match = query.match(insPattern);

  if (match && match[1]) {
    const extractedNum = match[1].toLowerCase().replace(/\s+/g, '');
    if (ADDITIVES_BY_INS.has(extractedNum)) {
      const add = ADDITIVES_BY_INS.get(extractedNum)!;
      return createAdditiveMatchResult(add, 'alias', 0.95);
    }

    // Try base number if sub-num not found e.g. 500(ii) -> 500
    const baseNum = extractedNum.replace(/\([a-z0-9]+\)/i, '').replace(/[a-z]$/i, '');
    if (ADDITIVES_BY_INS.has(baseNum)) {
      const add = ADDITIVES_BY_INS.get(baseNum)!;
      return createAdditiveMatchResult(add, 'alias', 0.90);
    }
  }

  // 3. Sub-phrase match in query
  for (const [alias, add] of ADDITIVE_ALIAS_INDEX.entries()) {
    if (alias.length >= 3 && rawKey.includes(alias)) {
      return createAdditiveMatchResult(add, 'alias', 0.88);
    }
  }

  return null;
}

/**
 * Direct lookup by numeric INS code e.g. "621", "102", "955"
 */
export function lookupAdditiveByINS(insNumber: string): AdditiveKnowledge | null {
  if (!insNumber) return null;
  const clean = insNumber.toLowerCase().replace(/[^0-9a-z()]/g, '');
  return ADDITIVES_BY_INS.get(clean) || null;
}

/**
 * Query ingredient by canonical ID or term
 */
export function lookupIngredient(query: string): IngredientMatchResult {
  return normalizeIngredient(query, 0);
}

/**
 * Retrieve all registered aliases for a canonical ingredient ID
 */
export function getIngredientAliases(canonicalId: string): string[] {
  const ing = INGREDIENTS_BY_ID.get(canonicalId);
  return ing ? [...ing.aliases] : [];
}

/**
 * Retrieve all canonical ingredients in knowledge base
 */
export function getAllIngredients(): IngredientKnowledge[] {
  return [...ALL_CANONICAL_INGREDIENTS];
}

/**
 * Retrieve all canonical additives in knowledge base
 */
export function getAllAdditives(): AdditiveKnowledge[] {
  return [...ALL_CANONICAL_ADDITIVES];
}

function createAdditiveMatchResult(
  add: AdditiveKnowledge,
  matchType: 'exact' | 'alias' | 'fuzzy',
  confidence: number
): AdditiveMatchResult {
  const detected: DetectedAdditive = {
    insCode: add.insCode,
    canonicalName: add.canonicalName,
    functionalClass: add.functionalClass,
    riskCategory: add.riskCategory,
    neutralExplanation: add.neutralExplanation,
    fssaiMaxPermittedNote: add.fssaiMaxPermittedNote
  };

  return {
    detected,
    matchType,
    confidence,
    knowledgeRecord: add
  };
}
