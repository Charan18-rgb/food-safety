import { describe, it, expect } from 'vitest';
import { parseLabelText } from '../src/labelParser.js';
import { ProductInputSchema } from '@foodgrade/shared-types';

describe('Unified Label Parser Integration', () => {
  it('should parse a complete biscuit label OCR text into valid ProductInput', () => {
    const rawLabelOCR = `
      BRITANNIA GOOD DAY BUTTER COOKIES
      NUTRITIONAL INFORMATION
      Per 100 g Approx.
      Serving Size: 25 g
      Servings Per Pack: 4
      Energy 490 kcaI
      Protein 6.5 g
      Carbohydrate 68 g
      Total Sugars 22.O g
      Added Sugars 22 g
      Total Fat 22 g
      Saturated Fat 11 g
      Trans Fat O g
      Sodium 280 mq

      INGREDIENTS: Refined Wheat Flour (Maida) (57%), Sugar, Refined Palm Oil, Butter (2%), Invert Sugar Syrup, Milk Solids, Iodised Salt, Raising Agents (INS 500(ii), INS 503(ii)), Emulsifier (INS 322).
      ALLERGEN ADVICE: Contains Wheat, Milk, Soya.
    `;

    const parsed = parseLabelText(rawLabelOCR);

    // 1. Validate against ProductInputSchema
    const schemaValidation = ProductInputSchema.safeParse(parsed.productInput);
    expect(schemaValidation.success, `Schema parse failed: ${JSON.stringify(schemaValidation)}`).toBe(true);

    // 2. Assert parsed values
    expect(parsed.detectedBasis).toBe('per_100g');
    expect(parsed.productInput.nutrition.energyKcal.value).toBe(490);
    expect(parsed.productInput.nutrition.addedSugarsG.value).toBe(22);
    expect(parsed.productInput.nutrition.saturatedFatG.value).toBe(11);
    expect(parsed.productInput.nutrition.sodiumMg.value).toBe(280);
    expect(parsed.productInput.parsedIngredients[0].canonicalId).toBe('refined_wheat_flour');
    expect(parsed.productInput.parsedIngredients[0].isRefinedGrain).toBe(true);
    expect(parsed.productInput.detectedAdditives.map(a => a.insCode)).toContain('INS 500');
    expect(parsed.productInput.detectedAdditives.map(a => a.insCode)).toContain('INS 322');
  });

  it('should parse a soft drink label OCR text with per 100ml basis', () => {
    const rawDrinkOCR = `
      COCA-COLA ORIGINAL TASTE
      Nutrition Facts Per 100 ml:
      Energy: 44 kcal
      Carbohydrate: 10.6 g
      Total Sugars: 1O.6 g
      Added Sugars: 10.6 g
      Total Fat: 0 g
      Protein: 0 g
      Sodium: 15 mg

      INGREDIENTS: Carbonated Water, Sugar, Acidity Regulator (INS 338), Colour (INS 150d), Flavours (Natural Flavouring Substances), Caffeine.
    `;

    const parsed = parseLabelText(rawDrinkOCR);
    expect(parsed.detectedBasis).toBe('per_100ml');
    expect(parsed.productInput.nutrition.addedSugarsG.value).toBe(10.6);
    expect(parsed.productInput.detectedAdditives.map(a => a.insCode)).toContain('INS 338');
    expect(parsed.productInput.detectedAdditives.map(a => a.insCode)).toContain('INS 150d');

    const schemaValidation = ProductInputSchema.safeParse(parsed.productInput);
    expect(schemaValidation.success).toBe(true);
  });
});
