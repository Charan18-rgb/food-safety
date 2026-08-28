import { IBarcodeDetectorAdapter } from './IBarcodeDetectorAdapter.js';
import { DetectedBarcodeResult } from '../types.js';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType, Result } from '@zxing/library';

export const FOOD_PRODUCT_ZXING_FORMATS: BarcodeFormat[] = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39
];

export class ZXingBarcodeDetectorAdapter implements IBarcodeDetectorAdapter {
  readonly name = 'zxing_barcode_detector';
  private reader: BrowserMultiFormatReader | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' || typeof document !== 'undefined' || typeof globalThis !== 'undefined';
  }

  private getReader(): BrowserMultiFormatReader {
    if (!this.reader) {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, FOOD_PRODUCT_ZXING_FORMATS);
      hints.set(DecodeHintType.TRY_HARDER, true);
      this.reader = new BrowserMultiFormatReader(hints);
    }
    return this.reader;
  }

  private getCanvas(width: number, height: number): HTMLCanvasElement | null {
    if (typeof document === 'undefined') return null;
    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
    }
    if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
    return this.offscreenCanvas;
  }

  async detect(source: HTMLVideoElement | HTMLCanvasElement | ImageBitmap): Promise<DetectedBarcodeResult[]> {
    try {
      const reader = this.getReader();
      let result: Result | null = null;

      if (typeof HTMLVideoElement !== 'undefined' && source instanceof HTMLVideoElement) {
        if (source.readyState < 2 || source.videoWidth === 0 || source.videoHeight === 0) {
          return [];
        }

        const canvas = this.getCanvas(source.videoWidth, source.videoHeight);
        if (canvas) {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(source, 0, 0, source.videoWidth, source.videoHeight);
            try {
              result = reader.decodeFromCanvas(canvas);
            } catch {
              // Not found in this frame
            }
          }
        }
      } else if (typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement) {
        try {
          result = reader.decodeFromCanvas(source);
        } catch {
          // Not found
        }
      }

      if (!result) {
        return [];
      }

      // Explicitly reject QR codes if any were somehow scanned
      if (result.getBarcodeFormat() === BarcodeFormat.QR_CODE) {
        return [];
      }

      const rawValue = result.getText();
      const format = result.getBarcodeFormat() ? BarcodeFormat[result.getBarcodeFormat()].toLowerCase() : 'unknown';
      const points = result.getResultPoints();

      let boundingBox: DetectedBarcodeResult['boundingBox'];
      if (points && points.length >= 2) {
        const xs = points.map(p => p.getX());
        const ys = points.map(p => p.getY());
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        boundingBox = {
          x: minX,
          y: minY,
          width: Math.max(1, maxX - minX),
          height: Math.max(1, maxY - minY)
        };
      }

      return [
        {
          rawValue,
          format,
          boundingBox,
          cornerPoints: points?.map(p => ({ x: p.getX(), y: p.getY() }))
        }
      ];
    } catch {
      return [];
    }
  }

  stop(): void {
    this.reader = null;
    this.offscreenCanvas = null;
  }
}
