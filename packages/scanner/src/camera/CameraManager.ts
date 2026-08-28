import {
  CameraPermissionDeniedError,
  CameraNotFoundError,
  CameraInUseError,
  CameraNotSupportedError
} from '../errors.js';

export interface CameraOptions {
  facingMode?: 'environment' | 'user';
  width?: number;
  height?: number;
}

export class CameraManager {
  private currentStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isStreaming = false;

  /**
   * Starts camera stream and attaches it to the specified video element.
   */
  async startCamera(
    videoElement: HTMLVideoElement,
    options: CameraOptions = {}
  ): Promise<MediaStream> {
    this.stopCamera();

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      throw new CameraNotSupportedError();
    }

    this.videoElement = videoElement;
    const facingMode = options.facingMode || 'environment';

    const idealConstraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: options.width || 1280 },
        height: { ideal: options.height || 720 }
      }
    };

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia(idealConstraints);
    } catch (err: unknown) {
      const errorName = (err as { name?: string })?.name;

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        throw new CameraPermissionDeniedError();
      }
      if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        throw new CameraNotFoundError();
      }
      if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        throw new CameraInUseError();
      }

      // Try fallback with basic video constraint if ideal failed (e.g. overconstrained)
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      } catch (fallbackErr: unknown) {
        const fallbackName = (fallbackErr as { name?: string })?.name;
        if (fallbackName === 'NotAllowedError' || fallbackName === 'PermissionDeniedError') {
          throw new CameraPermissionDeniedError();
        }
        throw new CameraNotFoundError(`Failed to acquire camera: ${(fallbackErr as Error).message}`);
      }
    }

    this.currentStream = stream;
    this.videoElement.srcObject = stream;
    this.videoElement.setAttribute('playsinline', 'true'); // Required for iOS Safari inline playback

    try {
      await this.videoElement.play();
      this.isStreaming = true;
    } catch {
      // Autoplay error or user gesture requirement - stream is still active
      this.isStreaming = true;
    }

    return stream;
  }

  /**
   * Stops and releases all active camera tracks.
   */
  stopCamera(): void {
    if (this.currentStream) {
      const tracks = this.currentStream.getTracks();
      for (const track of tracks) {
        track.stop();
      }
      this.currentStream = null;
    }

    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    this.isStreaming = false;
  }

  /**
   * Toggles flashlight/torch if supported by the camera hardware.
   */
  async setTorch(enabled: boolean): Promise<boolean> {
    if (!this.currentStream) return false;

    const track = this.currentStream.getVideoTracks()[0];
    if (!track) return false;

    const capabilities = typeof track.getCapabilities === 'function' ? (track.getCapabilities() as Record<string, unknown>) : null;
    if (!capabilities || !capabilities.torch) {
      return false;
    }

    try {
      await (track.applyConstraints as (c: unknown) => Promise<void>)({
        advanced: [{ torch: enabled }]
      });
      return true;
    } catch {
      return false;
    }
  }

  hasTorch(): boolean {
    if (!this.currentStream) return false;
    const track = this.currentStream.getVideoTracks()[0];
    if (!track || typeof track.getCapabilities !== 'function') return false;
    const capabilities = track.getCapabilities() as Record<string, unknown>;
    return Boolean(capabilities?.torch);
  }

  isPlaying(): boolean {
    return this.isStreaming;
  }

  getStream(): MediaStream | null {
    return this.currentStream;
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }
}
