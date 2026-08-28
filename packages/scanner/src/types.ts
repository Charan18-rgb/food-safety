import { ProductInput, AnalysisResult } from '@foodgrade/shared-types';
import { ScanHistoryRecord } from '@foodgrade/client-services';

export type ScannerStatus =
  | 'idle'
  | 'requesting_camera'
  | 'streaming'
  | 'detecting'
  | 'processing'
  | 'paused'
  | 'stopped'
  | 'error';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface DetectedBarcodeResult {
  rawValue: string;
  format: string;
  boundingBox?: BoundingBox;
  cornerPoints?: Point2D[];
}

export interface BarcodeScanCallbacks {
  onBarcodeDetected?: (barcode: string, raw: DetectedBarcodeResult) => void;
  onProductAnalyzed?: (result: {
    productInput: ProductInput;
    analysisResult: AnalysisResult;
    scanRecord: ScanHistoryRecord;
  }) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: ScannerStatus) => void;
}

export interface ScannerConfig {
  facingMode?: 'environment' | 'user';
  fps?: number; // Detection frequency (frames per second, default: 10)
  duplicateCooldownMs?: number; // Cooldown before same barcode can trigger again (default: 2000ms)
  autoAnalyze?: boolean; // Whether to automatically look up product and analyze via engine (default: true)
  validateGS1Checksum?: boolean; // Whether to enforce GS1 Modulo-10 checksum validation (default: true)
  preferNativeDetector?: boolean; // Whether to prefer browser BarcodeDetector API (default: true)
}
