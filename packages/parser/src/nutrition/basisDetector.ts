import { NutritionBasis, ServingInfo } from '@foodgrade/shared-types';

export interface BasisDetectionResult {
  basis: NutritionBasis;
  servingInfo?: ServingInfo;
  confidence: number;
  evidence: string;
}

/**
 * Detects the nutrition basis (per 100g, per 100ml, or per serving)
 * and extracts serving size metadata if declared on the label.
 */
export function detectNutritionBasis(text: string, defaultBasis: NutritionBasis = 'per_100g'): BasisDetectionResult {
  if (!text) {
    return {
      basis: defaultBasis,
      confidence: 0.5,
      evidence: 'Default fallback (empty text)'
    };
  }

  // Check 1: Liquid 100ml basis
  const per100mlRegex = /\b(per\s*100\s*m[lL]|100\s*m[lL]\b|per\s*100ml|100\s*ml\s*approx)/i;
  const match100ml = text.match(per100mlRegex);
  if (match100ml) {
    const servingInfo = extractServingInfo(text);
    return {
      basis: 'per_100ml',
      servingInfo,
      confidence: 0.95,
      evidence: match100ml[0]
    };
  }

  // Check 2: Solid 100g basis
  const per100gRegex = /\b(per\s*100\s*g(?:ms?|m)?|100\s*g(?:ms?|m)?\b|per\s*100g|100\s*g\s*approx)/i;
  const match100g = text.match(per100gRegex);
  if (match100g) {
    const servingInfo = extractServingInfo(text);
    return {
      basis: 'per_100g',
      servingInfo,
      confidence: 0.95,
      evidence: match100g[0]
    };
  }

  // Check 3: Explicit per serving/portion only
  const perServingRegex = /\b(per\s*serve(?:ing)?|per\s*portion|per\s*pack(?:et)?)\b/i;
  const matchServing = text.match(perServingRegex);
  const servingInfo = extractServingInfo(text);

  if (matchServing) {
    return {
      basis: 'per_serving',
      servingInfo,
      confidence: 0.85,
      evidence: matchServing[0]
    };
  }

  // Default fallback
  return {
    basis: defaultBasis,
    servingInfo,
    confidence: 0.7,
    evidence: 'Inferred default basis'
  };
}

/**
 * Extracts serving size, serving unit, and servings per pack from label text.
 */
export function extractServingInfo(text: string): ServingInfo | undefined {
  let servingSize: number | undefined;
  let servingUnit: 'g' | 'ml' | 'piece' | 'pack' | 'portion' = 'g';
  let servingsPerPackage: number | undefined;

  // Match serving size (e.g. "Serving Size: 25 g", "Serve Size: 30g", "1 Serve = 25g")
  const sizeMatch = text.match(
    /\b(?:serving\s*size|serve\s*size|approx\.?\s*serving\s*size|1\s*serve\s*(?:is|=|:)?)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(g|gm|gms|ml|mL|piece|portion)/i
  );
  if (sizeMatch) {
    servingSize = parseFloat(sizeMatch[1]);
    const rawU = sizeMatch[2].toLowerCase();
    if (rawU === 'ml') servingUnit = 'ml';
    else if (rawU === 'piece') servingUnit = 'piece';
    else if (rawU === 'portion') servingUnit = 'portion';
    else servingUnit = 'g';
  }

  // Match servings per package (e.g. "Servings Per Container: 4", "Approx 10 Servings")
  const packageMatch = text.match(
    /\b(?:servings\s*per\s*(?:pack(?:age|et)?|container)|no\.?\s*of\s*serv(?:ings|es)|approx\.?\s*(\d+)\s*servings)\s*[:=-]?\s*(\d+)/i
  );
  if (packageMatch) {
    const rawCount = packageMatch[2] || packageMatch[1];
    if (rawCount) servingsPerPackage = parseInt(rawCount, 10);
  }

  if (servingSize !== undefined || servingsPerPackage !== undefined) {
    return {
      servingSize,
      servingUnit,
      servingsPerPackage
    };
  }

  return undefined;
}
