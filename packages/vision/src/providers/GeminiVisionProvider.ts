import { IVisionProvider } from './IVisionProvider.js';
import {
  OCREvidence,
  VisionImageSource,
  VisionOptions
} from '../types.js';
import {
  VisionError,
  VisionEndpointMissingError,
  VisionInvalidImageError,
  VisionNetworkError,
  VisionRecognitionTimeoutError,
  VisionCancelledError
} from '../errors.js';

export const DEFAULT_GEMINI_VISION_MODEL = 'gemini-3.8-flash';

export const GEMINI_OCR_SYSTEM_PROMPT = `You are a high-precision OCR transcription engine for food package labels.
Examine the provided image of a packaged food label and extract ALL visible text with maximum fidelity.

Strict Instructions:
1. Transcribe the product name, brand, and category if visible.
2. Transcribe the entire Nutritional Information / Nutrition Facts table line by line, preserving all numbers, values, and units (e.g. per 100g, per serve, kcal, g, mg, %).
3. Transcribe the complete Ingredients list including sub-ingredients in parentheses and percentages.
4. Transcribe all food additives, INS codes, and E-numbers.
5. Do NOT summarize, evaluate, or score the food product. Output only the verbatim visible label text.`;

/**
 * Calculates empirical OCR quality and structural completeness score for label text.
 * Used when the vision gateway does not return a provider-calculated confidence metric.
 */
export function calculateTextStructureConfidence(text: string): number {
  if (!text || text.trim().length === 0) return 0.0;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return 0.0;

  // 1. Structural section headers
  const hasNutritionHeader = /\b(?:nutritional?\s*information|nutrition\s*facts|typical\s*values)\b/i.test(text);
  const hasIngredientsHeader = /\b(?:ingredients|contents|composition)\b/i.test(text);

  // 2. Numeric nutrition declarations with units
  const numericLines = lines.filter(l => /\b\d+(?:\.\d+)?\s*(?:g|mg|mcg|kcal|kJ|%)\b/i.test(l)).length;
  const numericRatio = Math.min(1.0, numericLines / Math.max(1, lines.length));

  // 3. Alphanumeric cleanliness ratio
  const totalChars = text.length;
  const cleanChars = text.replace(/[^a-zA-Z0-9\s.,()%:-]/g, '').length;
  const cleanlinessRatio = totalChars > 0 ? cleanChars / totalChars : 0;

  let score = 0.45 * cleanlinessRatio + 0.35 * numericRatio;
  if (hasNutritionHeader) score += 0.12;
  if (hasIngredientsHeader) score += 0.08;

  return Math.round(Math.max(0.1, Math.min(1.0, score)) * 100) / 100;
}

export interface GeminiVisionConfig {
  endpoint?: string; // Secure backend proxy endpoint (e.g. /api/vision/ocr)
  headers?: Record<string, string>;
  fetchFn?: typeof fetch;
  model?: string;
}

export class GeminiVisionProvider implements IVisionProvider {
  readonly name = 'gemini_cloud_vision';
  private config: GeminiVisionConfig;

  constructor(config: GeminiVisionConfig = {}) {
    this.config = {
      endpoint: config.endpoint || (typeof process !== 'undefined' ? process.env?.VISION_PROXY_ENDPOINT : undefined),
      headers: config.headers,
      fetchFn: config.fetchFn,
      model: config.model || DEFAULT_GEMINI_VISION_MODEL
    };
  }

  getModel(): string {
    return this.config.model || DEFAULT_GEMINI_VISION_MODEL;
  }

  isAvailable(): boolean {
    return Boolean(this.config.endpoint);
  }

  /**
   * Helper to convert image source into base64 string and mime type.
   */
  private async convertImageToBase64(image: VisionImageSource): Promise<{ base64Data: string; mimeType: string }> {
    if (typeof image === 'string') {
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          return { mimeType: matches[1], base64Data: matches[2] };
        }
      }
      return { mimeType: 'image/jpeg', base64Data: image };
    }

    if (image instanceof ArrayBuffer) {
      const bytes = new Uint8Array(image);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
      return { mimeType: 'image/jpeg', base64Data: b64 };
    }

    if (image instanceof Uint8Array) {
      const b64 = typeof Buffer !== 'undefined'
        ? Buffer.from(image).toString('base64')
        : btoa(String.fromCharCode(...image));
      return { mimeType: 'image/jpeg', base64Data: b64 };
    }

    if (typeof Blob !== 'undefined' && image instanceof Blob) {
      const arrayBuffer = await image.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
      return { mimeType: image.type || 'image/jpeg', base64Data: b64 };
    }

    if (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) {
      const dataUrl = image.toDataURL('image/jpeg', 0.9);
      const b64 = dataUrl.split(',')[1];
      return { mimeType: 'image/jpeg', base64Data: b64 };
    }

    throw new VisionInvalidImageError('Unsupported image input type for Gemini vision provider');
  }

  async recognize(image: VisionImageSource, options: VisionOptions = {}): Promise<OCREvidence> {
    if (options.signal?.aborted) {
      throw new VisionCancelledError('Recognition cancelled before start');
    }

    const endpoint = this.config.endpoint;

    if (!endpoint) {
      throw new VisionEndpointMissingError('A backend proxy endpoint is required for cloud vision transcription');
    }

    const startTime = Date.now();
    const model = options.model || this.config.model || DEFAULT_GEMINI_VISION_MODEL;
    const timeoutMs = options.timeoutMs || 15000;
    const fetchFn = this.config.fetchFn || (typeof fetch !== 'undefined' ? fetch : undefined);

    if (!fetchFn) {
      throw new VisionNetworkError('No fetch implementation available for vision network requests');
    }

    const { base64Data, mimeType } = await this.convertImageToBase64(image);

    const generationConfig: Record<string, unknown> = {
      maxOutputTokens: 4096
    };


    const requestPayload = {
      prompt: GEMINI_OCR_SYSTEM_PROMPT,
      model,
      image: {
        mimeType,
        data: base64Data
      },
      generationConfig
    };

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let signalToUse = options.signal || controller?.signal;

    if (options.signal && controller) {
      // Listen to options.signal abort event to trigger controller abort
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.headers || {})
        },
        body: JSON.stringify(requestPayload),
        signal: signalToUse
      });

      if (options.signal?.aborted) {
        throw new VisionCancelledError();
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new VisionNetworkError(`Cloud Vision proxy error (${response.status}): ${errorText}`);
      }

      const json = (await response.json()) as any;
      const rawText = json.rawText || json.text || json.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const confidence = typeof json.confidence === 'number'
        ? Math.max(0, Math.min(1, json.confidence))
        : calculateTextStructureConfidence(rawText);

      const processingTimeMs = Date.now() - startTime;
      const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);

      return {
        rawText,
        confidence,
        provider: this.name,
        processingTimeMs,
        lines,
        metadata: {
          model,
          proxyResponse: true
        }
      };
    } catch (err: unknown) {
      if (options.signal?.aborted) {
        throw new VisionCancelledError();
      }
      if ((err as Error)?.name === 'AbortError') {
        throw new VisionRecognitionTimeoutError(`Cloud Vision proxy request timed out after ${timeoutMs}ms`);
      }
      if (err instanceof VisionError) {
        throw err;
      }
      throw new VisionNetworkError(`Failed to contact Cloud Vision proxy: ${(err as Error).message}`);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}
