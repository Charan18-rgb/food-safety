import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { barcodeRouter } from '../src/routes/barcode';

describe('Barcode API Multi-Source', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use('/api/v1/barcode', barcodeRouter);
    vi.stubGlobal('fetch', vi.fn());
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles OFF 404 and falls back to UPCitemdb', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('world.openfoodfacts.org')) {
        return Promise.resolve({ ok: false, status: 404 });
      }
      if (url.includes('api.upcitemdb.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ code: 'OK', items: [{ title: 'Mock Item', brand: 'Mock Brand' }] })
        });
      }
      return Promise.reject(new Error('unhandled'));
    });

    const res = await request(app).get('/api/v1/barcode/12345670');
    expect(res.status).toBe(200);
    expect(res.body.source).toBe('upcitemdb');
    expect(res.body.product.productName).toBe('Mock Item');
  });

  it('gracefully handles timeouts/500 from UPCitemdb', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('world.openfoodfacts.org')) {
        return Promise.resolve({ ok: false, status: 404 });
      }
      if (url.includes('api.upcitemdb.com')) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.reject(new Error('unhandled'));
    });

    const res = await request(app).get('/api/v1/barcode/036000291452');
    expect(res.status).toBe(404);
  });
});

