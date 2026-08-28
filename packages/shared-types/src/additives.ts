import { z } from 'zod';

export const AdditiveFunctionalClassSchema = z.enum([
  'flavour_enhancer',
  'synthetic_colour',
  'artificial_sweetener',
  'preservative',
  'emulsifier_stabilizer',
  'antioxidant',
  'acidity_regulator',
  'bulking_agent',
  'other'
]);
export type AdditiveFunctionalClass = z.infer<typeof AdditiveFunctionalClassSchema>;

export const AdditiveRiskCategorySchema = z.enum([
  'neutral',                // Benign / standard processing aids (e.g. Vitamin C, Citric Acid)
  'processing_indicator',   // Marker of industrial formulation (e.g. MSG, emulsifiers)
  'caution_load'            // High scrutiny load (e.g. synthetic azo dyes, artificial sweeteners)
]);
export type AdditiveRiskCategory = z.infer<typeof AdditiveRiskCategorySchema>;

export const DetectedAdditiveSchema = z.object({
  insCode: z.string(), // e.g. "INS 621"
  canonicalName: z.string(), // e.g. "Monosodium Glutamate"
  functionalClass: AdditiveFunctionalClassSchema,
  riskCategory: AdditiveRiskCategorySchema,
  neutralExplanation: z.string(),
  fssaiMaxPermittedNote: z.string().optional()
});
export type DetectedAdditive = z.infer<typeof DetectedAdditiveSchema>;
