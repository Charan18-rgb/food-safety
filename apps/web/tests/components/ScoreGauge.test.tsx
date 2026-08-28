import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ScoreGauge } from '@/components/analysis/ScoreGauge';

test('renders score gauge with score', () => {
  render(<ScoreGauge score={85} />);
  expect(screen.getByText('85')).toBeInTheDocument();
  expect(screen.getByText('/ 100')).toBeInTheDocument();
});

