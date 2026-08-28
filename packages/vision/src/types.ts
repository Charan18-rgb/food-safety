import { ProductInput, AnalysisResult } from '@foodgrade/shared-types';
import { ParsedLabelResult, ParseOptions } from '@foodgrade/parser';
import { ScoringConfigV1 } from '@foodgrade/engine';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRWord {
  text: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface OCRLine {
  text: string;
  confidence: number;
  words?: OCRWord[];
  boundingBox?: BoundingBox;
}

export interface OCRBlock {
  text: string;
  confidence: number;
  lines?: OCRLine[];
  boundingBox?: BoundingBox;
}

export interface OCREvidence {
  rawText: string;
  confidence: number; // 0.0 to 1.0
  provider: string;
  processingTimeMs: number;
  blocks?: OCRBlock[];
  lines?: string[];
  metadata?: Record<string, unknown>;
}

export interface VisionOptions {
  language?: string; // OCR language (default: 'eng')
  timeoutMs?: number; // Recognition timeout in ms (default: 15000)
  normalizeText?: boolean; // Whether to run @foodgrade/parser OCR normalizer (default: true)
  model?: string; // Model identifier for cloud providers
  signal?: AbortSignal; // AbortSignal for cancellation
  sessionId?: number; // Monotonically increasing session counter for invalidation
}

export type VisionImageSource =
  | string // base64 data URI, URL, or image file path
  | ArrayBuffer
  | Uint8Array
  | Blob
  | ImageData
  | HTMLCanvasElement
  | HTMLImageElement
  | HTMLVideoElement;

export interface VisionPipelineResult {
  ocrEvidence: OCREvidence;
  parsedLabelResult: ParsedLabelResult;
  productInput: ProductInput;
  analysisResult: AnalysisResult;
  pipelineTimeMs: number;
}

export interface VisionPipelineConfig {
  visionOptions?: VisionOptions;
  parserOptions?: ParseOptions;
  engineConfig?: Partial<ScoringConfigV1>;
}
