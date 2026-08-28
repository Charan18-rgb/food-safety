export interface OCRNormalizationOptions {
  aggressive?: boolean;
  preserveLineBreaks?: boolean;
}

/**
 * Context-aware OCR text normalizer.
 * Cleans formatting noise, fixes common OCR character confusions in numerical contexts,
 * and standardizes unit and additive notations without mutating legitimate word characters.
 */
export function normalizeOCRText(rawText: string, _options: OCRNormalizationOptions = {}): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Remove zero-width characters and unusual Unicode control codes
  text = text.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');

  // 2. Unify curly quotes, brackets, and colons
  text = text.replace(/[‘’]/g, "'");
  text = text.replace(/[“”]/g, '"');
  text = text.replace(/[\uff1a]/g, ':');
  text = text.replace(/[\uff0c]/g, ',');
  text = text.replace(/[\uff08]/g, '(').replace(/[\uff09]/g, ')');
  text = text.replace(/[\u3010\[]/g, '[').replace(/[\u3011\]]/g, ']');

  // 3. Rejoin hyphenated words split across line breaks (e.g. "carbo- \n hydrates" -> "carbohydrates")
  text = text.replace(/([a-zA-Z]+)-\s*[\r\n]+\s*([a-zA-Z]+)/g, '$1$2');

  // 4. Standardize broken percentage signs: "o/o", "0/0", " %"
  text = text.replace(/(\d+)\s*(o\/o|0\/0)/gi, '$1%');
  text = text.replace(/(\d+)\s+%/g, '$1%');

  // 5. Fix common unit corruptions
  text = text.replace(/(\d+(\.\d+)?)\s*(mq|m9)\b/gi, '$1 mg');
  text = text.replace(/(\d+(\.\d+)?)\s*(mI|m1|MI)\b/g, '$1 ml');
  text = text.replace(/\b(kcaI|KcaL|k-cal|k\.cal|Kcal|KCAL)\b/g, 'kcal');
  text = text.replace(/(\d+(\.\d+)?)\s*(gms|gm)\b/gi, '$1 g');
  text = text.replace(/\b(kj|KJ|Kj)\b/g, 'kJ');

  // 6. Context-aware numerical character error correction
  // Handle decimal prefix/infix: "2O.5" -> "20.5", "1I.5" -> "11.5", "O.5" -> "0.5", "I.5" -> "1.5"
  text = text.replace(/\b(\d+)[Oo](\.\d+)/g, '$10$2');
  text = text.replace(/\b(\d+)[Il|](\.\d+)/g, '$11$2');
  text = text.replace(/\b[Oo](\.\d+)\b/g, '0$1');
  text = text.replace(/\b[Il|](\.\d+)\b/g, '1$1');
  text = text.replace(/\b(\d+\.)[Oo]\b/g, '$10');
  text = text.replace(/\b(\d+\.)[Il|]\b/g, '$11');

  // Integers in front of units or flanked by digits
  text = text.replace(/\b([O0-9]+)[Oo]([0-9]+)\b/g, '$10$2');
  text = text.replace(/\b([1-9])[Oo](0|\s*(g|mg|kcal|ml|kJ|%))\b/gi, '$10$2');
  text = text.replace(/\b(\d+)[Oo]\s*(g|mg|kcal|ml|kJ|%)\b/gi, '$10 $2');

  text = text.replace(/\b[Il|](0|\s*(g|mg|kcal|ml|kJ|%))\b/gi, '1$1');
  text = text.replace(/\b([1-9])[Il|]\s*(g|mg|kcal|ml|kJ|%)\b/gi, '$11 $2');

  // Replace 'S'/'s' with '5' in decimal numerical positions (e.g. "2.S g" -> "2.5 g")
  text = text.replace(/(\d+\.)[Ss](\s*(g|mg|kcal|ml|kJ|%|\b))/g, '$15$2');
  text = text.replace(/:\s*[Ss](\.\d+)/g, ': 5$1');

  // Replace 'B' with '8' in numerical unit contexts (e.g. "B.5 g" -> "8.5 g", "B0 mg" -> "80 mg")
  text = text.replace(/\bB(\.\d+\s*(g|mg|kcal|ml|kJ|%))/g, '8$1');
  text = text.replace(/\bB(0\s*(g|mg|kcal|ml|kJ|%))/g, '8$1');

  // 7. Standardize INS / E-Code additive formatting
  text = text.replace(/\b(I\s*N\s*S|1NS|iNS)\s*([0-9]+)/gi, 'INS $2');
  text = text.replace(/\bE\s*-\s*([0-9]+)/gi, 'E$1');

  // 8. Fix multiple spaces and trim lines
  text = text
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line, i, arr) => {
      if (!line && i > 0 && !arr[i - 1]) return false;
      return true;
    })
    .join('\n');

  return text.trim();
}
