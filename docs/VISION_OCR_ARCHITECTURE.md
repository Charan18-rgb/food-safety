# FoodGrade — Vision & OCR Architecture Specification

## 1. System Architecture Overview

The Vision/OCR subsystem (`@foodgrade/vision`) is responsible for processing camera frames and label images into structured `OCREvidence` without directly performing food scoring or bypassing domain validation.

```
+-------------------------------------------------------------------------+
|                              IMAGE SOURCE                               |
|            (Blob / ArrayBuffer / Canvas / VideoFrame / Base64)          |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                            VISION PROVIDER                              |
|   - TesseractVisionProvider (Client-Side Local Worker)                  |
|   - GeminiVisionProvider (Secure Backend Proxy Gateway)                 |
|   - CompositeVisionProvider (Strategy-driven Cloud / Local Fallback)    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                             OCR EVIDENCE                                |
|   - rawText: Raw extracted text                                         |
|   - confidence: Numeric confidence (0.0 to 1.0)                         |
|   - blocks / lines / words: Optional layout bounding telemetry          |
|   - provider: Provider identifier & processing metadata                 |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                          @foodgrade/parser                              |
|   - Multi-column Nutrition Table Parser                                 |
|   - Parenthetical / Nesting-Aware Ingredient Parser                     |
|   - INS / E-number Additive Extractor                                   |
|   - OCR Noise Normalizer                                                |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                        STRUCTURED PRODUCT INPUT                         |
|   - NutritionProfile (energy, sugars, sat fat, sodium, fiber, protein)  |
|   - NormalizedIngredient[] (classified against knowledge base)          |
|   - DetectedAdditive[] (classified against additive knowledge base)     |
|   - DataQualityProvenance (sourceType: 'label_ocr', confidence)         |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                          @foodgrade/engine                              |
|   - Nutrition Pillar Score (0-100)                                      |
|   - Ingredient Pillar Score (0-100)                                     |
|   - Additive Pillar Score (0-100)                                       |
|   - Final Deterministic Score (0-100) & Grade (A-E)                     |
+-------------------------------------------------------------------------+
```

---

## 2. Hard Security Boundaries (Zero Client-Side Secrets)

1. **No Embedded API Keys in Frontend Options**:
   - `VisionOptions` and `GeminiVisionConfig` never accept or leak private API keys in client-side bundles or browser options.
2. **Backend Proxy Gateway**:
   - Cloud vision operations are dispatched exclusively to a secure backend endpoint (`endpoint: '/api/vision/ocr'`).
   - The backend server authenticates with Google Gemini using server-side environment variables, keeping credentials isolated from client-side network traces and storage.
3. **Offline Fallback Guarantee**:
   - When offline or when the proxy gateway is unavailable, `CompositeVisionProvider` automatically switches to `TesseractVisionProvider` (`tesseract.js`), providing 100% on-device OCR without external network requests.

---

## 3. Gemini Vision Model & Generation Parameters

- **Default Model**: `gemini-3.7-flash` (defined via `DEFAULT_GEMINI_VISION_MODEL`).
- **Why `gemini-3.7-flash` is Optimal**:
  - High OCR fidelity for dense, multi-column nutritional panels, micro-print ingredient lists, and parenthetical INS numbers on curved packaging.
  - Sub-second multimodal token latency suitable for real-time mobile scanning workflows.
  - Hybrid visual reasoning for disambiguating OCR noise without altering literal nutrient values.
- **Generation Parameters**:
  - `temperature: 0.0` (strict deterministic character/digit transcription without creative hallucination).
  - `maxOutputTokens: 4096` (ample headroom for long multi-column declarations).
  - `topP: 1.0`.

---

## 4. Staged Pipeline Execution API

`VisionPipeline` exposes each step independently to allow user validation and editing in the UI:

```ts
// 1. OCR Extraction Only
const ocrEvidence = await pipeline.extractOCREvidence(image);

// 2. Parser Normalization Only
const parsedResult = pipeline.parseEvidence(ocrEvidence);

// 3. Assembly with Provenance
const productInput = pipeline.assembleProductInput(parsedResult, ocrEvidence);

// 4. Deterministic Engine Scoring
const analysisResult = pipeline.evaluateProductInput(productInput);

// Complete End-to-End Execution
const result = await pipeline.processImage(image);
```
