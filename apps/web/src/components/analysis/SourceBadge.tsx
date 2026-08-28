import { Database, Camera } from 'lucide-react';
import { DataQualityProvenance } from '@foodgrade/shared-types';

export function SourceBadge({ provenance }: { provenance: DataQualityProvenance }) {
  const isLabel = provenance.sourceType === 'label_ocr';

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-4">
      {isLabel ? <Camera className="w-3 h-3" /> : <Database className="w-3 h-3" />}
      <span>Source: {isLabel ? 'Label photo' : 'Product database'}</span>
    </div>
  );
}
