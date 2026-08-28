import { Card } from '../ui/Card';
import { DetectedAdditive } from '@foodgrade/shared-types';

export function AdditivesCard({ additives }: { additives: DetectedAdditive[] }) {
  if (additives.length === 0) return null;

  return (
    <Card>
      <h3 className="text-base font-bold text-gray-900 mb-4">Additives</h3>
      <div className="flex flex-col gap-3">
        {additives.map((add, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">
              {add.insCode ? add.insCode : add.canonicalName}
              {add.canonicalName && add.insCode ? ` - ${add.canonicalName}` : ''}
            </span>
            {add.functionalClass && (
              <span className="text-xs text-gray-500 capitalize">
                {add.functionalClass.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
