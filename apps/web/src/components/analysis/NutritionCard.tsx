import { Card } from '../ui/Card';
import { NutritionProfile, NutrientValue } from '@foodgrade/shared-types';

function NutrientRow({ label, nutrient }: { label: string, nutrient?: NutrientValue }) {
  const value = nutrient?.value !== null && nutrient?.value !== undefined ? `${nutrient.value}${nutrient.unit}` : 'Not available';
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

export function NutritionCard({ nutrition }: { nutrition: NutritionProfile }) {
  return (
    <Card>
      <h3 className="text-base font-bold text-gray-900 mb-4">Nutrition Facts</h3>
      <div className="flex flex-col">
        <NutrientRow label="Energy" nutrient={nutrition.energyKcal} />
        <NutrientRow label="Protein" nutrient={nutrition.proteinG} />
        <NutrientRow label="Total Fat" nutrient={nutrition.totalFatG} />
        <NutrientRow label="Saturated Fat" nutrient={nutrition.saturatedFatG} />
        <NutrientRow label="Total Sugars" nutrient={nutrition.totalSugarsG} />
        <NutrientRow label="Added Sugars" nutrient={nutrition.addedSugarsG} />
        <NutrientRow label="Sodium" nutrient={nutrition.sodiumMg} />
      </div>
    </Card>
  );
}
