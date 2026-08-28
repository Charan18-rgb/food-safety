/**
 * Typed domain and infrastructure errors for @foodgrade/client-services.
 */

export class FoodGradeError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ProductNotFoundError extends FoodGradeError {
  constructor(public readonly barcode: string) {
    super(`Product with barcode "${barcode}" was not found on Open Food Facts`, 'PRODUCT_NOT_FOUND');
  }
}

export class NetworkTimeoutError extends FoodGradeError {
  constructor(public readonly url: string, public readonly timeoutMs: number) {
    super(`Request to ${url} timed out after ${timeoutMs}ms`, 'NETWORK_TIMEOUT');
  }
}

export class NetworkOfflineError extends FoodGradeError {
  constructor(message = 'Network is unreachable or offline') {
    super(message, 'NETWORK_OFFLINE');
  }
}

export class RateLimitExceededError extends FoodGradeError {
  constructor(public readonly retryAfterSeconds?: number) {
    super(
      `Open Food Facts API rate limit exceeded (HTTP 429)${retryAfterSeconds ? `, retry after ${retryAfterSeconds}s` : ''}`,
      'RATE_LIMIT_EXCEEDED'
    );
  }
}

export class InvalidOFFResponseError extends FoodGradeError {
  constructor(message: string, public readonly rawResponse?: unknown) {
    super(message, 'INVALID_OFF_RESPONSE');
  }
}

export class StorageError extends FoodGradeError {
  constructor(message: string, public readonly cause?: unknown) {
    super(message, 'STORAGE_ERROR');
  }
}

export class InvalidBarcodeError extends FoodGradeError {
  constructor(public readonly rawBarcode: string, reason: string) {
    super(`Invalid barcode "${rawBarcode}": ${reason}`, 'INVALID_BARCODE');
  }
}
