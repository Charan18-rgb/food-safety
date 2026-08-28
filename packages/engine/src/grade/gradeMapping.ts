import { FoodGrade } from '@foodgrade/shared-types';
import { GradeThresholds, DEFAULT_SCORING_CONFIG_V1 } from '../config/scoringConfigV1.js';

/**
 * Clamps any numeric value strictly to [0, 100]
 */
export function clampScore(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

/**
 * Deterministically maps a 0–100 score to FoodGrade (A, B, C, D, E)
 * A: [A_threshold, 100]
 * B: [B_threshold, A_threshold)
 * C: [C_threshold, B_threshold)
 * D: [D_threshold, C_threshold)
 * E: [0, D_threshold)
 */
export function getGrade(
  score: number,
  thresholds: GradeThresholds = DEFAULT_SCORING_CONFIG_V1.gradeThresholds
): FoodGrade {
  const clamped = clampScore(score);
  if (clamped >= thresholds.A) return 'A';
  if (clamped >= thresholds.B) return 'B';
  if (clamped >= thresholds.C) return 'C';
  if (clamped >= thresholds.D) return 'D';
  return 'E';
}
