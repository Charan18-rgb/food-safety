import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { barcodeRouter } from './routes/barcode.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

// Hardcoded server-controlled Gemini model (allow env override, default to current stable)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Allowed MIME types — only formats the pipeline actually supports
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// CORS — locked to configured frontend origin, allowing no-origin for mobile clients
const frontendOrigin = process.env.FRONTEND_ORIGIN;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps) or matching the configured frontend origin
    if (!origin || origin === frontendOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
}));

// Attach a request ID to every request for traceability
app.use((req, res, next) => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('X-Request-ID', requestId);
  (req as any).requestId = requestId;
  next();
});

// Body parser with hard JSON limit (Base64 expands binary by ~33%; 10MB JSON ≈ 7.5MB image)
app.use(express.json({ limit: '10mb' }));

// Per-IP rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
  // Trust proxy for accurate IP when behind Vercel/Cloudflare/Nginx
  // Set TRUST_PROXY=1 in production and enable app.set('trust proxy', 1)
});

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.use('/api/v1/vision/ocr', limiter);
app.use('/api/v1/barcode', limiter, barcodeRouter);

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ name: 'FoodGrade API', version: '1.0.0', status: 'ok', health: '/api/health' });
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});


// ─── OCR Proxy ────────────────────────────────────────────────────────────────
app.post('/api/v1/vision/ocr', async (req, res) => {
  const requestId = (req as any).requestId as string;

  // 1. Validate payload
  const { prompt, image } = req.body;
  // Ignore client-supplied `model`, `generationConfig`, or any Gemini overrides

  if (!image || !image.mimeType) {
    return res.status(400).json({ error: 'Missing image payload', requestId });
  }

  if (!ALLOWED_MIME_TYPES.has(image.mimeType as string)) {
    return res.status(400).json({
      error: `Unsupported MIME type: ${image.mimeType}. Allowed: image/jpeg, image/png, image/webp, image/gif`,
      requestId
    });
  }

  // Validate Base64 — reject missing, empty, or malformed data
  if (typeof image.data !== 'string' || image.data.trim().length === 0) {
    return res.status(400).json({ error: 'Image data must be a non-empty Base64 string', requestId });
  }
  if (!/^[A-Za-z0-9+/=]+$/.test(image.data.trim())) {
    return res.status(400).json({ error: 'Image data is not valid Base64', requestId });
  }

  // Payload size: Base64-decoded approximation (every 4 chars ≈ 3 bytes)
  const decodedBytes = Math.floor(image.data.length * 0.75);
  if (decodedBytes > 10 * 1024 * 1024) {
    return res.status(413).json({ error: 'Image too large. Maximum decoded size is 10MB.', requestId });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error(`[${requestId}] Server configuration error: GEMINI_API_KEY is missing`);
    return res.status(500).json({ error: 'Server configuration error', requestId });
  }

  // 2. Cancellation-aware Gemini call
  //    AbortController cancels the local HTTP fetch to Gemini (drops the connection).
  //    NOTE: The SDK docs state this is a client-only operation — the Gemini service
  //    may still process the request but our server will not wait for or return the result.
  const controller = new AbortController();
  const timeoutMs = parseInt(process.env.OCR_TIMEOUT_MS || '15000', 10);

  const timeoutId = setTimeout(() => {
    controller.abort(new Error('Gateway Timeout'));
  }, timeoutMs);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,          // Server-enforced; client cannot override
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: typeof prompt === 'string' && prompt.trim().length > 0
                ? prompt
                : 'Transcribe all visible text from this food product label verbatim. Include ingredients list, nutrition facts, and additive codes. Do NOT summarise or score.'
            },
            {
              inlineData: {
                data: image.data,
                mimeType: image.mimeType as string
              }
            }
          ]
        }
      ],
      config: {
        maxOutputTokens: 4096,
        // temperature, top_p, top_k intentionally omitted for gemini-3.8-flash
        abortSignal: controller.signal,   // Cancels local fetch on timeout/abort
      }
    });

    clearTimeout(timeoutId);

    const text = response.text || '';

    // 3. Return sanitized response — no raw Gemini internals
    return res.json({
      rawText: text,
      provider: 'gemini_cloud_vision',
      confidenceAvailable: false,
      metadata: {
        model: GEMINI_MODEL,
        proxyResponse: true,
        requestId,
      }
    });

  } catch (error: any) {
    clearTimeout(timeoutId);

    // AbortError = timeout or client disconnect
    if (error?.name === 'AbortError' || controller.signal.aborted) {
      console.error(`[${requestId}] Gemini request aborted (timeout/client disconnect)`);
      return res.status(504).json({ error: 'Upstream API timeout', requestId });
    }

    // Map upstream errors to safe codes
    const status = error?.status ?? error?.httpError?.status;
    console.error(`[${requestId}] Gemini API Error (status=${status}): ${error.message}`);

    if (status === 401 || status === 403) {
      return res.status(502).json({ error: 'Upstream API authentication error', requestId });
    }
    if (status === 429) {
      return res.status(429).json({ error: 'Upstream API rate limited', requestId });
    }
    if (status === 503) {
      return res.status(503).json({ error: 'Upstream API unavailable', requestId });
    }
    return res.status(502).json({ error: 'Upstream API error', requestId });
  }
});

// ─── Generic Express error handler ───────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const requestId = (req as any).requestId ?? 'unknown';
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large. Maximum JSON body is 10MB.', requestId });
  }
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload', requestId });
  }
  console.error(`[${requestId}]`, err);
  return res.status(500).json({ error: 'Internal Server Error', requestId });
});

// ─── Export / Start ──────────────────────────────────────────────────────────
export default app;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}
