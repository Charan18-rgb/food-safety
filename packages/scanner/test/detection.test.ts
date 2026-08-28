import { describe, it, expect, vi } from 'vitest';
import { NativeBarcodeDetectorAdapter } from '../src/detection/NativeBarcodeDetectorAdapter.js';
import { ZXingBarcodeDetectorAdapter } from '../src/detection/ZXingBarcodeDetectorAdapter.js';
import { CompositeBarcodeDetector } from '../src/detection/CompositeBarcodeDetector.js';

describe('Barcode Detection Adapters (Native & ZXing)', () => {
  it('NativeBarcodeDetectorAdapter should negotiate supported formats and instantiate detector', async () => {
    const mockDetect = vi.fn().mockResolvedValue([
      {
        rawValue: '8901063012219',
        format: 'ean_13',
        boundingBox: { x: 10, y: 10, width: 200, height: 100 }
      }
    ]);

    class MockBarcodeDetector {
      static getSupportedFormats = vi.fn().mockResolvedValue(['ean_13', 'upc_a', 'qr_code']);
      detect = mockDetect;
    }

    vi.stubGlobal('BarcodeDetector', MockBarcodeDetector);

    const adapter = new NativeBarcodeDetectorAdapter();
    const negotiated = await adapter.negotiateCapabilities();

    expect(negotiated).toBe(true);
    expect(adapter.isSupported()).toBe(true);
    expect(adapter.getNegotiatedFormats()).toEqual(['ean_13', 'upc_a']); // 'qr_code' filtered out!

    const mockCanvas = {} as HTMLCanvasElement;
    const results = await adapter.detect(mockCanvas);

    expect(results).toHaveLength(1);
    expect(results[0].rawValue).toBe('8901063012219');
    expect(results[0].format).toBe('ean_13');
    expect(mockDetect).toHaveBeenCalledWith(mockCanvas);

    vi.unstubAllGlobals();
  });

  it('NativeBarcodeDetectorAdapter should fall back if getSupportedFormats has no product formats', async () => {
    class MockQRBarcodeDetector {
      static getSupportedFormats = vi.fn().mockResolvedValue(['qr_code', 'aztec']);
      detect = vi.fn();
    }

    vi.stubGlobal('BarcodeDetector', MockQRBarcodeDetector);

    const adapter = new NativeBarcodeDetectorAdapter();
    const negotiated = await adapter.negotiateCapabilities();

    expect(negotiated).toBe(false);
    expect(adapter.isSupported()).toBe(false);

    vi.unstubAllGlobals();
  });

  it('NativeBarcodeDetectorAdapter should handle missing getSupportedFormats gracefully', async () => {
    class MockLegacyBarcodeDetector {
      detect = vi.fn().mockResolvedValue([]);
    }

    vi.stubGlobal('BarcodeDetector', MockLegacyBarcodeDetector);

    const adapter = new NativeBarcodeDetectorAdapter();
    const negotiated = await adapter.negotiateCapabilities();

    expect(negotiated).toBe(true);
    expect(adapter.getNegotiatedFormats()).toContain('ean_13');

    vi.unstubAllGlobals();
  });

  it('ZXingBarcodeDetectorAdapter should report supported and instantiate BrowserMultiFormatReader', () => {
    const zxingAdapter = new ZXingBarcodeDetectorAdapter();
    expect(zxingAdapter.name).toBe('zxing_barcode_detector');
    expect(zxingAdapter.isSupported()).toBe(true);
  });

  it('CompositeBarcodeDetector should pick native when available and fallback to zxing', async () => {
    // 1. Without window.BarcodeDetector -> chooses ZXing
    const fallbackDetector = new CompositeBarcodeDetector(true);
    expect(fallbackDetector.getActiveDetectorName()).toBe('zxing_barcode_detector');

    // 2. With window.BarcodeDetector supporting EAN-13 -> chooses Native
    class MockBarcodeDetector {
      static getSupportedFormats = vi.fn().mockResolvedValue(['ean_13']);
    }
    vi.stubGlobal('BarcodeDetector', MockBarcodeDetector);

    const nativeDetector = new CompositeBarcodeDetector(true);
    expect(nativeDetector.getActiveDetectorName()).toBe('native_barcode_detector');

    vi.unstubAllGlobals();
  });
});
