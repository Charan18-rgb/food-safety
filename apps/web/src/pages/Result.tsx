import { GradeBadge } from '@/components/analysis/GradeBadge';
import { ScoreGauge } from '@/components/analysis/ScoreGauge';
import { WhyThisGrade } from '@/components/analysis/WhyThisGrade';
import { FactorList } from '@/components/analysis/FactorList';
import { PillarBreakdown } from '@/components/analysis/PillarBreakdown';
import { ConfidenceBadge } from '@/components/analysis/ConfidenceBadge';
import { NutritionCard } from '@/components/analysis/NutritionCard';
import { IngredientsCard } from '@/components/analysis/IngredientsCard';
import { AdditivesCard } from '@/components/analysis/AdditivesCard';
import { SourceBadge } from '@/components/analysis/SourceBadge';
import { useResultContext } from '@/context/ResultContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { clientService } from '@/services/client';
import { Star } from 'lucide-react';
import { useState } from 'react';

export default function Result() {
  const { currentResult, updateFavoriteStatus } = useResultContext();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  if (!currentResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500 mb-4">No product analysis found.</p>
        <Button onClick={() => navigate('/scan')}>Go to Scanner</Button>
      </div>
    );
  }

  const { analysisResult, productInput, scanRecordId, isFavorite } = currentResult;

  const handleToggleFavorite = async () => {
    if (!scanRecordId) return;
    try {
      setSaving(true);
      const newFav = await clientService.toggleFavorite(scanRecordId);
      updateFavoriteStatus(newFav);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex justify-between items-start mb-2">
        <Button variant="ghost" onClick={() => navigate(-1)} className="px-2">
          ? Back
        </Button>
        {scanRecordId && (
          <Button 
            variant="ghost" 
            onClick={handleToggleFavorite}
            disabled={saving}
            className="px-2 text-yellow-500"
          >
            <Star className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-gray-900 mb-1 text-center">{productInput.productName || 'Unknown Product'}</h2>
        <span className="text-sm text-gray-500 mb-6">{productInput.brand || 'Unknown Brand'}</span>
        
        <GradeBadge grade={analysisResult.grade} className="w-full max-w-xs mb-8" />
        <ScoreGauge score={analysisResult.score} />
      </div>

      <ConfidenceBadge provenance={productInput.provenance} />
      
      <WhyThisGrade text={analysisResult.summaryExplanation} />
      
      <FactorList 
        positives={analysisResult.positives}
        warnings={analysisResult.warnings}
      />
      
      <PillarBreakdown scores={analysisResult.pillarScores} />
      
      <NutritionCard nutrition={productInput.nutrition} />
      {productInput.parsedIngredients && productInput.parsedIngredients.length > 0 && <IngredientsCard ingredients={productInput.parsedIngredients} />}
      {productInput.detectedAdditives && productInput.detectedAdditives.length > 0 && <AdditivesCard additives={productInput.detectedAdditives} />}
      
      <SourceBadge provenance={productInput.provenance} />
    </div>
  );
}
