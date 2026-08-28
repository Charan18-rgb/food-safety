import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { PillarBreakdown } from '@/components/analysis/PillarBreakdown';

test('renders pillar breakdown correctly', () => {
  render(<PillarBreakdown scores={{ nutritionScore: 40, ingredientScore: 60, additiveScore: 80 }} />);
  expect(screen.getByText('Nutritional Balance')).toBeInTheDocument();
  expect(screen.getByText('40')).toBeInTheDocument();
  expect(screen.getByText('Ingredient Quality')).toBeInTheDocument();
  expect(screen.getByText('60')).toBeInTheDocument();
  expect(screen.getByText('Additive / Processing')).toBeInTheDocument();
  expect(screen.getByText('80')).toBeInTheDocument();
});

