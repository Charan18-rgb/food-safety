# FoodGrade Production Readiness

## Architecture
- `@foodgrade/api`: **READY** (Secure Gemini backend proxy)
- `@foodgrade/shared-types`: **READY**
- `@foodgrade/knowledge`: **READY**
- `@foodgrade/engine`: **READY**
- `@foodgrade/parser`: **READY**
- `@foodgrade/scanner`: **READY**
- `@foodgrade/client-services`: **READY**
- `@foodgrade/vision`: **READY** (Provides `CompositeVisionProvider`)
- `@foodgrade/web`: **READY**

## Functional Flows
- **Barcode Scanning**: **READY** (ZXing / BarcodeDetector API)
- **Manual Barcode**: **READY** (Includes GS1 validation)
- **Label Photo Flow**: **READY** (Includes Canvas pre-compression)
- **Open Food Facts**: **READY** (Includes stale fallback and exponential backoff)
- **Result UI**: **READY** (Semantic components, strictly context-driven)
- **History**: **READY** (IndexedDB persistent layer `foodgrade_history_db`)
- **Favorites**: **READY** (IndexedDB persistent layer)
- **Local OCR (Tesseract)**: **READY**
- **Cloud OCR (Gemini)**: **READY** (Proxied via `apps/api` to protect API keys)
- **Offline Functionality**: **READY** (Workbox caching for PWA shell, `client-services` caching for data)

## Backend Timeout and Cancellation (Verified)
The server-side timeout uses `AbortController` + `abortSignal`:

- `AbortController` is created per request.
- `setTimeout` schedules `controller.abort()` after `OCR_TIMEOUT_MS` (default: 15s).
- `generateContent()` receives `{ config: { abortSignal: controller.signal } }`.
- On timeout, the SDK throws `AbortError` (local HTTP connection to Gemini is dropped).
- Server catches `AbortError` and returns HTTP 504 immediately.
- `clearTimeout()` runs in all paths — no timer leaks on success or failure.

**SDK Limitation**: The `@google/genai` SDK documents `abortSignal` as a client-only operation.
The signal cancels the local fetch connection; the Gemini service may continue processing.
Usage charges may still apply for in-flight requests. This is the standard proxy timeout pattern.

Regression tests covering this:
- `passes abortSignal to Gemini SDK call`
- `returns 504 when Gemini exceeds server timeout (AbortError)`
- `server remains healthy after timeout -- next request succeeds`

## Security
- **Browser Secrets**: No API keys in client bundle. Audited: GEMINI_API_KEY, AIza, generativelanguage.googleapis.com, ?key= -- all absent.
- **Model Control**: Client-supplied model and generationConfig are ignored. gemini-3.7-flash is server-enforced.
- **MIME Allowlist**: Only image/jpeg, image/png, image/webp, image/gif accepted. Rejected 400 before Gemini call.
- **Base64 Validation**: Empty data rejected 400. Non-Base64 characters rejected 400. Oversized payload rejected 413.
- **Request IDs**: X-Request-ID (UUID) on every request. Included in all error responses.
- **CORS**: Locked to FRONTEND_ORIGIN env variable. Must be set for production deploys.
- **Rate Limiting**: 100 req/15m per IP. Set TRUST_PROXY=1 when behind Cloudflare/Nginx.
- **XSS**: OCR results mapped to typed strings. No dangerouslySetInnerHTML.

## Production Bundle
apps/web/dist contains no MOCK, TODO, GEMINI_API_KEY, or AIza strings. Only production code.

## PWA
- Manifest: Valid (manifest.webmanifest)
- Icons: Valid (192x192, 512x512 PNGs)
- Service Worker: VitePWA Workbox for static shell, does not override client-services offline product cache.
- HTTPS: Required in production for camera, BarcodeDetector, Service Worker.

## Cloud Cost / Usage Protection
- Rate limit: 100 OCR requests per IP per 15 minutes
- Image size: 10MB decoded maximum (rejected 413 before Gemini call)
- Timeout: 15 seconds default (OCR_TIMEOUT_MS). AbortError drops local connection after expiry.
- Google Free Tier applies to Gemini 3.7 Flash (15 RPM / 1M TPM). Subject to change.
- Budget Alerts: Set a Google Cloud Budget Alert at your project level.
- Note: Free-tier content may be used by Google to improve their models.

## Offline Fallback
When the proxy is unreachable, CompositeVisionProvider automatically falls back to local TesseractVisionProvider.

## Tests
- @foodgrade/api: 1 file, 24/24 tests
- @foodgrade/shared-types: 2 files, 4/4 tests
- @foodgrade/knowledge: 3 files, 79/79 tests
- @foodgrade/engine: 10 files, 45/45 tests
- @foodgrade/parser: 6 files, 25/25 tests
- @foodgrade/scanner: 3 files, 17/17 tests
- @foodgrade/client-services: 7 files, 31/31 tests
- @foodgrade/vision: 4 files, 16/16 tests
- @foodgrade/web: 9 files, 11/11 tests
- Total: 252/252

E2E Stability:
- Run 1: 11/11 PASS (38.7s)
- Run 2: 11/11 PASS (38.2s)
- Run 3: 11/11 PASS (36.7s)

## Final Status
READY WITH DEPLOYMENT CONFIGURATION

All code is complete and all tests pass. Deployment requires:
1. Deploy apps/api to a Node.js host (Render, Vercel, Railway, Fly.io).
2. Set server env: GEMINI_API_KEY, FRONTEND_ORIGIN, optionally RATE_LIMIT_MAX, OCR_TIMEOUT_MS, TRUST_PROXY.
3. Set frontend env at build time: VITE_VISION_PROXY_ENDPOINT=https://your-api-host/api/v1/vision/ocr
4. Deploy apps/web/dist to static HTTPS hosting (Vercel, Netlify, Cloudflare Pages).
