import { describe, it, expect } from 'vitest';
import { validateBarcodeChecksum, isFoodProduct, classifyDataQuality } from './barcodeUtils';

describe('Barcode Validation', () => {
  it('validates EAN-8', () => {
    expect(validateBarcodeChecksum('12345670')).toBe(true); // 1234567 -> sum: 7*3+6*1+5*3+4*1+3*3+2*1+1*3 = 21+6+15+4+9+2+3 = 60. 10 - 0 = 0.
    expect(validateBarcodeChecksum('12345671')).toBe(false);
  });
  
  it('validates EAN-13', () => {
    expect(validateBarcodeChecksum('5449000000996')).toBe(true); // Coke
    expect(validateBarcodeChecksum('8901030983177')).toBe(true); // Some Indian product
    expect(validateBarcodeChecksum('5449000000997')).toBe(false); // Invalid check digit
  });

  it('validates UPC-A', () => {
    expect(validateBarcodeChecksum('036000291452')).toBe(true);
    expect(validateBarcodeChecksum('036000291453')).toBe(false);
  });

  it('validates GTIN-14', () => {
    expect(validateBarcodeChecksum('10036000291459')).toBe(true);
    expect(validateBarcodeChecksum('10036000291450')).toBe(false);
  });

  it('rejects malformed strings', () => {
    expect(validateBarcodeChecksum('abc')).toBe(false);
    expect(validateBarcodeChecksum('1234')).toBe(false); // too short
    expect(validateBarcodeChecksum(null)).toBe(false);
  });
});

describe('Food Product Classification', () => {
  it('accepts explicit food categories', () => {
    expect(isFoodProduct('Snacks, Sweet snacks, Biscuits')).toBe(true);
    expect(isFoodProduct('Beverages, Carbonated drinks, Sodas')).toBe(true);
  });

  it('rejects non-food categories', () => {
    expect(isFoodProduct('Non-food products, Open beauty facts, Hair care')).toBe(false);
    expect(isFoodProduct('Pet food, Dogs, Dry dog food')).toBe(false);
    expect(isFoodProduct('Snacks, Cosmetics')).toBe(false); // Mixed -> rejects if contains excluded
  });

  it('rejects ambiguous/uncertain unlisted categories', () => {
    expect(isFoodProduct('Plastics, Tools')).toBe(false);
  });
});

describe('Data Quality Classification', () => {
  it('classifies analysis_ready', () => {
    const res = classifyDataQuality({
      code: '5449000000996',
      productName: 'Coke',
      ingredients: 'Carbonated water, sugar, color, acid, flavorings',
      nutrition: {
        'energy-kcal_100g': 42,
        'carbohydrates_100g': 10.6,
        'sugars_100g': 10.6,
        'sodium_100g': 0,
        'proteins_100g': 0
      }
    });
    expect(res).toBe('analysis_ready');
  });

  it('classifies partial_data when ingredients missing', () => {
    const res = classifyDataQuality({
      code: '5449000000996',
      productName: 'Coke',
      ingredients: '  ',
      nutrition: {
        'energy-kcal_100g': 42,
        'carbohydrates_100g': 10.6,
        'sugars_100g': 10.6,
        'sodium_100g': 0,
        'proteins_100g': 0
      }
    });
    expect(res).toBe('partial_data');
  });

  it('classifies identity_only when both missing', () => {
    const res = classifyDataQuality({
      code: '5449000000996',
      productName: 'Coke'
    });
    expect(res).toBe('identity_only');
  });

  it('classifies identity_only on invalid barcode', () => {
    const res = classifyDataQuality({
      code: '123',
      productName: 'Coke',
      ingredients: 'Water, sugar',
      nutrition: { 'energy-kcal_100g': 42, 'carbohydrates_100g': 10.6, 'sugars_100g': 10.6, 'sodium_100g': 0, 'proteins_100g': 0 }
    });
    expect(res).toBe('identity_only');
  });
});
