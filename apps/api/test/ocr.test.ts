import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

// ─── Mock @google/genai ───────────────────────────────────────────────────────
// We capture calls so we can assert what model/config was used.
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent: mockGenerateContent };
  }
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const validPayload = {
  image: { mimeType: 'image/jpeg', data: 'dmFsaWRiYXNlNjQ=' } // "validbase64"
};

const successResponse = { text: 'MOCK_OCR_TEXT' };

// ─── Setup ────────────────────────────────────────────────────────────────────
describe('OCR Proxy Endpoint', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test_key';
    delete process.env.OCR_TIMEOUT_MS;
    vi.clearAllMocks();
    // Default: successful Gemini response
    mockGenerateContent.mockResolvedValue(successResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Health ─────────────────────────────────────────────────────────────────
  describe('Health', () => {
    it('GET /api/health returns safe status object', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      // Must NOT expose secrets or internal config
      expect(res.body).not.toHaveProperty('GEMINI_API_KEY');
      expect(res.body).not.toHaveProperty('apiKey');
    });
  });

  // ── Success Path ───────────────────────────────────────────────────────────
  describe('Success', () => {
    it('returns 200 with validated OCR result', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      expect(res.status).toBe(200);
      expect(res.body.rawText).toBe('MOCK_OCR_TEXT');
      expect(res.body.provider).toBe('gemini_cloud_vision');
      expect(res.body.confidenceAvailable).toBe(false);
      expect(res.body.metadata.model).toBe('gemini-3.7-flash');
      expect(res.body.metadata.proxyResponse).toBe(true);
    });

    it('returns X-Request-ID header on success', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      expect(res.headers['x-request-id']).toBeTruthy();
    });

    it('accepts image/png MIME type', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({ image: { mimeType: 'image/png', data: 'dmFsaWRiYXNlNjQ=' } });
      expect(res.status).toBe(200);
    });

    it('accepts image/webp MIME type', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({ image: { mimeType: 'image/webp', data: 'dmFsaWRiYXNlNjQ=' } });
      expect(res.status).toBe(200);
    });
  });

  // ── Model Control: browser cannot override ─────────────────────────────────
  describe('Model Control', () => {
    it('ignores client-supplied model and always uses gemini-3.7-flash', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({
          model: 'gemini-2.0-ultra-hacked',  // browser attempts model override
          ...validPayload
        });

      expect(res.status).toBe(200);
      // The call to Gemini must have used the server-controlled model
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-3.7-flash');
      expect(res.body.metadata.model).toBe('gemini-3.7-flash');
    });

    it('ignores client-supplied generationConfig overrides', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({
          generationConfig: { temperature: 1.0, topP: 0.99 },
          ...validPayload
        });

      expect(res.status).toBe(200);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      // temperature and top_p should NOT be in server config
      expect(callArgs.config?.temperature).toBeUndefined();
      expect(callArgs.config?.topP).toBeUndefined();
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  describe('Validation', () => {
    it('returns 400 if image payload is missing', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({ prompt: 'test' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing image payload/);
      expect(res.body.requestId).toBeTruthy();
    });

    it('returns 400 if mimeType is not an allowed image type', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({ image: { mimeType: 'application/pdf', data: 'dmFsaWRiYXNlNjQ=' } });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Unsupported MIME type/);
    });

    it('returns 400 if mimeType is text/plain', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({ image: { mimeType: 'text/plain', data: 'dmFsaWRiYXNlNjQ=' } });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Unsupported MIME type/);
    });

    it('returns 400 for empty Base64 data', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({ image: { mimeType: 'image/jpeg', data: '' } });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/non-empty Base64/);
    });

    it('returns 400 for malformed Base64 (non-Base64 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({ image: { mimeType: 'image/jpeg', data: '!!!not-base64!!!' } });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not valid Base64/);
    });

    it('returns 413 if decoded image exceeds 10MB', async () => {
      // Generate base64 that decodes to > 10MB
      // 10MB * (4/3) ≈ 13.6M chars of base64 needed
      const largeBase64 = 'A'.repeat(14 * 1024 * 1024);
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send({ image: { mimeType: 'image/jpeg', data: largeBase64 } });

      expect(res.status).toBe(413);
      expect(res.body.error).toMatch(/too large/);
      // Gemini should NOT have been called
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('returns 404 for GET /api/v1/vision/ocr (wrong method)', async () => {
      const res = await request(app).get('/api/v1/vision/ocr');
      expect(res.status).toBe(404);
    });

    it('returns 500 if GEMINI_API_KEY is missing on server', async () => {
      delete process.env.GEMINI_API_KEY;
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Server configuration error/);
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });
  });

  // ── AbortController / Timeout ──────────────────────────────────────────────
  describe('Timeout / Cancellation', () => {
    it('passes abortSignal to Gemini SDK call', async () => {
      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      expect(res.status).toBe(200);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      // abortSignal must be present in the config
      expect(callArgs.config?.abortSignal).toBeInstanceOf(AbortSignal);
    });

    it('returns 504 when Gemini exceeds server timeout (AbortError)', async () => {
      process.env.OCR_TIMEOUT_MS = '50';

      // Simulate a request that is aborted by the server's AbortController
      mockGenerateContent.mockImplementation(async (args) => {
        return new Promise<{ text: string }>((resolve, reject) => {
          const timer = setTimeout(() => resolve({ text: 'too late' }), 200);
          // When the server aborts, the SDK would throw AbortError
          args.config?.abortSignal?.addEventListener('abort', () => {
            clearTimeout(timer);
            const err = new DOMException('The operation was aborted', 'AbortError');
            reject(err);
          });
        });
      });

      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      expect(res.status).toBe(504);
      expect(res.body.error).toMatch(/Upstream API timeout/);
    });

    it('server remains healthy after timeout — next request succeeds', async () => {
      process.env.OCR_TIMEOUT_MS = '50';

      // First request times out
      mockGenerateContent.mockImplementationOnce(async (args) => {
        return new Promise<{ text: string }>((resolve, reject) => {
          const timer = setTimeout(() => resolve({ text: 'too late' }), 200);
          args.config?.abortSignal?.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('aborted', 'AbortError'));
          });
        });
      });
      // Second request succeeds
      mockGenerateContent.mockResolvedValueOnce({ text: 'RECOVERED' });

      const failRes = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);
      expect(failRes.status).toBe(504);

      // Reset timeout for next request
      delete process.env.OCR_TIMEOUT_MS;

      const okRes = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);
      expect(okRes.status).toBe(200);
      expect(okRes.body.rawText).toBe('RECOVERED');
    });
  });

  // ── Upstream Errors ─────────────────────────────────────────────────────────
  describe('Upstream Errors', () => {
    it('maps 401/403 auth errors to 502', async () => {
      const err: any = new Error('Auth error');
      err.status = 401;
      mockGenerateContent.mockRejectedValue(err);

      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      expect(res.status).toBe(502);
      expect(res.body.error).toMatch(/authentication error/);
    });

    it('maps 429 rate limit to 429', async () => {
      const err: any = new Error('Rate limit');
      err.status = 429;
      mockGenerateContent.mockRejectedValue(err);

      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      expect(res.status).toBe(429);
    });

    it('maps 503 unavailable to 503', async () => {
      const err: any = new Error('Unavailable');
      err.status = 503;
      mockGenerateContent.mockRejectedValue(err);

      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      expect(res.status).toBe(503);
    });

    it('maps 500 server errors to 502', async () => {
      const err: any = new Error('Mock error');
      err.status = 500;
      mockGenerateContent.mockRejectedValue(err);

      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      expect(res.status).toBe(502);
    });
  });

  // ── Secret Isolation ───────────────────────────────────────────────────────
  describe('Secret Isolation', () => {
    it('does not leak GEMINI_API_KEY in error responses', async () => {
      process.env.GEMINI_API_KEY = 'super_secret_key_abc123';
      const err: any = new Error('Auth error');
      err.status = 401;
      mockGenerateContent.mockRejectedValue(err);

      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      const body = JSON.stringify(res.body);
      expect(body).not.toContain('super_secret_key_abc123');
      expect(body).not.toContain('GEMINI_API_KEY');
    });

    it('does not leak API key in successful responses', async () => {
      process.env.GEMINI_API_KEY = 'another_secret_abc456';

      const res = await request(app)
        .post('/api/v1/vision/ocr')
        .send(validPayload);

      const body = JSON.stringify(res.body);
      expect(body).not.toContain('another_secret_abc456');
      expect(body).not.toContain('GEMINI_API_KEY');
    });
  });
});
