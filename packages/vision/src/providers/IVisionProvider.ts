import { OCREvidence, VisionImageSource, VisionOptions } from '../types.js';

export interface IVisionProvider {
  readonly name: string;
  isAvailable(): boolean;
  recognize(image: VisionImageSource, options?: VisionOptions): Promise<OCREvidence>;
  terminate?(): Promise<void>;
}
