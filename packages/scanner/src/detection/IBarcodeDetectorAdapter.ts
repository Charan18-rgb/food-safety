import { DetectedBarcodeResult } from '../types.js';

export interface IBarcodeDetectorAdapter {
  readonly name: string;
  isSupported(): boolean;
  detect(source: HTMLVideoElement | HTMLCanvasElement | ImageBitmap): Promise<DetectedBarcodeResult[]>;
  stop?(): void | Promise<void>;
}
