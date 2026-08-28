import { clsx } from 'clsx';
import { FoodGrade } from '@foodgrade/shared-types';

export function GradeBadge({ grade, className }: { grade: FoodGrade; className?: string }) {
  const gradeColors: Record<FoodGrade, string> = {
    A: 'bg-green-500 text-white',
    B: 'bg-lime-500 text-white',
    C: 'bg-yellow-400 text-gray-900',
    D: 'bg-orange-500 text-white',
    E: 'bg-red-500 text-white',
  };

  const gradeText: Record<FoodGrade, string> = {
    A: 'Excellent',
    B: 'Good',
    C: 'Moderate',
    D: 'Poor',
    E: 'Very Poor',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center p-6 rounded-3xl', gradeColors[grade], className)}>
      <span className="text-6xl font-black mb-2">{grade}</span>
      <span className="text-lg font-bold uppercase tracking-wide">{gradeText[grade]}</span>
    </div>
  );
}
