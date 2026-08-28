# Production Smoke Test Plan

This document outlines the steps to verify the production deployment of FoodGrade.

## Deployment Steps
1. Deploy frontend (e.g., Vercel, Cloudflare Pages, S3+CloudFront).
2. Deploy backend (e.g., Vercel Serverless, Node.js VPS, Render).
3. Set server-side \GEMINI_API_KEY\ in the backend environment.
4. Set frontend \VITE_VISION_PROXY_ENDPOINT\ to the deployed backend URL.

## Verification Steps
5. Open the web app over HTTPS.
6. Verify service worker installation and PWA manifest.
7. Scan a valid barcode and verify it resolves to product data via Open Food Facts.
8. Disable network (airplane mode) and scan a barcode to verify \client-services\ caching handles lookup offline.
9. Scan a food label image and verify Cloud OCR (Gemini) extracts ingredients/nutrition.
10. Disable network (airplane mode), scan a food label, and verify Local OCR (Tesseract) fallback functions.
11. Navigate to History and verify past scans are listed.
12. Navigate to Favorites and verify starred items are persisted.
13. Induce a timeout or invalid payload error and verify the UI handles it gracefully without leaking stack traces.