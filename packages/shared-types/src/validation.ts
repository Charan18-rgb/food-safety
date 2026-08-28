import { ProductInputSchema, ProductInput, AnalysisResultSchema, AnalysisResult } from './domain.js';
import { NutritionProfileSchema, NutritionProfile } from './nutrition.js';

export function validateProductInput(data: unknown): { success: true; data: ProductInput } | { success: false; error: string } {
  const result = ProductInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}

export function validateAnalysisResult(data: unknown): { success: true; data: AnalysisResult } | { success: false; error: string } {
  const result = AnalysisResultSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}

export function validateNutritionProfile(data: unknown): { success: true; data: NutritionProfile } | { success: false; error: string } {
  const result = NutritionProfileSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}
