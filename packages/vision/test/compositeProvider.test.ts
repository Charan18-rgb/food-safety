import { describe, it, expect, vi } from 'vitest';
import { CompositeVisionProvider } from '../src/providers/CompositeVisionProvider.js';
import { IVisionProvider } from '../src/providers/IVisionProvider.js';
import { VisionProviderUnavailableError } from '../src/errors.js';

describe('CompositeVisionProvider', () => {
  it('should use primary provider when available', async () => {
    const mockPrimary: IVisionProvider = {
      name: 'mock_primary',
      isAvailable: () => true,
      recognize: vi.fn().mockResolvedValue({
        rawText: 'Primary OCR text',
        confidence: 0.9,
        provider: 'mock_primary',
        processingTimeMs: 10
      })
    };

    const mockFallback: IVisionProvider = {
      name: 'mock_fallback',
      isAvailable: () => true,
      recognize: vi.fn()
    };

    const composite = new CompositeVisionProvider('cloud_first', mockPrimary, mockFallback);
    expect(composite.getActiveProviderName()).toBe('mock_primary');

    const result = await composite.recognize('mock-image');
    expect(result.rawText).toBe('Primary OCR text');
    expect(mockPrimary.recognize).toHaveBeenCalled();
    expect(mockFallback.recognize).not.toHaveBeenCalled();
  });

  it('should fall back to secondary provider if primary throws error', async () => {
    const mockPrimary: IVisionProvider = {
      name: 'mock_primary',
      isAvailable: () => true,
      recognize: vi.fn().mockRejectedValue(new Error('Primary failed'))
    };

    const mockFallback: IVisionProvider = {
      name: 'mock_fallback',
      isAvailable: () => true,
      recognize: vi.fn().mockResolvedValue({
        rawText: 'Fallback OCR text',
        confidence: 0.8,
        provider: 'mock_fallback',
        processingTimeMs: 25
      })
    };

    const composite = new CompositeVisionProvider('cloud_first', mockPrimary, mockFallback);
    const result = await composite.recognize('mock-image');

    expect(result.rawText).toBe('Fallback OCR text');
    expect(result.provider).toBe('mock_fallback');
    expect(mockPrimary.recognize).toHaveBeenCalled();
    expect(mockFallback.recognize).toHaveBeenCalled();
  });

  it('should throw VisionProviderUnavailableError if no provider is available', async () => {
    const mockPrimary: IVisionProvider = {
      name: 'unavailable_primary',
      isAvailable: () => false,
      recognize: vi.fn()
    };

    const mockFallback: IVisionProvider = {
      name: 'unavailable_fallback',
      isAvailable: () => false,
      recognize: vi.fn()
    };

    const composite = new CompositeVisionProvider('cloud_first', mockPrimary, mockFallback);
    await expect(composite.recognize('mock-image')).rejects.toThrow(VisionProviderUnavailableError);
  });
});
