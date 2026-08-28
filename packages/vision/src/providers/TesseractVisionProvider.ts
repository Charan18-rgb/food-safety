import { createWorker, Worker } from 'tesseract.js';
import { IVisionProvider } from './IVisionProvider.js';
import {
  OCREvidence,
  VisionImageSource,
  VisionOptions,
  OCRBlock,
  OCRLine,
  OCRWord
} from '../types.js';
import {
  VisionRecognitionTimeoutError,
  VisionInvalidImageError,
  VisionCancelledError
} from '../errors.js';

export class TesseractVisionProvider implements IVisionProvider {
  readonly name = 'tesseract_offline_ocr';
  private worker: Worker | null = null;
  private currentLanguage = 'eng';

  isAvailable(): boolean {
    return typeof createWorker === 'function';
  }

  private async getWorker(language = 'eng'): Promise<Worker> {
    if (this.worker && this.currentLanguage === language) {
      return this.worker;
    }

    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }

    const worker = await createWorker(language);
    this.worker = worker;
    this.currentLanguage = language;
    return worker;
  }

  async recognize(image: VisionImageSource, options: VisionOptions = {}): Promise<OCREvidence> {
    if (options.signal?.aborted) {
      throw new VisionCancelledError('Recognition cancelled before start');
    }
    if (!image) {
      throw new VisionInvalidImageError('Image source cannot be null or undefined');
    }

    const startTime = Date.now();
    const language = options.language || 'eng';
    const timeoutMs = options.timeoutMs || 15000;

    const worker = await this.getWorker(language);

    const recognitionPromise = (async () => {
      const result = await worker.recognize(image as any);
      return result;
    })();

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new VisionRecognitionTimeoutError(`Tesseract OCR timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const { data } = await Promise.race([recognitionPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      const processingTimeMs = Date.now() - startTime;

      // Extract structured blocks, lines, and words
      const blocks: OCRBlock[] = (data.blocks || []).map(b => {
        const lines: OCRLine[] = (b.lines || []).map(l => {
          const words: OCRWord[] = (l.words || []).map(w => ({
            text: w.text,
            confidence: Math.max(0, Math.min(1, (w.confidence || 0) / 100)),
            boundingBox: w.bbox
              ? {
                  x: w.bbox.x0,
                  y: w.bbox.y0,
                  width: w.bbox.x1 - w.bbox.x0,
                  height: w.bbox.y1 - w.bbox.y0
                }
              : undefined
          }));

          return {
            text: l.text,
            confidence: Math.max(0, Math.min(1, (l.confidence || 0) / 100)),
            words,
            boundingBox: l.bbox
              ? {
                  x: l.bbox.x0,
                  y: l.bbox.y0,
                  width: l.bbox.x1 - l.bbox.x0,
                  height: l.bbox.y1 - l.bbox.y0
                }
              : undefined
          };
        });

        return {
          text: b.text,
          confidence: Math.max(0, Math.min(1, (b.confidence || 0) / 100)),
          lines,
          boundingBox: b.bbox
            ? {
                x: b.bbox.x0,
                y: b.bbox.y0,
                width: b.bbox.x1 - b.bbox.x0,
                height: b.bbox.y1 - b.bbox.y0
              }
            : undefined
        };
      });

      const rawText = data.text || '';
      const rawLines = data.lines?.map(l => l.text.trim()).filter(Boolean) || rawText.split('\n').map(l => l.trim()).filter(Boolean);
      const confidence = Math.max(0, Math.min(1, (data.confidence || 0) / 100));

      return {
        rawText,
        confidence,
        provider: this.name,
        processingTimeMs,
        blocks,
        lines: rawLines,
        metadata: {
          version: data.version,
          tesseractConfidence: data.confidence
        }
      };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
