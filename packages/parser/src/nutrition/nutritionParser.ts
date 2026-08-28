import {
  NutritionProfile,
  NutrientValue,
  NutrientUnit,
  createNutrientValue
} from '@foodgrade/shared-types';
import { ParsedNutritionResult, ParseOptions, ParserWarning } from '../types.js';
import { normalizeOCRText } from '../ocr/ocrNormalizer.js';
import { detectNutritionBasis } from './basisDetector.js';
import {
  normalizeNutrientValue,
  deriveSodiumFromSalt,
  deriveSaltFromSodium
} from './unitNormalizer.js';

export const ALL_NUTRIENT_KEYS: { key: keyof Omit<NutritionProfile, 'basis'>; unit: NutrientUnit }[] = [
  { key: 'energyKcal', unit: 'kcal' },
  { key: 'carbohydratesG', unit: 'g' },
  { key: 'totalSugarsG', unit: 'g' },
  { key: 'addedSugarsG', unit: 'g' },
  { key: 'dietaryFiberG', unit: 'g' },
  { key: 'proteinG', unit: 'g' },
  { key: 'totalFatG', unit: 'g' },
  { key: 'saturatedFatG', unit: 'g' },
  { key: 'transFatG', unit: 'g' },
  { key: 'cholesterolMg', unit: 'mg' },
  { key: 'sodiumMg', unit: 'mg' },
  { key: 'saltG', unit: 'g' }
];

export const MANDATORY_NUTRIENTS_LIST: (keyof Omit<NutritionProfile, 'basis'>)[] = [
  'energyKcal',
  'proteinG',
  'carbohydratesG',
  'totalSugarsG',
  'addedSugarsG',
  'totalFatG',
  'saturatedFatG',
  'transFatG',
  'sodiumMg'
];

interface NutrientPattern {
  key: keyof Omit<NutritionProfile, 'basis'>;
  regex: RegExp;
  targetType: 'energy' | 'mass_g' | 'mass_mg';
  priority: number;
}

const NUTRIENT_PATTERNS: NutrientPattern[] = [
  {
    key: 'addedSugarsG',
    regex: /(?:of\s*which\s*)?added\s*sugars?(?:\s*\(g\))?/i,
    targetType: 'mass_g',
    priority: 10
  },
  {
    key: 'totalSugarsG',
    regex: /(?:total\s*sugars?|sugars?(?:\s*\(g\))?|total\s*sugar)/i,
    targetType: 'mass_g',
    priority: 8
  },
  {
    key: 'saturatedFatG',
    regex: /(?:saturated\s*fatty\s*acids?|saturated\s*fat|sfa|sat\.?\s*fat)/i,
    targetType: 'mass_g',
    priority: 10
  },
  {
    key: 'transFatG',
    regex: /(?:trans\s*fatty\s*acids?|trans\s*fat|tfa|transfat)/i,
    targetType: 'mass_g',
    priority: 10
  },
  {
    key: 'dietaryFiberG',
    regex: /(?:dietary\s*fib(?:er|re)|fib(?:er|re))/i,
    targetType: 'mass_g',
    priority: 9
  },
  {
    key: 'cholesterolMg',
    regex: /(?:cholesterol|cholestrol)/i,
    targetType: 'mass_mg',
    priority: 9
  },
  {
    key: 'sodiumMg',
    regex: /\b(?:sodium|na)\b/i,
    targetType: 'mass_mg',
    priority: 9
  },
  {
    key: 'saltG',
    regex: /\b(?:salt|edible\s*common\s*salt)\b/i,
    targetType: 'mass_g',
    priority: 7
  },
  {
    key: 'energyKcal',
    regex: /(?:energy\s*value|energy|calories|caloric\s*value)/i,
    targetType: 'energy',
    priority: 6
  },
  {
    key: 'carbohydratesG',
    regex: /(?:total\s*carbohydrates?|carbohydrates?|carbs)/i,
    targetType: 'mass_g',
    priority: 6
  },
  {
    key: 'proteinG',
    regex: /(?:crude\s*protein|protein)/i,
    targetType: 'mass_g',
    priority: 6
  },
  {
    key: 'totalFatG',
    regex: /(?:total\s*fat|fat|crude\s*fat|lipids)/i,
    targetType: 'mass_g',
    priority: 5
  }
];

NUTRIENT_PATTERNS.sort((a, b) => b.priority - a.priority);

export interface ExtractedNutrientValue {
  value: number;
  unit: string;
  isZero: boolean;
  isLessThan: boolean;
  rawText?: string;
}

/**
 * Extracts nutrient values from table cells or text lines.
 * Robust to:
 * - "< 0.1", "< 0.5", "< 0.01", "less than 0.1" (preserves upper bound limit)
 * - "Nil", "Zero", "None", "ND", "Traces", "0", "0.0"
 * - Multi-column lines (per 100g, per serve, % RDA)
 * - Table bars "|", "~", colons, commas
 */
export function extractValueAndUnit(
  line: string,
  matchEndIndex: number,
  targetBasis: 'per_100g' | 'per_100ml' | 'per_serving' = 'per_100g'
): ExtractedNutrientValue | null {
  let afterMatch = line.substring(matchEndIndex).trim();

  // Strip table delimiters and noise characters safely without unescaped ranges
  afterMatch = afterMatch.replace(/^[:=|\s]+/, '').replace(/^(?:approx\.?|~)\s*/i, '').trim();

  // 1. Check for literal zero keywords (Nil, Zero, None, ND, Not Detected, Traces)
  if (/^(?:nil|zero|none|traces?|trace|nd|not\s*detected)\b/i.test(afterMatch)) {
    return { value: 0, unit: 'g', isZero: true, isLessThan: false, rawText: afterMatch };
  }

  // 2. Check for "< value" / "less than value" threshold expressions
  const lessThanMatch = afterMatch.match(/^(?:<|less\s*than|below|under)\s*(\d+(?:[.,]\d+)?)\s*(kcal|kj|g|gm|gms|mg|mcg|ug|%)?/i);
  if (lessThanMatch) {
    const rawNum = lessThanMatch[1].replace(',', '.');
    const parsedVal = parseFloat(rawNum);
    const rawUnit = lessThanMatch[2] || '';

    if (!isNaN(parsedVal)) {
      return {
        value: parsedVal,
        unit: rawUnit,
        isZero: parsedVal === 0,
        isLessThan: true,
        rawText: lessThanMatch[0]
      };
    }
  }

  // 3. Multi-column and Standard Number Matching
  // Extract all numeric candidates on the line
  const columnRegex = /(?:<|less\s*than\s*)?(\d+(?:[.,]\d+)?)\s*(kcal|kj|g|gm|gms|mg|mcg|ug|%)?/gi;
  const candidates: { num: number; unit: string; isPercent: boolean; isLessThan: boolean }[] = [];
  let colMatch: RegExpExecArray | null;

  while ((colMatch = columnRegex.exec(afterMatch)) !== null) {
    const rawNum = colMatch[1].replace(',', '.');
    const parsed = parseFloat(rawNum);
    const u = colMatch[2] || '';
    const isPercent = u === '%' || colMatch[0].includes('%');
    const isLessThan = colMatch[0].includes('<') || /less\s*than/i.test(colMatch[0]);

    if (!isNaN(parsed)) {
      candidates.push({ num: parsed, unit: u, isPercent, isLessThan });
    }
  }

  if (candidates.length > 0) {
    // Filter out pure % RDA columns when seeking raw mass/energy values
    const nonPercentCandidates = candidates.filter(c => !c.isPercent);
    const validCandidates = nonPercentCandidates.length > 0 ? nonPercentCandidates : candidates;

    let selected = validCandidates[0];

    // If basis is per_serving and we have multiple non-percent columns (e.g. Col 1 = Per 100g, Col 2 = Per Serve)
    if (targetBasis === 'per_serving' && validCandidates.length >= 2) {
      selected = validCandidates[1];
    }

    return {
      value: selected.num,
      unit: selected.unit,
      isZero: selected.num === 0,
      isLessThan: selected.isLessThan
    };
  }

  return null;
}

export function parseNutritionText(rawText: string, options: ParseOptions = {}): ParsedNutritionResult {
  const warnings: ParserWarning[] = [];
  const text = options.normalizeOCR !== false ? normalizeOCRText(rawText) : rawText;

  const basisResult = detectNutritionBasis(text, options.defaultBasis);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const profile: Partial<NutritionProfile> = {
    basis: basisResult.basis
  };

  const extractedFields: string[] = [];
  const unparsedLines: string[] = [];
  const matchedKeys = new Set<keyof Omit<NutritionProfile, 'basis'>>();

  for (const line of lines) {
    let lineMatched = false;

    for (const pattern of NUTRIENT_PATTERNS) {
      if (matchedKeys.has(pattern.key)) continue;

      const keywordMatch = line.match(pattern.regex);
      if (keywordMatch && keywordMatch.index !== undefined) {
        const matchEnd = keywordMatch.index + keywordMatch[0].length;
        const valResult = extractValueAndUnit(line, matchEnd, basisResult.basis);

        if (valResult !== null) {
          const normalized = normalizeNutrientValue(
            valResult.value,
            valResult.unit,
            pattern.targetType
          );

          const status = 'declared';
          const nutrientObj: NutrientValue = createNutrientValue(
            normalized.value,
            normalized.unit,
            status
          );

          if (valResult.isLessThan) {
            nutrientObj.source = `< ${valResult.value} ${normalized.unit}`;
          }

          profile[pattern.key] = nutrientObj;
          matchedKeys.add(pattern.key);
          extractedFields.push(pattern.key);
          lineMatched = true;
          break;
        }
      }
    }

    if (!lineMatched) {
      if (!/^(nutrition|approx|per 100|table|typical|values|information|nutritional)/i.test(line)) {
        unparsedLines.push(line);
      }
    }
  }

  // Cross-derivation: Sodium <-> Salt if one is missing and other has non-null value
  if (profile.sodiumMg && profile.sodiumMg.value !== null && (!profile.saltG || profile.saltG.value === null)) {
    profile.saltG = deriveSaltFromSodium(profile.sodiumMg.value);
    extractedFields.push('saltG');
    matchedKeys.add('saltG');
  } else if (profile.saltG && profile.saltG.value !== null && (!profile.sodiumMg || profile.sodiumMg.value === null)) {
    profile.sodiumMg = deriveSodiumFromSalt(profile.saltG.value);
    extractedFields.push('sodiumMg');
    matchedKeys.add('sodiumMg');
  }

  // Populate unextracted fields as missing NutrientValue objects
  for (const item of ALL_NUTRIENT_KEYS) {
    if (!profile[item.key]) {
      profile[item.key] = createNutrientValue(null, item.unit, 'missing');
    }
  }

  // Check missing mandatory FSSAI fields
  const missingMandatoryFields: string[] = [];
  for (const mandatoryKey of MANDATORY_NUTRIENTS_LIST) {
    const val = profile[mandatoryKey];
    if (!val || val.status === 'missing' || val.value === null) {
      missingMandatoryFields.push(mandatoryKey as string);
      warnings.push({
        code: 'MISSING_MANDATORY_NUTRIENT',
        message: `Mandatory nutrient "${String(mandatoryKey)}" was not found on the nutrition label.`,
        field: String(mandatoryKey)
      });
    }
  }

  // Compute extraction confidence
  const foundMandatory = MANDATORY_NUTRIENTS_LIST.length - missingMandatoryFields.length;
  const confidence = Math.min(
    1.0,
    Math.max(0.2, (foundMandatory / MANDATORY_NUTRIENTS_LIST.length) * 0.8 + (extractedFields.length > 5 ? 0.2 : 0))
  );

  return {
    nutrition: profile as NutritionProfile,
    basis: basisResult.basis,
    servingInfo: basisResult.servingInfo,
    extractedFields,
    missingMandatoryFields,
    unparsedLines,
    warnings,
    confidence: Math.round(confidence * 100) / 100
  };
}
