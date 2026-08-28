import { Card } from '../ui/Card';
import { Info } from 'lucide-react';

export function WhyThisGrade({ text }: { text: string }) {
  if (!text) return null;
  return (
    <Card className="bg-blue-50/50 border-blue-100">
      <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2 uppercase tracking-wide">
        <Info className="w-4 h-4" />
        Why this grade?
      </h3>
      <p className="text-blue-900/80 leading-relaxed text-sm">{text}</p>
    </Card>
  );
}
