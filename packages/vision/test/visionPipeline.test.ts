import { describe, it, expect, vi } from 'vitest';
import { VisionPipeline } from '../src/pipeline/VisionPipeline.js';
import { MockVisionProvider } from '../src/providers/MockVisionProvider.js';
import { VisionCancelledError } from '../src/errors.js';

describe('VisionPipeline End-to-End Orchestration & Session Invalidation', () => {
  const rawLabelSample = `
BRITANNIA GOOD DAY BUTTER COOKIES
Nutritional Information Per 100g:
Energy 490 kcal
Protein 7.0 g
Carbohydrate 68.0 g
Total Sugars 23.0 g
Added Sugars 22.0 g
Total Fat 21.0 g
Saturated Fat 10.0 g
Sodium 290 mg

Ingredients: Refined Wheat Flour (Maida), Sugar, Refined Palm Oil, Butter (2%), Invert Sugar Syrup, Milk Solids, Raising Agents (INS 500(ii), INS 503(ii)), Iodised Salt, Emulsifiers (INS 322, INS 471, INS 472e).
  `.trim();

  it('should execute full Image -> OCREvidence -> Parser -> ProductInput -> Engine pipeline', async () => {
    const mockProvider = new MockVisionProvider(rawLabelSample, 0.96);
    const pipeline = new VisionPipeline(mockProvider);

    const result = await pipeline.processImage('mock-image-data');

    // 1. Check Vision Step
    expect(result.ocrEvidence).toBeDefined();
    expect(result.ocrEvidence.rawText).toContain('BRITANNIA GOOD DAY');
    expect(result.ocrEvidence.provider).toBe('mock_vision_provider');
    expect(result.ocrEvidence.confidence).toBe(0.96);

    // 2. Check Parser Step
    expect(result.parsedLabelResult).toBeDefined();
    expect(result.productInput).toBeDefined();
    expect(result.productInput.nutrition.energyKcal.value).toBe(490);
    expect(result.productInput.nutrition.addedSugarsG.value).toBe(22.0);
    expect(result.productInput.nutrition.saturatedFatG.value).toBe(10.0);
    expect(result.productInput.nutrition.sodiumMg.value).toBe(290);
    expect(result.productInput.detectedAdditives.length).toBeGreaterThan(0);
    expect(result.productInput.provenance.sourceType).toBe('label_ocr');

    // 3. Check Engine Step
    expect(result.analysisResult).toBeDefined();
    expect(result.analysisResult.grade).toBeDefined();
    expect(result.analysisResult.score).toBeGreaterThanOrEqual(0);
    expect(result.analysisResult.score).toBeLessThanOrEqual(100);
    expect(result.analysisResult.pillarScores.nutritionScore).toBeDefined();
    expect(result.analysisResult.pillarScores.ingredientScore).toBeDefined();
    expect(result.analysisResult.pillarScores.additiveScore).toBeDefined();
  });

  it('should allow calling pipeline stages independently', async () => {
    const mockProvider = new MockVisionProvider(rawLabelSample, 0.92);
    const pipeline = new VisionPipeline(mockProvider);

    // Stage 1
    const ocrEvidence = await pipeline.extractOCREvidence('mock-image-data');
    expect(ocrEvidence.rawText).toContain('BRITANNIA GOOD DAY');

    // Stage 2
    const parsedResult = pipeline.parseEvidence(ocrEvidence);
    expect(parsedResult.nutritionResult.nutrition.energyKcal.value).toBe(490);

    // Assembly
    const productInput = pipeline.assembleProductInput(parsedResult, ocrEvidence);
    expect(productInput.provenance.sourceType).toBe('label_ocr');

    // Stage 3
    const analysisResult = pipeline.evaluateProductInput(productInput);
    expect(analysisResult.grade).toBeDefined();
  });

  it('should invalidate in-flight processing and throw VisionCancelledError when cancel() is called', async () => {
    const slowMockProvider = {
      name: 'slow_mock_provider',
      isAvailable: () => true,
      recognize: vi.fn().mockImplementation(async (_img, opts) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (opts?.signal?.aborted) {
          throw new VisionCancelledError();
        }
        return {
          rawText: rawLabelSample,
          confidence: 0.9,
          provider: 'slow_mock_provider',
          processingTimeMs: 100
        };
      })
    };

    const pipeline = new VisionPipeline(slowMockProvider as any);
    const processPromise = pipeline.processImage('slow-image');

    // Cancel in flight
    pipeline.cancel();

    await expect(processPromise).rejects.toThrow(VisionCancelledError);
  });

  it('should explicitly discard stale downstream processing if cancellation occurs after OCR completion', async () => {
    const mockProvider = new MockVisionProvider(rawLabelSample, 0.92);
    const pipeline = new VisionPipeline(mockProvider);

    const sessionId = pipeline.getSessionId();
    
    // Complete Stage 1 (OCR Extraction) successfully
    const ocrEvidence = await pipeline.extractOCREvidence('mock-image-data', { sessionId });
    
    // Simulate user cancelling or starting a new scan exactly right here
    pipeline.cancel();

    // Stage 2 (Parsing) with the stale session ID must throw
    expect(() => pipeline.parseEvidence(ocrEvidence, undefined, sessionId)).toThrow(VisionCancelledError);
  });
});
