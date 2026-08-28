import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { GradeBadge } from '@/components/analysis/GradeBadge';

test('renders excellent grade A', () => {
  render(<GradeBadge grade='A' />);
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.getByText('Excellent')).toBeInTheDocument();
});

test('renders very poor grade E', () => {
  render(<GradeBadge grade='E' />);
  expect(screen.getByText('E')).toBeInTheDocument();
  expect(screen.getByText('Very Poor')).toBeInTheDocument();
});

