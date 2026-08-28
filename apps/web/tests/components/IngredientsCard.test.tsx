import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { IngredientsCard } from '@/components/analysis/IngredientsCard';
import { NormalizedIngredient } from '@foodgrade/shared-types';

test('renders ingredients card', () => {
  const ingredients: NormalizedIngredient[] = [
    { rawText: 'Water', category: 'water', riskLevel: 'low', flags: [] },
    { rawText: 'Sugar', category: 'refined_sweetener', riskLevel: 'high', flags: [] }
  ];
  render(<IngredientsCard ingredients={ingredients} />);
  expect(screen.getByText('Ingredients')).toBeInTheDocument();
  expect(screen.getByText('Water')).toBeInTheDocument();
  expect(screen.getByText('Sugar')).toBeInTheDocument();
});

test('renders unknown ingredients message', () => {
  render(<IngredientsCard ingredients={[]} />);
  expect(screen.getByText('Ingredients')).toBeInTheDocument();
  expect(screen.getByText('No ingredients detected.')).toBeInTheDocument();
});
