# FoodGrade — System Architecture & Design Principles

## 1. Architectural Mission

The central architectural requirement of FoodGrade is:
**The domain and scoring engine must remain 100% independent from the presentation layer, device capabilities, and deployment platform.**

Whether executed inside:
- A mobile browser (PWA)
- A native Android WebView (Capacitor)
- A Node.js backend or edge worker
- An AI code agent or visual builder (Lovable / Manus)

...the exact same pure function evaluation of product data produces the exact same score, grade, and explanations.

---

## 2. Package Boundaries & Responsibilities

### 2.1 `@foodgrade/shared-types`
- **Purpose**: Single source of truth for domain models, Zod validation schemas, and TypeScript interfaces.
- **Constraints**: Zero runtime dependencies other than `zod`. Zero DOM/browser APIs. Zero network calls.
- **Exports**:
  - `ProductInput`
  - `NutritionModel` & `NutrientValue` (distinguishing measured, declared, inferred, missing, and unavailable)
  - `NormalizedIngredient` & `IngredientCategory`
  - `DetectedAdditive` & INS models
  - `DataSource` & data quality provenance
  - `AnalysisResult`, `ScoringFactor`, `ConfidenceAssessment`
  - `AlgorithmVersion`

### 2.2 `@foodgrade/knowledge`
- **Purpose**: Repository of Indian food terms, canonical ingredients, regional aliases, and additive metadata.
- **Contents**:
  - Indian cereal & flour mappings (*Maida*, *Atta*, *Ragi*, *Jowar*, *Bajra*, *Besan*, *Sooji*)
  - Indian oil & fat mappings (*Palmolein*, *Palm Oil*, *Vanaspati*, *Mustard Oil*, *Desi Ghee*)
  - Indian sweetener mappings (*Jaggery/Gur*, *Liquid Glucose*, *Invert Sugar Syrup*)
  - Complete INS 100–1522 additive catalog with neutral educational descriptions.

### 2.3 `@foodgrade/engine`
- **Purpose**: Pure mathematical scoring engine executing versioned algorithms (e.g. `FoodGrade Algorithm v1.0`).
- **Constraints**:
  - Pure functions: `evaluateProduct(input, config) -> AnalysisResult`
  - **Zero browser dependencies** (no `window`, `document`, `localStorage`, `fetch`, or React).
  - Configurable weights and thresholds injected via typed config objects.

### 2.4 `@foodgrade/parser`
- **Purpose**: Robust text extraction and structuring from messy OCR strings and API fields.
- **Contents**:
  - Nutrition table regex and fuzzy parsers (per 100g, per 100ml, per serving).
  - Ingredient list tokenizer (resolving parenthetical sub-ingredients and INS numbers).

### 2.5 `@foodgrade/client-services`
- **Purpose**: Adapters for external I/O, device hardware, and persistence.
- **Contents**:
  - Open Food Facts India API client with timeout protection and rate limiting.
  - IndexedDB storage for offline caching and scan history.
  - Pluggable `OCRProvider` interface (Tesseract.js on-device / Cloud Vision).
  - Camera & Barcode detection adapters.

### 2.6 `apps/web`
- **Purpose**: Mobile-first user interface built with React 19, Vite, and Tailwind CSS.
- **Features**: Live camera viewfinder, grade & score visualization, interactive positive/warning explainers, offline PWA service worker, and Capacitor Android bridge.

---

## 3. Data Flow

```text
Raw Input (Barcode / OCR Photo)
       │
       ▼
[@foodgrade/client-services] ───► Fetch / Cache / OCR Text
       │
       ▼
[@foodgrade/parser]          ───► Extract Nutrition Table & Ingredient Tokens
       │
       ▼
[@foodgrade/knowledge]       ───► Normalize Aliases & Recognize INS Codes
       │
       ▼
[ProductInput Model]         ───► Validated structured input with Data Quality flags
       │
       ▼
[@foodgrade/engine (v1.0)]   ───► Deterministic Multi-Pillar Scoring & Explanations
       │
       ▼
[AnalysisResult]             ───► Score (0-100), Grade (A-E), Positives, Warnings, Confidence
       │
       ▼
[apps/web UI]                ───► Render Visual Cards, Nutrition Dial, & RDA Breakdown
```

---

## 4. Architectural Invariants
1. **No Circular Dependencies**: Verified via package boundary tests.
2. **Deterministic Reproducibility**: Given identical `ProductInput` and algorithm configuration, the engine will always produce the identical byte-for-byte `AnalysisResult`.
3. **Data Quality Transparency**: The engine never fabricates missing values. If a nutrient is missing, it is explicitly flagged as `missing`, and confidence is adjusted accordingly.
