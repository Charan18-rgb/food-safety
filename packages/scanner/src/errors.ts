/**
 * Typed domain errors for camera and barcode scanning.
 */

export class ScannerError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CameraPermissionDeniedError extends ScannerError {
  constructor(message = 'Camera access was denied by the user or system permission policy') {
    super(message, 'CAMERA_PERMISSION_DENIED');
  }
}

export class CameraNotFoundError extends ScannerError {
  constructor(message = 'No video capture device was found on this system') {
    super(message, 'CAMERA_NOT_FOUND');
  }
}

export class CameraInUseError extends ScannerError {
  constructor(message = 'The requested camera is currently in use by another application') {
    super(message, 'CAMERA_IN_USE');
  }
}

export class CameraNotSupportedError extends ScannerError {
  constructor(message = 'navigator.mediaDevices.getUserMedia is not supported in this browser context (requires HTTPS)') {
    super(message, 'CAMERA_NOT_SUPPORTED');
  }
}

export class BarcodeDetectorNotSupportedError extends ScannerError {
  constructor(message = 'No supported barcode detection engine (native BarcodeDetector or software fallback) is available') {
    super(message, 'BARCODE_DETECTOR_NOT_SUPPORTED');
  }
}
