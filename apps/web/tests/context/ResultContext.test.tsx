import { renderHook, act } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ResultProvider, useResultContext } from '@/context/ResultContext';

test('ResultContext handles state correctly', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => <ResultProvider>{children}</ResultProvider>;
  const { result } = renderHook(() => useResultContext(), { wrapper });

  expect(result.current.currentResult).toBeNull();

  act(() => {
    result.current.setResult({
      productInput: {} as any,
      analysisResult: {} as any,
      scanMethod: 'manual',
      timestamp: 123
    });
  });

  expect(result.current.currentResult).not.toBeNull();
  expect(result.current.currentResult?.scanMethod).toBe('manual');

  act(() => {
    result.current.clearResult();
  });

  expect(result.current.currentResult).toBeNull();
});

