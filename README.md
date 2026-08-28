# FoodGrade

> Mobile-first food analysis application designed for Indian packaged foods. Provides transparent, deterministic, and explainable nutritional and ingredient quality assessments.

---

## 1. Overview

FoodGrade empowers consumers to make informed choices about packaged food in India by scanning product barcodes or photographing nutrition/ingredient labels. It evaluates products against an explainable scoring engine (FoodGrade Algorithm v1.0), returning a **0-100 score**, an **A-E grade**, clear positive highlights, and transparent warnings.

### Key Principles
- **India-First**: Native support for Indian ingredient terminology (e.g., *Maida*, *Atta*, *Palmolein*, *Vanaspati*, *Jaggery*, *Millets*) and Indian packaging standards (FSSAI labelling norms).
- **Deterministic & Explainable**: No opaque black-box AI scores. The scoring engine is a pure, mathematical function with versioned parameters.
- **Zero-Coupled Core**: The domain logic, knowledge base, and scoring algorithms are pure TypeScript packages with zero dependencies on React, browsers, or cloud infrastructure.
- **Offline-First & Private**: The scoring engine and ingredient database are bundled locally. Scans and history are stored on-device by default.
- **Hybrid OCR Pipeline**: Uses a secure backend proxy to query Google Gemini 3.7 Flash for powerful label reading, seamlessly falling back to local on-device WebAssembly Tesseract OCR when offline.

---

## 2. Technology Stack

- **Runtime**: Node.js `>=20.0.0`
- **Monorepo**: `pnpm` workspace + `Turborepo`
- **Language**: `TypeScript` (Strict Mode)
- **Engine Core**: `Zod` schema validation
- **Web App**: React 19 + Vite 6 + Tailwind CSS v4 (PWA)
- **Backend API**: Express (Node.js) proxy for Gemini Cloud Vision
- **Testing**: `Vitest` (Unit/Integration) + `Playwright` (E2E)

---

## 3. Monorepo Structure

```text
foodgrade/
+-- apps/
¦   +-- web/               # Mobile-first Vite + React 19 PWA
¦   +-- api/               # Express proxy backend for secure Gemini Cloud OCR
+-- packages/
¦   +-- shared-types/      # Stable domain types, Zod schemas, data quality models
¦   +-- knowledge/         # Indian ingredient lexicon & INS additive database
¦   +-- engine/            # Deterministic scoring engine & versioned algorithms
¦   +-- parser/            # Nutrition table & ingredient list regex/fuzzy parsers
¦   +-- scanner/           # Barcode detection wrapper (ZXing / Native BarcodeDetector)
¦   +-- vision/            # OCR Providers (Gemini / Tesseract / Composite)
¦   +-- client-services/   # Open Food Facts client, local storage (IndexedDB)
+-- data/
¦   +-- benchmarks/        # Verified Indian packaged food test fixtures
+-- docs/                  # Architecture & deployment documentation
```

---

## 4. Development Workflow

```bash
# Install all workspace dependencies
pnpm install

# Start both the web app and the API proxy in development mode
pnpm dev

# Build all packages across the monorepo
pnpm build

# Run all unit, boundary, integration and E2E tests
pnpm test
pnpm exec playwright test  # from apps/web for E2E

# Run TypeScript typechecks and Linting across packages
pnpm typecheck
pnpm lint
```

---

## 5. Environment & Cloud OCR Configuration

For the **Cloud Vision (Gemini)** functionality to work, the backend API requires configuration. 
**NEVER place actual API keys in the frontend code.**

1. In `apps/api/`, create a `.env` file:
   ```env
   GEMINI_API_KEY=your_real_google_ai_key
   FRONTEND_ORIGIN=http://localhost:5173
   ```
2. In `apps/web/`, create a `.env.local` file:
   ```env
   VITE_VISION_PROXY_ENDPOINT=http://localhost:3001/api/v1/vision/ocr
   ```

---

## 6. Documentation
- [System Architecture](docs/ARCHITECTURE.md)
- [Vision OCR Architecture](docs/VISION_OCR_ARCHITECTURE.md)
- [Production Readiness](docs/PRODUCTION_READINESS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Required Backend Contract](RequiredBackendContract.md)
