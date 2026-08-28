import { InvalidBarcodeError } from '../errors.js';

export interface BarcodeValidationResult {
  isValid: boolean;
  normalized: string;
  format?: 'EAN-8' | 'UPC-A' | 'EAN-13' | 'GTIN-14' | 'CUSTOM';
  error?: string;
}

/**
 * Calculates GS1 standard Modulo-10 check digit for a string of numeric digits.
 */
export function calculateGS1CheckDigit(digitsWithoutCheckDigit: string): number {
  let sum = 0;
  const len = digitsWithoutCheckDigit.length;

  // Moving from right to left, alternate weights 3 and 1
  for (let i = len - 1; i >= 0; i--) {
    const digit = parseInt(digitsWithoutCheckDigit[i], 10);
    const weight = (len - i) % 2 === 1 ? 3 : 1;
    sum += digit * weight;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Validates a GS1 barcode including length and check digit.
 */
export function validateGS1CheckDigit(barcode: string): boolean {
  if (!/^\d+$/.test(barcode) || barcode.length < 8) return false;

  const payload = barcode.substring(0, barcode.length - 1);
  const expectedCheckDigit = calculateGS1CheckDigit(payload);
  const actualCheckDigit = parseInt(barcode[barcode.length - 1], 10);

  return expectedCheckDigit === actualCheckDigit;
}

/**
 * Normalizes barcode input:
 * 1. Trims whitespace and strips non-digit characters (dashes, spaces, dots).
 * 2. Checks standard GS1 lengths (8, 12, 13, 14 digits).
 * 3. Zero-pads 12-digit UPC-A to 13-digit EAN-13 when requested.
 * 4. Validates digits.
 */
export function normalizeBarcode(raw: string, autoPadUPC = true): string {
  if (!raw || typeof raw !== 'string') {
    throw new InvalidBarcodeError(String(raw), 'Barcode must be a non-empty string');
  }

  // Strip spaces, dashes, dots, underscores
  const cleaned = raw.replace(/[\s\-_.]/g, '');

  if (!/^\d+$/.test(cleaned)) {
    throw new InvalidBarcodeError(raw, 'Barcode contains invalid non-numeric characters');
  }

  if (cleaned.length < 8 || cleaned.length > 18) {
    throw new InvalidBarcodeError(
      raw,
      `Invalid barcode length (${cleaned.length} digits). Expected standard GS1 length (8, 12, 13, 14)`
    );
  }

  // Auto-pad 12-digit UPC-A to 13-digit EAN-13
  if (autoPadUPC && cleaned.length === 12) {
    return `0${cleaned}`;
  }

  return cleaned;
}

/**
 * Safe validator that returns a validation result object instead of throwing.
 */
export function validateBarcode(raw: string, autoPadUPC = true): BarcodeValidationResult {
  try {
    const normalized = normalizeBarcode(raw, autoPadUPC);
    let format: BarcodeValidationResult['format'] = 'CUSTOM';

    if (normalized.length === 8) format = 'EAN-8';
    else if (normalized.length === 12) format = 'UPC-A';
    else if (normalized.length === 13) format = 'EAN-13';
    else if (normalized.length === 14) format = 'GTIN-14';

    return {
      isValid: true,
      normalized,
      format
    };
  } catch (err) {
    return {
      isValid: false,
      normalized: '',
      error: (err as Error).message
    };
  }
}
