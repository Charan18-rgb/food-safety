import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ConfidenceBadge } from '@/components/analysis/ConfidenceBadge';
import { DataQualityProvenance } from '@foodgrade/shared-types';

test('renders high confidence correctly', () => {
  const prov: DataQualityProvenance = { sourceType: 'barcode_database', observationMode: 'directly_observed', rawConfidence: 0.9 };
  render(<ConfidenceBadge provenance={prov} />);
  expect(screen.getByText(/High/)).toBeInTheDocument();
});

