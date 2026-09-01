/**
 * Mobile Smoke Test — Milestone 1
 * Verifies that all platform-neutral @foodgrade/* packages resolve correctly
 * through the pnpm workspace from the apps/mobile context.
 * Does NOT test React Native UI components (requires native runtime).
 */
import { describe, it, expect } from 'vitest';
import type { ProductInput } from '@foodgrade/shared-types';

const missingNutrient = (unit: 'g' | 'mg' | 'kcal' = 'g') => ({
  value: null as null,
  status: 'missing' as const,
  unit,
});

const testProduct: ProductInput = {
  productName: 'Test Water',
  nutrition: {
    basis: 'per_100g',
    energyKcal: missingNutrient('kcal'),
    carbohydratesG: missingNutrient(),
    totalSugarsG: missingNutrient(),
    addedSugarsG: missingNutrient(),
    dietaryFiberG: missingNutrient(),
    proteinG: missingNutrient(),
    totalFatG: missingNutrient(),
    saturatedFatG: missingNutrient(),
    transFatG: missingNutrient(),
    cholesterolMg: missingNutrient('mg'),
    sodiumMg: missingNutrient('mg'),
    saltG: missingNutrient(),
  },
  rawIngredientsText: 'water',
  parsedIngredients: [],
  detectedAdditives: [],
  provenance: {
    sourceType: 'user_manual',
    observationMode: 'directly_observed',
    rawConfidence: 1.0,
    missingMandatoryFields: [],
  },
};

describe('Mobile Milestone 1 — Shared Package Resolution', () => {
  it('resolves @foodgrade/shared-types FoodGrade type', async () => {
    const { FoodGradeSchema } = await import('@foodgrade/shared-types');
    const validGrade = FoodGradeSchema.safeParse('A');
    expect(validGrade.success).toBe(true);
    const invalidGrade = FoodGradeSchema.safeParse('Z');
    expect(invalidGrade.success).toBe(false);
  });

  it('resolves @foodgrade/engine and runs evaluateProduct', async () => {
    const { evaluateProduct } = await import('@foodgrade/engine');
    const result = evaluateProduct(testProduct);
    expect(result).toBeDefined();
    expect(['A', 'B', 'C', 'D', 'E']).toContain(result.grade);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.pillarScores).toBeDefined();
    expect(result.confidence).toBeDefined();
  });

  it('resolves @foodgrade/parser and exports the initialized flag', async () => {
    const { PARSER_PACKAGE_INITIALIZED } = await import('@foodgrade/parser');
    expect(PARSER_PACKAGE_INITIALIZED).toBe(true);
  });

  it('resolves @foodgrade/knowledge and exposes the knowledge base', async () => {
    const { defaultKnowledgeBase, KNOWLEDGE_PACKAGE_INITIALIZED } = await import('@foodgrade/knowledge');
    expect(KNOWLEDGE_PACKAGE_INITIALIZED).toBe(true);
    expect(defaultKnowledgeBase).toBeDefined();
    expect(typeof defaultKnowledgeBase.normalizeIngredient).toBe('function');
  });
});
