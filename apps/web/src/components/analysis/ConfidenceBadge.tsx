import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { DataQualityProvenance } from '@foodgrade/shared-types';
import { clsx } from 'clsx';

export function ConfidenceBadge({ provenance }: { provenance: DataQualityProvenance }) {
  const isHighConfidence = provenance.rawConfidence >= 0.8;
  const isLowConfidence = provenance.rawConfidence < 0.5;

  if (isHighConfidence) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
        <ShieldCheck className="w-4 h-4" />
        <span className="font-medium">Analysis Confidence: High</span>
      </div>
    );
  }

  return (
    <div className={clsx('flex items-start gap-2 text-sm px-3 py-2 rounded-lg', isLowConfidence ? 'text-red-700 bg-red-50' : 'text-orange-700 bg-orange-50')}>
      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
      <div>
        <span className="font-medium block">
          Analysis Confidence: {isLowConfidence ? 'Low' : 'Moderate'}
        </span>
        <span className="text-xs opacity-80 mt-0.5 block">
          Some label information could not be read clearly.
        </span>
      </div>
    </div>
  );
}
