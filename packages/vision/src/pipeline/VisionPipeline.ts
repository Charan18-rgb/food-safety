import { IVisionProvider } from '../providers/IVisionProvider.js';
import { CompositeVisionProvider } from '../providers/CompositeVisionProvider.js';
import {
  VisionImageSource,
  VisionOptions,
  VisionPipelineConfig,
  VisionPipelineResult,
  OCREvidence
} from '../types.js';
import { parseLabelText, ParsedLabelResult, ParseOptions } from '@foodgrade/parser';
import { evaluateProduct, ScoringConfigV1 } from '@foodgrade/engine';
import { ProductInput, AnalysisResult } from '@foodgrade/shared-types';
import { VisionCancelledError } from '../errors.js';

export class VisionPipeline {
  private provider: IVisionProvider;
  private config: VisionPipelineConfig;
  private currentSessionId = 0;
  private activeAbortController?: AbortController;

  constructor(provider?: IVisionProvider, config: VisionPipelineConfig = {}) {
    this.provider = provider || new CompositeVisionProvider();
    this.config = config;
  }

  getProvider(): IVisionProvider {
    return this.provider;
  }

  /**
   * Returns current monotonically increasing pipeline session generation ID.
   */
  getSessionId(): number {
    return this.currentSessionId;
  }

  /**
   * Invalidates all running asynchronous OCR, parsing, and engine evaluation operations.
   */
  cancel(): void {
    this.currentSessionId++;
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = undefined;
    }
  }

  /**
   * Alias for cancel() to halt and release resources.
   */
  stop(): void {
    this.cancel();
  }

  /**
   * Stage 1: Optical Character Recognition
   * Extracts raw OCREvidence from an image source without performing parsing or scoring.
   */
  async extractOCREvidence(
    image: VisionImageSource,
    options?: VisionOptions
  ): Promise<OCREvidence> {
    const opts = options || this.config.visionOptions;
    const session = opts?.sessionId ?? this.currentSessionId;

    if (this.currentSessionId !== session || opts?.signal?.aborted) {
      throw new VisionCancelledError();
    }

    const evidence = await this.provider.recognize(image, {
      ...opts,
      sessionId: session
    });

    if (this.currentSessionId !== session || opts?.signal?.aborted) {
      throw new VisionCancelledError();
    }

    return evidence;
  }

  /**
   * Stage 2: Label Text Parsing
   * Uses @foodgrade/parser to interpret raw OCR text into structured nutrition, ingredients, and additives.
   */
  parseEvidence(
    ocrEvidence: OCREvidence,
    options?: ParseOptions,
    sessionId?: number
  ): ParsedLabelResult {
    const session = sessionId ?? this.currentSessionId;
    if (this.currentSessionId !== session) {
      throw new VisionCancelledError();
    }

    const opts = options || this.config.parserOptions;
    return parseLabelText(ocrEvidence.rawText, opts);
  }

  /**
   * Assembles a validated ProductInput from parsed label data and provenance.
   */
  assembleProductInput(
    parsedResult: ParsedLabelResult,
    ocrEvidence: OCREvidence,
    sessionId?: number
  ): ProductInput {
    const session = sessionId ?? this.currentSessionId;
    if (this.currentSessionId !== session) {
      throw new VisionCancelledError();
    }

    return {
      ...parsedResult.productInput,
      provenance: {
        ...parsedResult.productInput.provenance,
        sourceType: 'label_ocr',
        observationMode: 'directly_observed',
        sourceId: ocrEvidence.provider,
        rawConfidence: Math.round(
          ((parsedResult.productInput.provenance.rawConfidence * 0.7 + ocrEvidence.confidence * 0.3)) * 100
        ) / 100
      }
    };
  }

  /**
   * Stage 3: FoodGrade Engine Evaluation
   * Evaluates structured product input deterministically using @foodgrade/engine.
   */
  evaluateProductInput(
    productInput: ProductInput,
    engineConfig?: Partial<ScoringConfigV1>,
    sessionId?: number
  ): AnalysisResult {
    const session = sessionId ?? this.currentSessionId;
    if (this.currentSessionId !== session) {
      throw new VisionCancelledError();
    }

    const cfg = engineConfig || this.config.engineConfig;
    return evaluateProduct(productInput, cfg as any);
  }

  /**
   * Complete end-to-end food label vision pipeline:
   * Executes Stage 1 -> Stage 2 -> Assembly -> Stage 3.
   * Cancels automatically if superseded by a newer call or explicit cancel().
   */
  async processImage(
    image: VisionImageSource,
    overrideConfig?: VisionPipelineConfig
  ): Promise<VisionPipelineResult> {
    this.currentSessionId++;
    const session = this.currentSessionId;

    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }
    this.activeAbortController = new AbortController();
    const internalSignal = this.activeAbortController.signal;

    const pipelineStartTime = Date.now();
    const activeConfig: VisionPipelineConfig = {
      ...this.config,
      ...overrideConfig
    };

    const combinedOptions: VisionOptions = {
      ...activeConfig.visionOptions,
      signal: overrideConfig?.visionOptions?.signal || internalSignal,
      sessionId: session
    };

    // Stage 1: OCR Extraction
    const ocrEvidence = await this.extractOCREvidence(image, combinedOptions);

    if (this.currentSessionId !== session || internalSignal.aborted) {
      throw new VisionCancelledError();
    }

    // Stage 2: Label Parsing
    const parsedLabelResult = this.parseEvidence(ocrEvidence, activeConfig.parserOptions, session);

    if (this.currentSessionId !== session || internalSignal.aborted) {
      throw new VisionCancelledError();
    }

    // Assembly: ProductInput with provenance
    const productInput = this.assembleProductInput(parsedLabelResult, ocrEvidence, session);

    // Stage 3: Deterministic Engine Scoring
    const analysisResult = this.evaluateProductInput(productInput, activeConfig.engineConfig, session);

    if (this.currentSessionId !== session || internalSignal.aborted) {
      throw new VisionCancelledError();
    }

    const pipelineTimeMs = Date.now() - startTime(pipelineStartTime);

    return {
      ocrEvidence,
      parsedLabelResult,
      productInput,
      analysisResult,
      pipelineTimeMs
    };
  }

  async terminate(): Promise<void> {
    this.cancel();
    if (typeof this.provider.terminate === 'function') {
      await this.provider.terminate();
    }
  }
}

function startTime(start: number): number {
  return start;
}
