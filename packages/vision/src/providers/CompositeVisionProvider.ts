import { IVisionProvider } from './IVisionProvider.js';
import { TesseractVisionProvider } from './TesseractVisionProvider.js';
import { GeminiVisionProvider } from './GeminiVisionProvider.js';
import { OCREvidence, VisionImageSource, VisionOptions } from '../types.js';
import { VisionProviderUnavailableError } from '../errors.js';

export type VisionProviderStrategy = 'cloud_first' | 'offline_first' | 'offline_only' | 'cloud_only';

export class CompositeVisionProvider implements IVisionProvider {
  readonly name = 'composite_vision_provider';
  private primaryProvider: IVisionProvider;
  private fallbackProvider?: IVisionProvider;
  private strategy: VisionProviderStrategy;

  constructor(
    strategy: VisionProviderStrategy = 'cloud_first',
    customPrimary?: IVisionProvider,
    customFallback?: IVisionProvider
  ) {
    this.strategy = strategy;

    if (customPrimary) {
      this.primaryProvider = customPrimary;
      this.fallbackProvider = customFallback;
      return;
    }

    const tesseract = new TesseractVisionProvider();
    const gemini = new GeminiVisionProvider();

    switch (strategy) {
      case 'cloud_first':
        this.primaryProvider = gemini;
        this.fallbackProvider = tesseract;
        break;
      case 'offline_first':
        this.primaryProvider = tesseract;
        this.fallbackProvider = gemini;
        break;
      case 'offline_only':
        this.primaryProvider = tesseract;
        break;
      case 'cloud_only':
        this.primaryProvider = gemini;
        break;
    }
  }

  isAvailable(): boolean {
    return this.primaryProvider.isAvailable() || Boolean(this.fallbackProvider?.isAvailable());
  }

  getStrategy(): VisionProviderStrategy {
    return this.strategy;
  }

  getActiveProviderName(): string {
    if (this.primaryProvider.isAvailable()) {
      return this.primaryProvider.name;
    }
    return this.fallbackProvider ? this.fallbackProvider.name : this.primaryProvider.name;
  }

  async recognize(image: VisionImageSource, options: VisionOptions = {}): Promise<OCREvidence> {
    // 1. Try primary provider if available
    if (this.primaryProvider.isAvailable()) {
      try {
        return await this.primaryProvider.recognize(image, options);
      } catch (primaryErr) {
        if (!this.fallbackProvider || !this.fallbackProvider.isAvailable()) {
          throw primaryErr;
        }
        // Fall through to fallback provider
      }
    }

    // 2. Try fallback provider
    if (this.fallbackProvider && this.fallbackProvider.isAvailable()) {
      return await this.fallbackProvider.recognize(image, options);
    }

    throw new VisionProviderUnavailableError('No configured vision provider is available');
  }

  async terminate(): Promise<void> {
    if (typeof this.primaryProvider.terminate === 'function') {
      await this.primaryProvider.terminate();
    }
    if (typeof this.fallbackProvider?.terminate === 'function') {
      await this.fallbackProvider.terminate();
    }
  }
}
