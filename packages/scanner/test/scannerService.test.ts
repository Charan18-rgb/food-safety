import { describe, it, expect, vi } from 'vitest';
import { BarcodeScannerService } from '../src/BarcodeScannerService.js';
import {
  FoodGradeClientService,
  ScanHistoryRepository,
  MemoryStorageAdapter,
  OpenFoodFactsClient
} from '@foodgrade/client-services';
import { IBarcodeDetectorAdapter } from '../src/detection/IBarcodeDetectorAdapter.js';
import { DetectedBarcodeResult } from '../src/types.js';

describe('BarcodeScannerService Coordinator & Hardening', () => {
  it('should process detected barcode, look up product, evaluate score, and save to history', async () => {
    const mockOFFPayload = {
      code: '8901063012219',
      status: 'success',
      result: { id: 'product_found' },
      product: {
        product_name: 'Parle-G Gluco Biscuits',
        brands: 'Parle',
        nutriments: {
          'energy-kcal_100g': 454,
          'proteins_100g': 6.5,
          'carbohydrates_100g': 78.0,
          'sugars_100g': 25.5,
          'added-sugars_100g': 25.5,
          'fat_100g': 13.0,
          'saturated-fat_100g': 6.5,
          'sodium_100g': 0.28
        },
        ingredients_text: 'Refined Wheat Flour, Sugar, Palm Oil'
      }
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOFFPayload
    });
    vi.stubGlobal('fetch', mockFetch);

    const memoryRepo = new ScanHistoryRepository(new MemoryStorageAdapter());
    const offClient = new OpenFoodFactsClient({}, undefined);
    const clientService = new FoodGradeClientService({
      historyRepository: memoryRepo,
      offClient
    });

    const mockDetector: IBarcodeDetectorAdapter = {
      name: 'mock_detector',
      isSupported: () => true,
      detect: async () => []
    };

    const scanner = new BarcodeScannerService(
      { duplicateCooldownMs: 1000, autoAnalyze: true },
      clientService,
      mockDetector
    );

    let barcodeDetectedCallbackCalled = false;
    let analyzedProductCallbackResult: any = null;

    const detectedCandidate: DetectedBarcodeResult = {
      rawValue: ' 890-1063-012219 ', // Needs normalization
      format: 'ean_13'
    };

    const callbacks = {
      onBarcodeDetected: (code: string) => {
        barcodeDetectedCallbackCalled = true;
        expect(code).toBe('8901063012219');
      },
      onProductAnalyzed: (res: any) => {
        analyzedProductCallbackResult = res;
      }
    };

    (scanner as any).callbacks = callbacks;

    const processed = await scanner.handleDetectedBarcode(detectedCandidate);
    expect(processed).toBe(true);
    expect(barcodeDetectedCallbackCalled).toBe(true);
    expect(analyzedProductCallbackResult).toBeDefined();
    expect(analyzedProductCallbackResult.productInput.productName).toBe('Parle-G Gluco Biscuits');
    expect(analyzedProductCallbackResult.analysisResult.grade).toBeDefined();

    // Verify stored in scan history
    const history = await clientService.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].barcode).toBe('8901063012219');

    vi.unstubAllGlobals();
  });

  it('should ignore QR code detection and NOT trigger product lookup', async () => {
    const mockClientService = {
      lookupBarcodeAndAnalyze: vi.fn()
    } as unknown as FoodGradeClientService;

    const scanner = new BarcodeScannerService(
      { autoAnalyze: true },
      mockClientService,
      { name: 'mock', isSupported: () => true, detect: async () => [] }
    );

    let detectedCallbackCalled = false;
    (scanner as any).callbacks = {
      onBarcodeDetected: () => {
        detectedCallbackCalled = true;
      }
    };

    const qrResult: DetectedBarcodeResult = {
      rawValue: 'https://example.com/some-product-page',
      format: 'qr_code'
    };

    const processed = await scanner.handleDetectedBarcode(qrResult);

    expect(processed).toBe(false);
    expect(detectedCallbackCalled).toBe(false);
    expect(mockClientService.lookupBarcodeAndAnalyze).not.toHaveBeenCalled();
  });

  it('should invalidate in-flight analysis when stop is called (Session Invalidation)', async () => {
    let resolveNetwork: (val: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveNetwork = resolve;
    });

    const mockClientService = {
      lookupBarcodeAndAnalyze: vi.fn().mockImplementation(() => pendingPromise)
    } as unknown as FoodGradeClientService;

    const scanner = new BarcodeScannerService(
      { autoAnalyze: true },
      mockClientService,
      { name: 'mock', isSupported: () => true, detect: async () => [] }
    );

    let analyzedCallbackCalled = false;
    (scanner as any).callbacks = {
      onProductAnalyzed: () => {
        analyzedCallbackCalled = true;
      }
    };

    const initialSession = scanner.getSessionId();

    const candidate: DetectedBarcodeResult = {
      rawValue: '8901063012219',
      format: 'ean_13'
    };

    // 1. Trigger detection which starts async lookup
    const handlePromise = scanner.handleDetectedBarcode(candidate, initialSession);

    // 2. STOP scanner while network lookup is in-flight
    await scanner.stop();
    expect(scanner.getSessionId()).toBeGreaterThan(initialSession);
    expect(scanner.getStatus()).toBe('stopped');

    // 3. Resolve network lookup after stop
    resolveNetwork!({
      productInput: { productName: 'Delayed Product' },
      analysisResult: { grade: 'A' }
    });

    const processed = await handlePromise;

    // 4. Prove that callback was NOT invoked for the invalidated session
    expect(processed).toBe(false);
    expect(analyzedCallbackCalled).toBe(false);
    expect(scanner.getStatus()).toBe('stopped'); // Did not get reset to previous status
  });

  it('should suppress duplicate rapid scans within cooldown interval', async () => {
    const memoryRepo = new ScanHistoryRepository(new MemoryStorageAdapter());
    const clientService = new FoodGradeClientService({ historyRepository: memoryRepo });

    const mockDetector: IBarcodeDetectorAdapter = {
      name: 'mock_detector',
      isSupported: () => true,
      detect: async () => []
    };

    const scanner = new BarcodeScannerService(
      { duplicateCooldownMs: 500, autoAnalyze: false },
      clientService,
      mockDetector
    );

    let detectionCount = 0;
    (scanner as any).callbacks = {
      onBarcodeDetected: () => {
        detectionCount++;
      }
    };

    const barcode: DetectedBarcodeResult = {
      rawValue: '8901063012219',
      format: 'ean_13'
    };

    // 1st scan - processed
    const res1 = await scanner.handleDetectedBarcode(barcode);
    expect(res1).toBe(true);
    expect(detectionCount).toBe(1);

    // 2nd scan immediately (within cooldown) - ignored!
    const res2 = await scanner.handleDetectedBarcode(barcode);
    expect(res2).toBe(false);
    expect(detectionCount).toBe(1);

    // Wait for cooldown to expire
    await new Promise(r => setTimeout(r, 550));

    // 3rd scan after cooldown - processed!
    const res3 = await scanner.handleDetectedBarcode(barcode);
    expect(res3).toBe(true);
    expect(detectionCount).toBe(2);
  });

  it('should reject barcodes with invalid GS1 Modulo-10 checksums', async () => {
    const scanner = new BarcodeScannerService(
      { validateGS1Checksum: true, autoAnalyze: false },
      new FoodGradeClientService(),
      { name: 'mock', isSupported: () => true, detect: async () => [] }
    );

    let detected = false;
    (scanner as any).callbacks = {
      onBarcodeDetected: () => {
        detected = true;
      }
    };

    // Invalid check digit (ends with 8 instead of 9 for 890106301221)
    const invalidBarcode: DetectedBarcodeResult = {
      rawValue: '8901063012218',
      format: 'ean_13'
    };

    const processed = await scanner.handleDetectedBarcode(invalidBarcode);
    expect(processed).toBe(false);
    expect(detected).toBe(false);
  });

  it('should manage pause, resume, and async stop states', async () => {
    const scanner = new BarcodeScannerService();
    expect(scanner.getStatus()).toBe('idle');

    scanner.pause();
    expect(scanner.getStatus()).toBe('paused');

    scanner.resume();
    expect(scanner.getStatus()).toBe('streaming');

    await scanner.stop();
    expect(scanner.getStatus()).toBe('stopped');
  });
});
