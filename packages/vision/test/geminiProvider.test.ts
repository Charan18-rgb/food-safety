import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GeminiVisionProvider,
  DEFAULT_GEMINI_VISION_MODEL,
  calculateTextStructureConfidence
} from '../src/providers/GeminiVisionProvider.js';
import { VisionEndpointMissingError, VisionNetworkError, VisionCancelledError } from '../src/errors.js';

describe('GeminiVisionProvider Production Security & Model Upgrade (gemini-3.7-flash)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('should default to gemini-3.7-flash defined as a single source of truth', () => {
    expect(DEFAULT_GEMINI_VISION_MODEL).toBe('gemini-3.7-flash');

    const provider = new GeminiVisionProvider();
    expect(provider.getModel()).toBe('gemini-3.7-flash');
  });

  it('should throw VisionEndpointMissingError when no proxy endpoint is provided', async () => {
    const provider = new GeminiVisionProvider();
    expect(provider.isAvailable()).toBe(false);
    await expect(provider.recognize('mock-base64')).rejects.toThrow(VisionEndpointMissingError);
  });

  it('should calculate empirical text structure confidence when gateway confidence is omitted (no fake 0.95)', async () => {
    const sampleText = `
NUTRITIONAL INFORMATION Per 100g:
Energy 500 kcal
Protein 8.0 g
Carbohydrate 65.0 g
Total Sugars 20.0 g
Fat 20.0 g
Sodium 300 mg

INGREDIENTS: Oats, Sugar, Cocoa Butter, Emulsifier (INS 322).
    `.trim();

    const calculatedConfidence = calculateTextStructureConfidence(sampleText);
    expect(calculatedConfidence).toBeGreaterThan(0.70);
    expect(calculatedConfidence).toBeLessThanOrEqual(1.0);

    const mockProxyResponse = {
      rawText: sampleText
      // Notice: json.confidence is omitted!
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProxyResponse
    });

    const provider = new GeminiVisionProvider({
      endpoint: '/api/vision/ocr',
      fetchFn: mockFetch
    });

    const result = await provider.recognize('mock-base64');
    expect(result.confidence).toBe(calculatedConfidence);
    expect(result.confidence).not.toBe(0.95);
  });

  it('should post payload to secure backend proxy with gemini-3.7-flash and clean generation config', async () => {
    const mockProxyResponse = {
      rawText: 'NUTRITION FACTS Per 100g:\nEnergy: 500 kcal\nCarbohydrate: 65 g\nTotal Sugars: 20 g\nFat: 20 g\nProtein: 8 g\nSodium: 300 mg\n\nIngredients: Oats, Sugar, Cocoa Butter, Emulsifier (INS 322).',
      confidence: 0.92
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProxyResponse
    });

    const provider = new GeminiVisionProvider({
      endpoint: '/api/vision/ocr',
      headers: { 'Authorization': 'Bearer test-session-token' },
      fetchFn: mockFetch
    });

    expect(provider.isAvailable()).toBe(true);

    const result = await provider.recognize('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/vision/ocr',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-session-token'
        }),
        body: expect.stringMatching(/"model":\s*"gemini-3.7-flash"/)
      })
    );

    // Verify clean generation config without deprecated legacy sampling parameters
    const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(sentBody.model).toBe('gemini-3.7-flash');
    expect(sentBody.generationConfig.maxOutputTokens).toBe(4096);
    expect(sentBody.generationConfig.temperature).toBeUndefined();
    expect(sentBody.generationConfig.topP).toBeUndefined();

    expect(result.rawText).toContain('NUTRITION FACTS');
    expect(result.rawText).toContain('INS 322');
    expect(result.provider).toBe('gemini_cloud_vision');
    expect(result.lines).toHaveLength(8);
    expect(result.confidence).toBe(0.92);
    expect(result.metadata?.model).toBe('gemini-3.7-flash');
  });

  it('should support AbortSignal cancellation and throw VisionCancelledError when aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    const provider = new GeminiVisionProvider({ endpoint: '/api/vision/ocr' });
    await expect(provider.recognize('mock-base64', { signal: controller.signal })).rejects.toThrow(VisionCancelledError);
  });

  it('should handle proxy HTTP error responses by throwing VisionNetworkError', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => 'Bad Gateway'
    });

    const provider = new GeminiVisionProvider({
      endpoint: '/api/vision/ocr',
      fetchFn: mockFetch
    });

    await expect(provider.recognize('mock-base64')).rejects.toThrow(VisionNetworkError);
  });
});
