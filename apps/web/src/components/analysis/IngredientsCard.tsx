import { Card } from '../ui/Card';
import { NormalizedIngredient } from '@foodgrade/shared-types';

export function IngredientsCard({ ingredients }: { ingredients: NormalizedIngredient[] }) {
  return (
    <Card>
      <h3 className="text-base font-bold text-gray-900 mb-4">Ingredients</h3>
      {ingredients.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No ingredients detected.</p>
      ) : (
        <ol className="list-decimal list-inside space-y-1">
          {ingredients.map((ing, i) => (
            <li key={i} className="text-sm text-gray-700">
              <span className="font-medium">{ing.canonicalName || ing.rawText || 'Unknown ingredient'}</span>
              {ing.isWholeGrain && <span className="ml-2 text-xs text-green-600">✓ Whole grain</span>}
              {ing.category === 'refined_sweetener' && <span className="ml-2 text-xs text-red-600">! Added sugar</span>}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
