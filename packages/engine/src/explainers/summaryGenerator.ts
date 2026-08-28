import { FoodGrade, ScoringFactor } from '@foodgrade/shared-types';

export function generateSummaryExplanation(
  grade: FoodGrade,
  score: number,
  positives: ScoringFactor[],
  warnings: ScoringFactor[]
): string {
  const topPositives = positives
    .filter(p => p.pointsDelta > 0)
    .slice(0, 3)
    .map(p => p.title);

  const topWarnings = warnings
    .filter(w => w.pointsDelta < 0)
    .slice(0, 3)
    .map(w => w.title);

  let gradeDesc = '';
  switch (grade) {
    case 'A':
      gradeDesc = 'Nutrient-rich formulation with wholesome ingredients and minimal processing.';
      break;
    case 'B':
      gradeDesc = 'Good overall nutritional balance with minor refinement or sweeteners.';
      break;
    case 'C':
      gradeDesc = 'Moderate nutritional quality with noticeable added sugar, fat, sodium, or refinement.';
      break;
    case 'D':
      gradeDesc = 'High in added sugar, saturated fat, refined flours (Maida), or additive load.';
      break;
    case 'E':
      gradeDesc = 'Ultra-processed profile with high added sugars, industrial fats, and synthetic additives.';
      break;
  }

  let summary = `Rated Grade ${grade} (${score}/100). ${gradeDesc}`;

  if (topPositives.length > 0) {
    summary += ` Positives: ${topPositives.join(', ')}.`;
  }

  if (topWarnings.length > 0) {
    summary += ` Key considerations: ${topWarnings.join(', ')}.`;
  }

  return summary;
}
