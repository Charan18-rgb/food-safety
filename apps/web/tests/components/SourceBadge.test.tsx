import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { SourceBadge } from '@/components/analysis/SourceBadge';
import { DataQualityProvenance } from '@foodgrade/shared-types';

test('renders source badge', () => {
  const prov: DataQualityProvenance = { sourceType: 'label_ocr', observationMode: 'directly_observed', rawConfidence: 0.8 };
  render(<SourceBadge provenance={prov} />);
  expect(screen.getByText(/Label photo/i)).toBeInTheDocument();
});

