import { describe, it, expect } from 'vitest';
import { parseIngredientsText, extractSubIngredients } from '../src/ingredients/ingredientParser.js';
import { tokenizeIngredientList } from '../src/ingredients/tokenizer.js';

describe('Ingredient List Parser & Tokenizer', () => {
  it('should split tokens while respecting nested parentheses', () => {
    const raw = 'Refined Wheat Flour (Maida) (67%), Refined Palm Oil, Choco Creme (Sugar, Hydrogenated Vegetable Fat, Cocoa Solids (2%)), Iodised Salt';
    const tokens = tokenizeIngredientList(raw);

    expect(tokens).toHaveLength(4);
    expect(tokens[0]).toBe('Refined Wheat Flour (Maida) (67%)');
    expect(tokens[1]).toBe('Refined Palm Oil');
    expect(tokens[2]).toBe('Choco Creme (Sugar, Hydrogenated Vegetable Fat, Cocoa Solids (2%))');
    expect(tokens[3]).toBe('Iodised Salt');
  });

  it('should extract compound sub-ingredients from parenthetical clauses', () => {
    const token = 'Choco Creme (Sugar, Refined Palm Oil, Cocoa Solids)';
    const extracted = extractSubIngredients(token);

    expect(extracted.primaryName).toBe('Choco Creme');
    expect(extracted.subIngredients).toBeDefined();
    expect(extracted.subIngredients).toHaveLength(3);
    expect(extracted.subIngredients![0]).toBe('Sugar');
    expect(extracted.subIngredients![1]).toBe('Refined Palm Oil');
    expect(extracted.subIngredients![2]).toBe('Cocoa Solids');
  });

  it('should strip INGREDIENTS prefix and ALLERGEN suffix', () => {
    const raw = `
      INGREDIENTS: Whole Wheat Flour (Atta) (53.3%), Refined Palm Oil, Sugar, Invert Sugar Syrup, Iodised Salt.
      ALLERGEN ADVICE: Contains Wheat (Gluten). May contain Milk and Soy.
    `;

    const result = parseIngredientsText(raw);
    expect(result.tokens).toHaveLength(5);
    expect(result.parsedIngredients[0].canonicalId).toBe('whole_wheat_flour');
    expect(result.parsedIngredients[0].positionIndex).toBe(0);
    expect(result.parsedIngredients[0].isWholeGrain).toBe(true);
    expect(result.parsedIngredients[1].canonicalId).toBe('palm_oil');
    expect(result.parsedIngredients[4].canonicalId).toBe('iodized_salt');
  });

  it('should extract position indices correctly for top ingredients', () => {
    const raw = 'Oats (100%)';
    const result = parseIngredientsText(raw);

    expect(result.parsedIngredients).toHaveLength(1);
    expect(result.parsedIngredients[0].canonicalId).toBe('oats');
    expect(result.parsedIngredients[0].positionIndex).toBe(0);
    expect(result.parsedIngredients[0].isWholeGrain).toBe(true);
  });
});
