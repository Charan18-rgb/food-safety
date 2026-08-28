import { describe, it, expect } from 'vitest';
import {
  normalizeBarcode,
  validateBarcode,
  calculateGS1CheckDigit,
  validateGS1CheckDigit
} from '../src/utils/barcodeNormalizer.js';
import { InvalidBarcodeError } from '../src/errors.js';

describe('Barcode Normalization & GS1 Validation', () => {
  it('should trim and strip dashes, spaces, and dots from barcode', () => {
    expect(normalizeBarcode(' 890-1063-012219 ')).toBe('8901063012219');
    expect(normalizeBarcode('890.1063.012219')).toBe('8901063012219');
    expect(normalizeBarcode('890 1063 012219')).toBe('8901063012219');
  });

  it('should auto-pad 12-digit UPC-A to 13-digit EAN-13', () => {
    const upcA = '012345678905';
    expect(normalizeBarcode(upcA, true)).toBe('0012345678905');
  });

  it('should throw InvalidBarcodeError for non-numeric barcodes', () => {
    expect(() => normalizeBarcode('890ABC123456')).toThrow(InvalidBarcodeError);
  });

  it('should throw InvalidBarcodeError for barcodes with invalid lengths', () => {
    expect(() => normalizeBarcode('12345')).toThrow(InvalidBarcodeError);
    expect(() => normalizeBarcode('12345678901234567890')).toThrow(InvalidBarcodeError);
  });

  it('should calculate and validate GS1 standard Modulo-10 check digit', () => {
    // Parle-G: 890106301221 + check digit 9
    expect(calculateGS1CheckDigit('890106301221')).toBe(9);
    expect(validateGS1CheckDigit('8901063012219')).toBe(true);

    // Invalid check digit
    expect(validateGS1CheckDigit('8901063012218')).toBe(false);
  });

  it('should return safe BarcodeValidationResult from validateBarcode', () => {
    const validRes = validateBarcode('890-1063-012219');
    expect(validRes.isValid).toBe(true);
    expect(validRes.normalized).toBe('8901063012219');
    expect(validRes.format).toBe('EAN-13');

    const invalidRes = validateBarcode('abc');
    expect(invalidRes.isValid).toBe(false);
    expect(invalidRes.error).toBeDefined();
  });
});
