import { NormalizedIngredient, DetectedAdditive } from '@foodgrade/shared-types';
import {
  IngredientKnowledge,
  AdditiveKnowledge,
  IngredientMatchResult,
  AdditiveMatchResult,
  MatchType
} from './types.js';
import { normalizeIngredient, normalizeKey, cleanRawIngredientText } from './normalizer.js';
import {
  lookupIngredient,
  lookupAdditive,
  lookupAdditiveByINS,
  getIngredientAliases,
  getAllIngredients,
  getAllAdditives
} from './lookup.js';

export interface IIngredientKnowledgeBase {
  normalizeIngredient(rawText: string, positionIndex: number): NormalizedIngredient;
  lookupAdditive(codeOrName: string): DetectedAdditive | null;
}

export class IngredientKnowledgeBase implements IIngredientKnowledgeBase {
  normalizeIngredient(rawText: string, positionIndex = 0): NormalizedIngredient {
    return normalizeIngredient(rawText, positionIndex).normalized;
  }

  lookupAdditive(codeOrName: string): DetectedAdditive | null {
    const res = lookupAdditive(codeOrName);
    return res ? res.detected : null;
  }
}

export const defaultKnowledgeBase = new IngredientKnowledgeBase();
export const KNOWLEDGE_PACKAGE_INITIALIZED = true;

export type {
  IngredientKnowledge,
  AdditiveKnowledge,
  IngredientMatchResult,
  AdditiveMatchResult,
  MatchType
};

export {
  normalizeIngredient,
  normalizeKey,
  cleanRawIngredientText,
  lookupIngredient,
  lookupAdditive,
  lookupAdditiveByINS,
  getIngredientAliases,
  getAllIngredients,
  getAllAdditives
};

export * from './ingredients/index.js';
export * from './additives/index.js';
