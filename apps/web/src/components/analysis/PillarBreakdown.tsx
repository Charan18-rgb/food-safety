import { Card } from '../ui/Card';
import { PillarScores } from '@foodgrade/shared-types';

function PillarBar({ label, score }: { label: string, score: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-end">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold text-gray-900">{Math.round(score)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}

export function PillarBreakdown({ scores }: { scores: PillarScores }) {
  return (
    <Card className="space-y-4">
      <h3 className="text-base font-bold text-gray-900">Score Breakdown</h3>
      <PillarBar label="Nutritional Balance" score={scores.nutritionScore} />
      <PillarBar label="Ingredient Quality" score={scores.ingredientScore} />
      <PillarBar label="Additive / Processing" score={scores.additiveScore} />
    </Card>
  );
}
