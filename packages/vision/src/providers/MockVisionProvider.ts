import { IVisionProvider } from './IVisionProvider.js';
import { OCREvidence, VisionImageSource, VisionOptions } from '../types.js';

export class MockVisionProvider implements IVisionProvider {
  readonly name = 'mock_vision_provider';
  private defaultResponse: string;
  private confidence: number;
  private delayMs: number;

  constructor(
    defaultResponse = 'Nutritional Information Per 100g:\nEnergy: 450 kcal\nProtein: 7.0 g\nCarbohydrate: 70.0 g\nTotal Sugars: 25.0 g\nAdded Sugars: 24.0 g\nTotal Fat: 15.0 g\nSaturated Fat: 7.0 g\nSodium: 250 mg\n\nIngredients: Refined Wheat Flour (Maida), Sugar, Palm Oil, Invert Sugar Syrup, Raising Agents (INS 500(ii), INS 503(ii)), Iodised Salt, Emulsifier (INS 322), Antioxidant (INS 319).',
    confidence = 1.0,
    delayMs = 10
  ) {
    this.defaultResponse = defaultResponse;
    this.confidence = confidence;
    this.delayMs = delayMs;
  }

  isAvailable(): boolean {
    return true;
  }

  async recognize(image: VisionImageSource, _options?: VisionOptions): Promise<OCREvidence> {
    if (this.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }

    const lines = this.defaultResponse.split('\n').map(l => l.trim()).filter(Boolean);

    return {
      rawText: this.defaultResponse,
      confidence: this.confidence,
      provider: this.name,
      processingTimeMs: this.delayMs,
      lines,
      metadata: {
        mock: true,
        imageType: typeof image
      }
    };
  }
}
