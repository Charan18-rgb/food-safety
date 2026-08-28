
export function ScoreGauge({ score }: { score: number }) {
  // Simple horizontal score bar
  return (
    <div className="w-full flex items-center gap-3">
      <div className="text-3xl font-bold w-12 text-right">{Math.round(score)}</div>
      <div className="text-sm text-gray-500 font-medium">/ 100</div>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden ml-2">
        <div 
          className="h-full bg-gray-800 rounded-full transition-all duration-1000"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}
