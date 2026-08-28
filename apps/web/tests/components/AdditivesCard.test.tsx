import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { AdditivesCard } from '@/components/analysis/AdditivesCard';
import { DetectedAdditive } from '@foodgrade/shared-types';

test('renders additives card', () => {
  const additives: DetectedAdditive[] = [
    { canonicalName: 'Ascorbic acid', insCode: '300', functionalClass: 'antioxidant', riskLevel: 'low' },
    { canonicalName: 'Citric acid', insCode: '330', functionalClass: 'acidity_regulator', riskLevel: 'low' }
  ];
  render(<AdditivesCard additives={additives} />);
  expect(screen.getByText('Additives')).toBeInTheDocument();
  expect(screen.getByText('300 - Ascorbic acid')).toBeInTheDocument();
  expect(screen.getByText('330 - Citric acid')).toBeInTheDocument();
});
