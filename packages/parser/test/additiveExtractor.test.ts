import { describe, it, expect } from 'vitest';
import { extractAdditives } from '../src/additives/additiveExtractor.js';

describe('Additive / INS Code Extractor', () => {
  it('should extract explicit INS and E codes', () => {
    const raw = 'Contains Raising Agents (INS 500(ii), INS 503(ii)), Acidity Regulator (INS 330), Colour (INS 150d)';
    const result = extractAdditives(raw);

    const codes = result.detectedAdditives.map(a => a.insCode);
    expect(codes).toContain('INS 500');
    expect(codes).toContain('INS 503');
    expect(codes).toContain('INS 330');
    expect(codes).toContain('INS 150d');
  });

  it('should extract parenthesized codes within functional categories', () => {
    const raw = 'Emulsifiers [322, 471], Flavour Enhancers (627, 631), Preservative (211)';
    const result = extractAdditives(raw);

    const codes = result.detectedAdditives.map(a => a.insCode);
    expect(codes).toContain('INS 322');
    expect(codes).toContain('INS 471');
    expect(codes).toContain('INS 627');
    expect(codes).toContain('INS 631');
    expect(codes).toContain('INS 211');
  });

  it('should recognize chemical additive names directly in text', () => {
    const raw = 'Ingredients: Refined Flour, Sugar, Soya Lecithin, Citric Acid, Sodium Benzoate, Sunset Yellow FCF';
    const result = extractAdditives(raw);

    const names = result.detectedAdditives.map(a => a.canonicalName);
    expect(names.some(n => n.includes('Lecithin'))).toBe(true);
    expect(names.some(n => n.includes('Citric Acid'))).toBe(true);
    expect(names.some(n => n.includes('Sodium Benzoate'))).toBe(true);
    expect(names.some(n => n.includes('Sunset Yellow'))).toBe(true);
  });

  it('should deduplicate identical additive matches', () => {
    const raw = 'INS 500(ii), Sodium Bicarbonate, INS 500, Baking Soda';
    const result = extractAdditives(raw);

    const matches500 = result.detectedAdditives.filter(a => a.insCode === 'INS 500');
    expect(matches500).toHaveLength(1);
  });
});
