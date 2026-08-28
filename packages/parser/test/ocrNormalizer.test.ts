import { describe, it, expect } from 'vitest';
import { normalizeOCRText } from '../src/ocr/ocrNormalizer.js';

describe('OCR Text Normalizer', () => {
  it('should clean zero-width spaces and normalize whitespace', () => {
    const raw = 'Ingredients:\u200B  Refined  Wheat   Flour\u00A0(Maida)';
    const clean = normalizeOCRText(raw);
    expect(clean).toBe('Ingredients: Refined Wheat Flour (Maida)');
  });

  it('should rejoin hyphenated words split across line breaks', () => {
    const raw = 'Contains carbo-\nhydrates and in-\r\ngredients.';
    const clean = normalizeOCRText(raw);
    expect(clean).toBe('Contains carbohydrates and ingredients.');
  });

  it('should fix unit notations and broken percentage symbols', () => {
    const raw = 'Energy: 450 kcaI, Sodium: 850 mq, Volume: 200 mI, Whole Wheat 67 o/o';
    const clean = normalizeOCRText(raw);
    expect(clean).toContain('450 kcal');
    expect(clean).toContain('850 mg');
    expect(clean).toContain('200 ml');
    expect(clean).toContain('67%');
  });

  it('should correct letter O to zero in numerical contexts', () => {
    const raw = 'Per 1O0 g: Energy 45O kcal, Total Sugars: 2O.5 g, Fat: O.5 g';
    const clean = normalizeOCRText(raw);
    expect(clean).toContain('100 g');
    expect(clean).toContain('450 kcal');
    expect(clean).toContain('20.5 g');
    expect(clean).toContain('0.5 g');
  });

  it('should correct letter I/l to 1 and S to 5 in decimal contexts', () => {
    const raw = 'Protein: I.5 g, Fiber: 2.S g, Added Sugar: 1I.5 g, Sodium: B0 mg';
    const clean = normalizeOCRText(raw);
    expect(clean).toContain('1.5 g');
    expect(clean).toContain('2.5 g');
    expect(clean).toContain('11.5 g');
    expect(clean).toContain('80 mg');
  });

  it('should normalize INS and E-Code formatting', () => {
    const raw = 'Raising Agents (I N S 500(ii), 1NS 503(ii)), Acidity Regulator (E - 330)';
    const clean = normalizeOCRText(raw);
    expect(clean).toContain('INS 500(ii)');
    expect(clean).toContain('INS 503(ii)');
    expect(clean).toContain('E330');
  });

  it('should preserve regular alphabetical ingredient words untouched', () => {
    const raw = 'Oats, Sugar, Iodised Salt, Soya Lecithin, Butter, Cocoa Solids';
    const clean = normalizeOCRText(raw);
    expect(clean).toBe('Oats, Sugar, Iodised Salt, Soya Lecithin, Butter, Cocoa Solids');
  });
});
