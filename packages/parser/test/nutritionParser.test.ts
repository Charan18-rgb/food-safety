import { describe, it, expect } from 'vitest';
import { parseNutritionText } from '../src/nutrition/nutritionParser.js';

describe('Nutrition Table Parser & Robustness', () => {
  it('should detect per 100g basis and serving size', () => {
    const table = `
      NUTRITIONAL INFORMATION
      Per 100 g Approx.
      Serving Size: 25 g
      Servings Per Pack: 4
      Energy 454 kcal
      Protein 6.5 g
      Carbohydrate 78 g
      Total Sugars 25.5 g
      Added Sugars 25.5 g
      Total Fat 13 g
      Saturated Fat 6.5 g
      Trans Fat 0 g
      Sodium 280 mg
    `;

    const result = parseNutritionText(table);
    expect(result.basis).toBe('per_100g');
    expect(result.servingInfo?.servingSize).toBe(25);
    expect(result.servingInfo?.servingsPerPackage).toBe(4);
    expect(result.nutrition.energyKcal.value).toBe(454);
    expect(result.nutrition.proteinG.value).toBe(6.5);
    expect(result.nutrition.carbohydratesG.value).toBe(78);
    expect(result.nutrition.totalSugarsG.value).toBe(25.5);
    expect(result.nutrition.addedSugarsG.value).toBe(25.5);
    expect(result.nutrition.totalFatG.value).toBe(13);
    expect(result.nutrition.saturatedFatG.value).toBe(6.5);
    expect(result.nutrition.transFatG.value).toBe(0);
    expect(result.nutrition.sodiumMg.value).toBe(280);
    expect(result.missingMandatoryFields).toHaveLength(0);
  });

  it('should detect per 100ml basis for liquid beverages', () => {
    const table = `
      Nutrition Facts per 100 ml
      Energy: 44 kcal
      Carbohydrates: 10.6 g
      Total Sugars: 10.6 g
      Added Sugars: 10.6 g
      Fat: 0 g
      Protein: 0 g
      Sodium: 15 mg
    `;

    const result = parseNutritionText(table);
    expect(result.basis).toBe('per_100ml');
    expect(result.nutrition.energyKcal.value).toBe(44);
    expect(result.nutrition.addedSugarsG.value).toBe(10.6);
  });

  it('should accurately handle "< 0.1", "< 0.5", and "less than 0.1" threshold limits', () => {
    const table = `
      Per 100 g:
      Energy: 380 kcal
      Carbohydrate: 85 g
      Total Sugars: < 0.5 g
      Added Sugars: 0 g
      Trans Fat: < 0.1 g
      Cholesterol: less than 1 mg
      Sodium: < 5 mg
    `;

    const result = parseNutritionText(table);
    expect(result.nutrition.totalSugarsG.value).toBe(0.5);
    expect(result.nutrition.totalSugarsG.source).toBe('< 0.5 g');
    expect(result.nutrition.transFatG.value).toBe(0.1);
    expect(result.nutrition.transFatG.source).toBe('< 0.1 g');
    expect(result.nutrition.cholesterolMg.value).toBe(1);
    expect(result.nutrition.cholesterolMg.source).toBe('< 1 mg');
    expect(result.nutrition.sodiumMg.value).toBe(5);
  });

  it('should parse literal "Nil", "Zero", "None", "ND" as declared zero values', () => {
    const table = `
      Per 100 g:
      Energy: 380 kcal
      Carbohydrate: 85 g
      Total Sugars: Nil
      Added Sugars: 0 g
      Trans Fat: None
      Cholesterol: ND
      Sodium: Traces
    `;

    const result = parseNutritionText(table);
    expect(result.nutrition.totalSugarsG.value).toBe(0);
    expect(result.nutrition.addedSugarsG.value).toBe(0);
    expect(result.nutrition.transFatG.value).toBe(0);
    expect(result.nutrition.cholesterolMg.value).toBe(0);
    expect(result.nutrition.sodiumMg.value).toBe(0);
  });

  it('should parse multi-column tables with % RDA correctly', () => {
    const table = `
      Typical Values | Per 100 g | Per Serve (30g) | % RDA Per Serve
      Energy (kcal) | 454 | 136.2 | 6.8%
      Protein (g) | 7.0 | 2.1 | -
      Carbohydrate (g) | 68.0 | 20.4 | -
      Total Sugars (g) | 22.0 | 6.6 | -
      Added Sugars (g) | 22.0 | 6.6 | 13.2%
      Total Fat (g) | 17.0 | 5.1 | 7.6%
      Saturated Fat (g) | 8.0 | 2.4 | 10.9%
      Sodium (mg) | 320 | 96 | 4.8%
    `;

    const result = parseNutritionText(table);
    expect(result.nutrition.energyKcal.value).toBe(454);
    expect(result.nutrition.proteinG.value).toBe(7.0);
    expect(result.nutrition.addedSugarsG.value).toBe(22.0);
    expect(result.nutrition.totalFatG.value).toBe(17.0);
    expect(result.nutrition.saturatedFatG.value).toBe(8.0);
    expect(result.nutrition.sodiumMg.value).toBe(320);
  });

  it('should derive salt from sodium when only sodium is given', () => {
    const table = `
      Per 100g:
      Energy: 400 kcal
      Sodium: 800 mg
    `;

    const result = parseNutritionText(table);
    expect(result.nutrition.sodiumMg.value).toBe(800);
    expect(result.nutrition.saltG.value).toBe(2); // 800 / 400 = 2.0g salt
    expect(result.nutrition.saltG.status).toBe('inferred');
  });

  it('should handle comma decimals from European/Indian formatting', () => {
    const table = `
      Energy: 420,5 kcal
      Protein: 7,8 g
      Fat: 14,2 g
      Sodium: 350,0 mg
    `;

    const result = parseNutritionText(table);
    expect(result.nutrition.energyKcal.value).toBe(420.5);
    expect(result.nutrition.proteinG.value).toBe(7.8);
    expect(result.nutrition.totalFatG.value).toBe(14.2);
    expect(result.nutrition.sodiumMg.value).toBe(350);
  });
});
