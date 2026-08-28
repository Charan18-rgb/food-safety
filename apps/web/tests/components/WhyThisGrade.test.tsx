import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { WhyThisGrade } from '@/components/analysis/WhyThisGrade';

test('renders why this grade text', () => {
  render(<WhyThisGrade text="Test summary explanation" />);
  expect(screen.getByText('Why this grade?')).toBeInTheDocument();
  expect(screen.getByText('Test summary explanation')).toBeInTheDocument();
});

