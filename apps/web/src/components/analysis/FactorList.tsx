import { Card } from '../ui/Card';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { ScoringFactor } from '@foodgrade/shared-types';

export function FactorList({ positives, warnings }: { positives: ScoringFactor[], warnings: ScoringFactor[] }) {
  if (positives.length === 0 && warnings.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4">
      {positives.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-green-700 mb-2 uppercase tracking-wide">Positives</h3>
          <ul className="space-y-2">
            {positives.map((p) => (
              <li key={p.id} className="flex flex-col text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="font-bold">{p.title}</span>
                </div>
                <span className="ml-6 text-gray-500 text-xs">{p.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className={positives.length > 0 ? 'pt-4 border-t border-gray-100' : ''}>
          <h3 className="text-sm font-bold text-orange-700 mb-2 uppercase tracking-wide">Concerns</h3>
          <ul className="space-y-2">
            {warnings.map((w) => (
              <li key={w.id} className="flex flex-col text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <span className="font-bold">{w.title}</span>
                </div>
                <span className="ml-6 text-gray-500 text-xs">{w.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
