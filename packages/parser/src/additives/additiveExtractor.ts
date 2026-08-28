import { DetectedAdditive } from '@foodgrade/shared-types';
import {
  lookupAdditive,
  lookupAdditiveByINS,
  getAllAdditives,
  AdditiveKnowledge
} from '@foodgrade/knowledge';
import { ParsedAdditivesResult, ParseOptions, ParserWarning } from '../types.js';
import { normalizeOCRText } from '../ocr/ocrNormalizer.js';

function toDetectedAdditive(add: AdditiveKnowledge): DetectedAdditive {
  return {
    insCode: add.insCode,
    canonicalName: add.canonicalName,
    functionalClass: add.functionalClass,
    riskCategory: add.riskCategory,
    neutralExplanation: add.neutralExplanation,
    fssaiMaxPermittedNote: add.fssaiMaxPermittedNote
  };
}

/**
 * Extracts and normalizes food additives and INS/E-codes from label text.
 */
export function extractAdditives(rawText: string, options: ParseOptions = {}): ParsedAdditivesResult {
  const warnings: ParserWarning[] = [];
  const text = options.normalizeOCR !== false ? normalizeOCRText(rawText) : rawText;

  const detectedMap = new Map<string, DetectedAdditive>();
  const extractedCodes: string[] = [];

  // 1. Match explicit INS / E code patterns (e.g. "INS 500(ii)", "INS 150d", "E 330", "E-471")
  const insRegex = /\b(?:INS|E)\s*[-:]?\s*([0-9]{3,4}[a-z]?(?:\s*\([a-z0-9ivx]+\))?)/gi;
  let match: RegExpExecArray | null;

  while ((match = insRegex.exec(text)) !== null) {
    const rawCode = match[1].replace(/\s+/g, '');
    extractedCodes.push(rawCode);

    const insLookup = lookupAdditiveByINS(rawCode);
    if (insLookup) {
      const detected = toDetectedAdditive(insLookup);
      detectedMap.set(detected.insCode, detected);
    } else {
      const queryLookup = lookupAdditive(rawCode);
      if (queryLookup) {
        detectedMap.set(queryLookup.detected.insCode, queryLookup.detected);
      } else {
        warnings.push({
          code: 'UNRECOGNIZED_ADDITIVE_CODE',
          message: `Additive code "INS ${rawCode}" was detected but not found in the additive registry.`,
          rawSnippet: match[0]
        });
      }
    }
  }

  // 2. Match parenthesized numeric codes within functional categories
  // e.g. "Raising Agents (500(ii), 503(ii))", "Emulsifiers [322, 471]", "Flavor Enhancers (627, 631)"
  const functionalClauseRegex = /\b(?:raising\s*agents?|emulsifiers?|acidity\s*regulators?|flavou?r\s*enhancers?|colou?rs?|preservatives?|stabilizers?|antioxidants?|sweeteners?)\s*[:=-]?\s*[\(\[]\s*([^\)\]]+)[\)\]]/gi;
  let clauseMatch: RegExpExecArray | null;

  while ((clauseMatch = functionalClauseRegex.exec(text)) !== null) {
    const insideParen = clauseMatch[1];
    const subCodes = insideParen.split(/[,&/]/).map(s => s.trim());

    for (const subCode of subCodes) {
      const codeMatch = subCode.match(/\b([0-9]{3,4}[a-z]?(?:\([a-z0-9ivx]+\))?)\b/i);
      if (codeMatch) {
        const num = codeMatch[1];
        extractedCodes.push(num);
        const insLookup = lookupAdditiveByINS(num);
        if (insLookup) {
          const detected = toDetectedAdditive(insLookup);
          detectedMap.set(detected.insCode, detected);
        } else {
          const queryLookup = lookupAdditive(num);
          if (queryLookup) {
            detectedMap.set(queryLookup.detected.insCode, queryLookup.detected);
          }
        }
      }
    }
  }

  // 3. Match known additive chemical names mentioned directly in text
  const allKnown = getAllAdditives();
  const lowerText = text.toLowerCase();

  for (const additive of allKnown) {
    if (detectedMap.has(additive.insCode)) continue;

    for (const alias of additive.aliases) {
      if (alias.length > 4 && !/^\d+$/.test(alias)) {
        if (lowerText.includes(alias.toLowerCase())) {
          const lookupRes = lookupAdditive(alias);
          if (lookupRes) {
            detectedMap.set(lookupRes.detected.insCode, lookupRes.detected);
            break;
          }
        }
      }
    }
  }

  const detectedAdditives = Array.from(detectedMap.values());
  const confidence = extractedCodes.length > 0
    ? Math.max(0.6, Math.min(1.0, (detectedAdditives.length / extractedCodes.length) * 0.9 + 0.1))
    : 0.9;

  return {
    detectedAdditives,
    extractedCodes,
    warnings,
    confidence: Math.round(confidence * 100) / 100
  };
}
