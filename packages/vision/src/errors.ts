export class VisionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class VisionRecognitionTimeoutError extends VisionError {
  constructor(message = 'Vision recognition operation timed out') {
    super(message, 'VISION_TIMEOUT');
  }
}

export class VisionInvalidImageError extends VisionError {
  constructor(message = 'The provided image source is invalid, empty, or cannot be processed') {
    super(message, 'VISION_INVALID_IMAGE');
  }
}

export class VisionProviderUnavailableError extends VisionError {
  constructor(message = 'No requested vision/OCR provider is currently available') {
    super(message, 'VISION_PROVIDER_UNAVAILABLE');
  }
}

export class VisionEndpointMissingError extends VisionError {
  constructor(message = 'A valid backend proxy endpoint URL is required for cloud vision transcription') {
    super(message, 'VISION_ENDPOINT_MISSING');
  }
}

export class VisionCancelledError extends VisionError {
  constructor(message = 'Vision OCR operation was cancelled or invalidated by a newer session') {
    super(message, 'VISION_CANCELLED');
  }
}

export class VisionNetworkError extends VisionError {
  constructor(message = 'Network request failed while connecting to vision API') {
    super(message, 'VISION_NETWORK_ERROR');
  }
}
