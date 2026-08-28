import {
  ScannerStatus,
  BarcodeScanCallbacks,
  ScannerConfig,
  DetectedBarcodeResult
} from './types.js';
import { CameraManager, CameraOptions } from './camera/CameraManager.js';
import { IBarcodeDetectorAdapter } from './detection/IBarcodeDetectorAdapter.js';
import { CompositeBarcodeDetector } from './detection/CompositeBarcodeDetector.js';
import {
  FoodGradeClientService,
  normalizeBarcode,
  validateGS1CheckDigit
} from '@foodgrade/client-services';
import { BarcodeDetectorNotSupportedError } from './errors.js';

export const DEFAULT_SCANNER_FPS = 10;
export const DEFAULT_DUPLICATE_COOLDOWN_MS = 2000;

export const NON_PRODUCT_FORMATS = new Set([
  'qr_code',
  'qrcode',
  'aztec',
  'data_matrix',
  'pdf417'
]);

export class BarcodeScannerService {
  private cameraManager: CameraManager;
  private detector: IBarcodeDetectorAdapter;
  private clientService: FoodGradeClientService;
  private status: ScannerStatus = 'idle';
  private callbacks: BarcodeScanCallbacks = {};
  private config: ScannerConfig;

  private sessionId = 0;
  private loopIntervalId: ReturnType<typeof setInterval> | null = null;
  private isProcessingFrame = false;
  private lastScannedBarcode: string | null = null;
  private lastScannedTimestamp = 0;
  private isPaused = false;

  constructor(
    config: ScannerConfig = {},
    clientService?: FoodGradeClientService,
    detector?: IBarcodeDetectorAdapter,
    cameraManager?: CameraManager
  ) {
    this.config = {
      facingMode: config.facingMode || 'environment',
      fps: config.fps || DEFAULT_SCANNER_FPS,
      duplicateCooldownMs: config.duplicateCooldownMs || DEFAULT_DUPLICATE_COOLDOWN_MS,
      autoAnalyze: config.autoAnalyze !== false,
      validateGS1Checksum: config.validateGS1Checksum !== false,
      preferNativeDetector: config.preferNativeDetector !== false
    };

    this.clientService = clientService || new FoodGradeClientService();
    this.detector = detector || new CompositeBarcodeDetector(this.config.preferNativeDetector);
    this.cameraManager = cameraManager || new CameraManager();
  }

  public getStatus(): ScannerStatus {
    return this.status;
  }

  public getSessionId(): number {
    return this.sessionId;
  }

  private setStatus(newStatus: ScannerStatus): void {
    this.status = newStatus;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(newStatus);
    }
  }

  /**
   * Starts camera stream on the video element and begins the continuous barcode scan loop.
   */
  async start(videoElement: HTMLVideoElement, callbacks: BarcodeScanCallbacks = {}): Promise<void> {
    await this.stop();

    // Increment session generation to track current active scan session
    this.sessionId++;
    const currentSession = this.sessionId;

    this.callbacks = callbacks;
    this.isPaused = false;

    if (!this.detector.isSupported()) {
      const err = new BarcodeDetectorNotSupportedError();
      this.setStatus('error');
      if (this.callbacks.onError) this.callbacks.onError(err);
      throw err;
    }

    try {
      this.setStatus('requesting_camera');
      const cameraOpts: CameraOptions = {
        facingMode: this.config.facingMode
      };
      await this.cameraManager.startCamera(videoElement, cameraOpts);

      // Check if session was stopped while waiting for camera permissions
      if (this.sessionId !== currentSession) {
        this.cameraManager.stopCamera();
        return;
      }

      this.setStatus('streaming');
      this.startDetectionLoop(videoElement, currentSession);
    } catch (err) {
      if (this.sessionId === currentSession) {
        this.setStatus('error');
        if (this.callbacks.onError) this.callbacks.onError(err as Error);
      }
      throw err;
    }
  }

  private startDetectionLoop(videoElement: HTMLVideoElement, session: number): void {
    const intervalMs = Math.floor(1000 / (this.config.fps || DEFAULT_SCANNER_FPS));

    this.loopIntervalId = setInterval(async () => {
      if (this.sessionId !== session || this.isPaused || this.isProcessingFrame || !this.cameraManager.isPlaying()) {
        return;
      }

      // Check that video has valid dimensions and is ready
      if (videoElement.readyState < 2 || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        return;
      }

      this.isProcessingFrame = true;

      try {
        const results = await this.detector.detect(videoElement);
        if (this.sessionId !== session || this.isPaused || (this.status as ScannerStatus) === 'stopped') {
          return;
        }

        if (results && results.length > 0) {
          await this.handleDetectedBarcode(results[0], session);
        }
      } catch (err) {
        if (this.sessionId === session && this.callbacks.onError) {
          this.callbacks.onError(err as Error);
        }
      } finally {
        this.isProcessingFrame = false;
      }
    }, intervalMs);
  }

  /**
   * Processes a detected raw barcode candidate with normalization, GS1 checksum verification,
   * duplicate suppression, session invalidation checks, and automated FoodGrade evaluation.
   */
  public async handleDetectedBarcode(
    detected: DetectedBarcodeResult,
    targetSessionId?: number
  ): Promise<boolean> {
    const session = targetSessionId !== undefined ? targetSessionId : this.sessionId;

    if (!detected || !detected.rawValue || this.sessionId !== session || this.status === 'stopped') {
      return false;
    }

    // 1. Explicitly ignore QR codes and non-food-product matrix formats
    const fmt = (detected.format || '').toLowerCase();
    if (NON_PRODUCT_FORMATS.has(fmt)) {
      return false;
    }

    // 2. Barcode normalization
    let normalized: string;
    try {
      normalized = normalizeBarcode(detected.rawValue);
    } catch {
      return false;
    }

    // 3. Optional GS1 Modulo-10 checksum validation
    if (this.config.validateGS1Checksum && !validateGS1CheckDigit(normalized)) {
      return false;
    }

    // 4. Duplicate cooldown check
    const now = Date.now();
    const cooldown = this.config.duplicateCooldownMs || DEFAULT_DUPLICATE_COOLDOWN_MS;
    if (this.lastScannedBarcode === normalized && now - this.lastScannedTimestamp < cooldown) {
      return false;
    }

    this.lastScannedBarcode = normalized;
    this.lastScannedTimestamp = now;

    // Check session before callback
    if (this.sessionId !== session) {
      return false;
    }

    // Fire detection callback
    if (this.callbacks.onBarcodeDetected) {
      this.callbacks.onBarcodeDetected(normalized, detected);
    }

    // Auto-analyze via client-services and engine
    if (this.config.autoAnalyze) {
      const prevStatus = this.status;
      if (this.sessionId === session) {
        this.setStatus('processing');
      }

      try {
        const result = await this.clientService.lookupBarcodeAndAnalyze(normalized);

        // Check if session was stopped or invalidated while network request was in-flight
        if (this.sessionId !== session || (this.status as ScannerStatus) === 'stopped') {
          return false;
        }

        if (result && this.callbacks.onProductAnalyzed) {
          this.callbacks.onProductAnalyzed(result);
        }
      } catch (err) {
        if (this.sessionId === session && this.callbacks.onError) {
          this.callbacks.onError(err as Error);
        }
      } finally {
        if (this.sessionId === session && (this.status as ScannerStatus) === 'processing') {
          this.setStatus(prevStatus);
        }
      }
    }

    return true;
  }

  /**
   * Pauses frame scanning while keeping the camera stream open.
   */
  pause(): void {
    this.isPaused = true;
    this.setStatus('paused');
  }

  /**
   * Resumes frame scanning.
   */
  resume(): void {
    this.isPaused = false;
    this.setStatus('streaming');
  }

  /**
   * Stops camera stream, clears detection loop, cleans up detector resources,
   * and invalidates all in-flight asynchronous operations.
   */
  async stop(): Promise<void> {
    // Invalidate current session so in-flight async operations abort
    this.sessionId++;

    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }

    this.cameraManager.stopCamera();

    if (typeof this.detector.stop === 'function') {
      try {
        await this.detector.stop();
      } catch {
        // Ignore detector teardown error
      }
    }

    this.isProcessingFrame = false;
    this.isPaused = false;
    this.setStatus('stopped');
  }

  /**
   * Toggles camera torch if supported.
   */
  async setTorch(enabled: boolean): Promise<boolean> {
    return this.cameraManager.setTorch(enabled);
  }

  hasTorch(): boolean {
    return this.cameraManager.hasTorch();
  }

  getCameraManager(): CameraManager {
    return this.cameraManager;
  }
}
