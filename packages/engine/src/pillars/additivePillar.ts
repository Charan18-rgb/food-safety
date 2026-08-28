import { DetectedAdditive, ScoringFactor } from '@foodgrade/shared-types';
import { AdditivePillarConfig } from '../config/scoringConfigV1.js';
import { clampScore } from '../grade/gradeMapping.js';

export interface AdditivePillarResult {
  score: number;
  rawScore: number;
  factors: ScoringFactor[];
}

/**
 * Evaluates the Additive Load & Processing Pillar (Pillar 3)
 */
export function evaluateAdditivePillar(
  additives: DetectedAdditive[],
  config: AdditivePillarConfig
): AdditivePillarResult {
  const factors: ScoringFactor[] = [];
  let currentScore = config.baseline;
  const seenCodes = new Set<string>();

  if (!additives || additives.length === 0) {
    factors.push({
      id: 'no_additives_detected',
      title: 'No Artificial Additives Detected',
      description: 'No synthetic colours, preservatives, or artificial sweeteners detected on the label.',
      pillar: 'additive',
      impact: 'positive',
      pointsDelta: 0
    });
    return {
      score: 100,
      rawScore: 100,
      factors
    };
  }

  for (const add of additives) {
    const code = add.insCode.toUpperCase().trim();
    if (config.deduplicateSameCode && seenCodes.has(code)) {
      continue;
    }
    seenCodes.add(code);

    let penalty = 0;
    let severity: 'low' | 'moderate' | 'high' = 'low';

    switch (add.functionalClass) {
      case 'artificial_sweetener':
        penalty = config.penalties.artificialSweetener;
        severity = 'high';
        break;
      case 'synthetic_colour':
        penalty = config.penalties.syntheticColour;
        severity = 'high';
        break;
      case 'flavour_enhancer':
        penalty = config.penalties.flavourEnhancer;
        severity = 'moderate';
        break;
      case 'preservative':
        penalty = config.penalties.preservative;
        severity = 'moderate';
        break;
      case 'emulsifier_stabilizer':
        if (add.riskCategory === 'neutral') {
          penalty = config.penalties.neutral;
        } else {
          penalty = config.penalties.emulsifierStabilizer;
          severity = 'low';
        }
        break;
      case 'acidity_regulator':
      case 'antioxidant':
        if (add.riskCategory === 'processing_indicator') {
          penalty = config.penalties.otherIndustrial;
          severity = 'low';
        } else {
          penalty = config.penalties.neutral;
        }
        break;
      default:
        penalty = add.riskCategory === 'neutral' ? 0 : config.penalties.otherIndustrial;
        break;
    }

    if (penalty > 0) {
      currentScore -= penalty;
      factors.push({
        id: `additive_${code.replace(/[^A-Z0-9]/g, '_')}`,
        title: `Contains ${add.canonicalName} (${add.insCode})`,
        description: `${add.neutralExplanation} (-${penalty} pts additive assessment deduction).`,
        pillar: 'additive',
        impact: 'warning',
        severity,
        pointsDelta: -penalty,
        evidenceRef: add.fssaiMaxPermittedNote || 'FSSAI Food Additive Standard'
      });
    } else {
      factors.push({
        id: `additive_neutral_${code.replace(/[^A-Z0-9]/g, '_')}`,
        title: `Contains ${add.canonicalName} (${add.insCode})`,
        description: `${add.neutralExplanation} (Standard benign processing aid, 0 deduction).`,
        pillar: 'additive',
        impact: 'neutral',
        pointsDelta: 0
      });
    }
  }

  const rawScore = currentScore;
  const score = clampScore(currentScore);

  return {
    score,
    rawScore,
    factors
  };
}
