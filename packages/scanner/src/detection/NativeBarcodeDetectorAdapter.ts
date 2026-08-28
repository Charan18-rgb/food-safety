import { IBarcodeDetectorAdapter } from './IBarcodeDetectorAdapter.js';
import { DetectedBarcodeResult } from '../types.js';

export const FOOD_PRODUCT_BARCODE_FORMATS = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39'
];

interface NativeDetectedBarcode {
  rawValue: string;
  format: string;
  boundingBox?: DOMRectReadOnly;
  cornerPoints?: Array<{ x: number; y: number }>;
}

export class NativeBarcodeDetectorAdapter implements IBarcodeDetectorAdapter {
  readonly name = 'native_barcode_detector';
  private detectorInstance: unknown = null;
  private negotiatedFormats: string[] | null = null;
  private isAvailable = true;

  isSupported(): boolean {
    const hasGlobal = (
      (typeof window !== 'undefined' && 'BarcodeDetector' in window) ||
      (typeof globalThis !== 'undefined' && 'BarcodeDetector' in globalThis)
    );
    return hasGlobal && this.isAvailable;
  }

  /**
   * Discovers and negotiates supported formats with the browser's BarcodeDetector.
   * Strategy:
   * 1. If BarcodeDetector.getSupportedFormats() is available -> query & intersect with FOOD_PRODUCT_BARCODE_FORMATS.
   *    If intersection is empty -> mark native unsupported so Composite falls back to ZXing.
   * 2. If getSupportedFormats() is not exposed -> use conservative FOOD_PRODUCT_BARCODE_FORMATS.
   * 3. If constructor throws on formats -> catch and mark unsupported.
   */
  async negotiateCapabilities(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    const BarcodeDetectorClass =
      typeof window !== 'undefined' && 'BarcodeDetector' in window
        ? (window as unknown as { BarcodeDetector: { getSupportedFormats?: () => Promise<string[]>; new (opts: { formats: string[] }): unknown } }).BarcodeDetector
        : (globalThis as unknown as { BarcodeDetector: { getSupportedFormats?: () => Promise<string[]>; new (opts: { formats: string[] }): unknown } }).BarcodeDetector;

    if (!BarcodeDetectorClass) {
      this.isAvailable = false;
      return false;
    }

    // 1. If getSupportedFormats() is available, query and intersect
    if (typeof BarcodeDetectorClass.getSupportedFormats === 'function') {
      try {
        const browserSupported: string[] = await BarcodeDetectorClass.getSupportedFormats();
        const intersected = FOOD_PRODUCT_BARCODE_FORMATS.filter(f => browserSupported.includes(f));

        if (intersected.length === 0) {
          // No product barcode formats supported natively -> fallback to ZXing
          this.isAvailable = false;
          return false;
        }

        this.negotiatedFormats = intersected;
      } catch {
        this.negotiatedFormats = FOOD_PRODUCT_BARCODE_FORMATS;
      }
    } else {
      this.negotiatedFormats = FOOD_PRODUCT_BARCODE_FORMATS;
    }

    // 2. Safe instantiation with negotiated formats
    try {
      this.detectorInstance = new BarcodeDetectorClass({ formats: this.negotiatedFormats });
      return true;
    } catch {
      this.isAvailable = false;
      this.detectorInstance = null;
      return false;
    }
  }

  getNegotiatedFormats(): string[] {
    return this.negotiatedFormats || FOOD_PRODUCT_BARCODE_FORMATS;
  }

  private async getDetector(): Promise<unknown> {
    if (!this.detectorInstance && this.isAvailable) {
      await this.negotiateCapabilities();
    }
    return this.detectorInstance;
  }

  async detect(source: HTMLVideoElement | HTMLCanvasElement | ImageBitmap): Promise<DetectedBarcodeResult[]> {
    if (!this.isSupported()) return [];

    try {
      const detector = (await this.getDetector()) as { detect: (src: unknown) => Promise<NativeDetectedBarcode[]> } | null;
      if (!detector || typeof detector.detect !== 'function') return [];

      const rawResults = await detector.detect(source);

      // Filter out any non-food-product barcodes (like QR codes)
      const validResults = rawResults.filter(r => r.format !== 'qr_code' && r.format !== 'qrcode');

      return validResults.map(r => ({
        rawValue: r.rawValue,
        format: r.format,
        boundingBox: r.boundingBox
          ? {
              x: r.boundingBox.x,
              y: r.boundingBox.y,
              width: r.boundingBox.width,
              height: r.boundingBox.height
            }
          : undefined,
        cornerPoints: r.cornerPoints
      }));
    } catch {
      return [];
    }
  }

  stop(): void {
    this.detectorInstance = null;
    this.negotiatedFormats = null;
  }
}
