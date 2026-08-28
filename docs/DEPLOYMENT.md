# Deployment Guide

## Frontend
The FoodGrade web application is a standard Vite React Single Page Application (SPA) designed as a Progressive Web App (PWA).

**Build Command:**
```bash
cd apps/web
pnpm build
```

**Output Directory:**
`apps/web/dist`

**Hosting Requirements:**
- Must be served over **HTTPS** (required for camera access, BarcodeDetector API, and PWA Service Worker installation).
- Standard static hosting (Vercel, Netlify, AWS S3+CloudFront, NGINX).
- **SPA Fallback**: The server must route all unknown requests to `index.html` to allow React Router to handle client-side routing.

## Backend (Cloud OCR Proxy)
The production Gemini OCR requires a secure backend to proxy requests to Google's APIs. This is implemented in `apps/api`.

**Build Command:**
```bash
cd apps/api
pnpm build
```

**Output Directory:**
`apps/api/dist`

**Hosting Requirements:**
- Node.js runtime (v20+)
- Serverless (Vercel, AWS Lambda) or VPS (Render, Railway, Fly.io).

**Exact Environment Variables Required (Server-Side):**
- `GEMINI_API_KEY`: Your private Google AI Studio or Vertex AI key.
- `FRONTEND_ORIGIN`: Allowed CORS origin (e.g., `https://your-frontend.com`).
- `RATE_LIMIT_MAX`: Max requests per IP per 15m (e.g., `100`).

**Environment Variables Required (Frontend Build):**
- `VITE_VISION_PROXY_ENDPOINT`: The absolute HTTPS URL to your deployed backend proxy (e.g., `https://api.myfoodgrade.com/api/v1/vision/ocr`).

## Privacy & Data Usage
* **Barcode Flow**: Barcode scans may trigger network requests to Open Food Facts (`world.openfoodfacts.org`).
* **Label Photo Flow (Local OCR)**: When local OCR is selected, image processing happens entirely on the device.
* **Label Photo Flow (Cloud OCR)**: When cloud OCR is required, the compressed image **leaves the device** and is sent to the configured `VITE_VISION_PROXY_ENDPOINT`. Do not claim that camera images never leave the device if this feature is used.
* **History/Favorites**: Product results and historical data are stored strictly locally in the browser's IndexedDB.

## License / Attribution
This application leverages data from [Open Food Facts](https://world.openfoodfacts.org/), which is made available under the Open Database License (ODbL).
