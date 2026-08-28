import { z } from 'zod';
import { ProductInputSchema } from './domain.js';

export const BenchmarkProductSchema = z.object({
  benchmarkId: z.string().min(1),
  product: ProductInputSchema,
  productMetadata: z.object({
    brand: z.string(),
    productName: z.string(),
    category: z.string(),
    market: z.string().default('India'),
    country: z.string().default('IN'),
    barcode: z.string().optional()
  }),
  verification: z.object({
    sourceType: z.enum([
      'official_packaging',
      'verified_label_photo',
      'fssai_filing',
      'manufacturer_declaration'
    ]),
    sourceReference: z.string(),
    verifiedAt: z.string(),
    labelVersion: z.string().optional(),
    dataCompleteness: z.enum(['complete', 'partial'])
  }),
  reviewerNotes: z.object({
    selectionRationale: z.string().optional(),
    expectedProfile: z.string().optional(),
    observations: z.array(z.string()).optional()
  }).optional()
});

export type BenchmarkProduct = z.infer<typeof BenchmarkProductSchema>;
