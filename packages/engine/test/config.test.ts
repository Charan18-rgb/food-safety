import { describe, it, expect } from 'vitest';
import {
  validateScoringConfig,
  DEFAULT_SCORING_CONFIG_V1,
  ScoringConfigV1
} from '../src/index.js';

describe('Scoring Configuration Validation', () => {
  it('passes on valid default configuration', () => {
    expect(() => validateScoringConfig(DEFAULT_SCORING_CONFIG_V1)).not.toThrow();
  });

  it('rejects weights that do not sum to 1.0', () => {
    const invalidConfig: ScoringConfigV1 = {
      ...DEFAULT_SCORING_CONFIG_V1,
      weights: {
        nutrition: 0.5,
        ingredient: 0.5,
        additive: 0.5 // Sum = 1.5
      }
    };
    expect(() => validateScoringConfig(invalidConfig)).toThrow(/sum to 1.0/);
  });

  it('rejects negative weights', () => {
    const invalidConfig: ScoringConfigV1 = {
      ...DEFAULT_SCORING_CONFIG_V1,
      weights: {
        nutrition: 1.2,
        ingredient: -0.2,
        additive: 0.0
      }
    };
    expect(() => validateScoringConfig(invalidConfig)).toThrow(/non-negative/);
  });

  it('rejects inverted or non-descending grade thresholds', () => {
    const invalidConfig: ScoringConfigV1 = {
      ...DEFAULT_SCORING_CONFIG_V1,
      gradeThresholds: {
        A: 70,
        B: 80, // Inverted!
        C: 50,
        D: 35
      }
    };
    expect(() => validateScoringConfig(invalidConfig)).toThrow(/descending/);
  });
});
