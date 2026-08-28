import { IBarcodeDetectorAdapter } from './IBarcodeDetectorAdapter.js';
import { NativeBarcodeDetectorAdapter } from './NativeBarcodeDetectorAdapter.js';
import { ZXingBarcodeDetectorAdapter } from './ZXingBarcodeDetectorAdapter.js';
import { DetectedBarcodeResult } from '../types.js';

export class CompositeBarcodeDetector implements IBarcodeDetectorAdapter {
  readonly name = 'composite_barcode_detector';
  private nativeAdapter: NativeBarcodeDetectorAdapter;
  private zxingAdapter: ZXingBarcodeDetectorAdapter;
  private preferNative: boolean;

  constructor(preferNative = true) {
    this.preferNative = preferNative;
    this.nativeAdapter = new NativeBarcodeDetectorAdapter();
    this.zxingAdapter = new ZXingBarcodeDetectorAdapter();
  }

  isSupported(): boolean {
    return this.nativeAdapter.isSupported() || this.zxingAdapter.isSupported();
  }

  getActiveDetectorName(): string {
    if (this.preferNative && this.nativeAdapter.isSupported()) {
      return this.nativeAdapter.name;
    }
    return this.zxingAdapter.name;
  }

  async detect(source: HTMLVideoElement | HTMLCanvasElement | ImageBitmap): Promise<DetectedBarcodeResult[]> {
    // 1. Try native BarcodeDetector first if supported and preferred
    if (this.preferNative && this.nativeAdapter.isSupported()) {
      const nativeResults = await this.nativeAdapter.detect(source);
      if (nativeResults && nativeResults.length > 0) {
        return nativeResults;
      }
    }

    // 2. Fallback to @zxing/browser
    if (this.zxingAdapter.isSupported()) {
      const zxingResults = await this.zxingAdapter.detect(source);
      if (zxingResults && zxingResults.length > 0) {
        return zxingResults;
      }
    }

    return [];
  }

  async stop(): Promise<void> {
    if (typeof this.nativeAdapter.stop === 'function') {
      await this.nativeAdapter.stop();
    }
    if (typeof this.zxingAdapter.stop === 'function') {
      await this.zxingAdapter.stop();
    }
  }
}
