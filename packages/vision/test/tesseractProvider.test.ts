import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TesseractVisionProvider } from '../src/providers/TesseractVisionProvider.js';
import { VisionInvalidImageError } from '../src/errors.js';

vi.mock('tesseract.js', () => {
  return {
    createWorker: vi.fn().mockImplementation(async () => {
      return {
        recognize: vi.fn().mockResolvedValue({
          data: {
            text: 'Nutritional Info:\nEnergy 400 kcal\nProtein 8.0 g\nIngredients: Wheat Flour, Sugar',
            confidence: 88,
            version: '5.1.1',
            blocks: [
              {
                text: 'Nutritional Info:\nEnergy 400 kcal\nProtein 8.0 g',
                confidence: 90,
                bbox: { x0: 10, y0: 10, x1: 200, y1: 100 },
                lines: [
                  {
                    text: 'Nutritional Info:',
                    confidence: 95,
                    bbox: { x0: 10, y0: 10, x1: 150, y1: 30 },
                    words: [{ text: 'Nutritional', confidence: 95 }]
                  }
                ]
              }
            ]
          }
        }),
        terminate: vi.fn().mockResolvedValue(undefined)
      };
    })
  };
});

describe('TesseractVisionProvider', () => {
  let provider: TesseractVisionProvider;

  beforeEach(() => {
    provider = new TesseractVisionProvider();
  });

  it('should report available and recognize image into OCREvidence', async () => {
    expect(provider.isAvailable()).toBe(true);
    expect(provider.name).toBe('tesseract_offline_ocr');

    const result = await provider.recognize('mock-image-base64');

    expect(result.rawText).toContain('Nutritional Info');
    expect(result.confidence).toBe(0.88);
    expect(result.provider).toBe('tesseract_offline_ocr');
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks![0].lines).toHaveLength(1);
    expect(result.blocks![0].lines![0].words).toHaveLength(1);
  });

  it('should throw VisionInvalidImageError if image source is null or empty', async () => {
    await expect(provider.recognize('' as any)).rejects.toThrow(VisionInvalidImageError);
  });

  it('should cleanly terminate worker resources', async () => {
    await provider.recognize('mock-image');
    await expect(provider.terminate()).resolves.not.toThrow();
  });
});
