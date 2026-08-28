import { z } from 'zod';

export const DataSourceTypeSchema = z.enum([
  'open_food_facts',
  'label_ocr',
  'user_manual',
  'verified_database',
  'custom_api'
]);
export type DataSourceType = z.infer<typeof DataSourceTypeSchema>;

export const ObservationModeSchema = z.enum([
  'directly_observed',  // Scanned/read directly from package
  'inferred',           // Computed from partial indicators
  'fallback',           // Matched via fallback generic database
  'unknown'
]);
export type ObservationMode = z.infer<typeof ObservationModeSchema>;

export const DataQualityProvenanceSchema = z.object({
  sourceType: DataSourceTypeSchema,
  observationMode: ObservationModeSchema.default('directly_observed'),
  sourceId: z.string().optional(),
  sourceUri: z.string().optional(),
  scannedAt: z.string().datetime().optional(),
  rawConfidence: z.number().min(0).max(1).default(1.0),
  missingMandatoryFields: z.array(z.string()).default([])
});
export type DataQualityProvenance = z.infer<typeof DataQualityProvenanceSchema>;
