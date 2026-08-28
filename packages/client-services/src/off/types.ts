/**
 * Open Food Facts API v3 Type Definitions and DTOs.
 * Reference: Open Food Facts API v3 Documentation
 * Endpoint: /api/v3/product/{barcode}
 */

export interface OFFV3NutrimentsDTO {
  'energy-kcal_100g'?: number | string;
  'energy-kcal'?: number | string;
  'energy-kcal_value'?: number | string;
  'energy_100g'?: number | string; // in kJ
  'energy'?: number | string;
  'proteins_100g'?: number | string;
  'proteins'?: number | string;
  'protein_100g'?: number | string;
  'carbohydrates_100g'?: number | string;
  'carbohydrates'?: number | string;
  'sugars_100g'?: number | string;
  'sugars'?: number | string;
  'added-sugars_100g'?: number | string;
  'added_sugars_100g'?: number | string;
  'added-sugars'?: number | string;
  'fiber_100g'?: number | string;
  'fiber'?: number | string;
  'dietary-fiber_100g'?: number | string;
  'fat_100g'?: number | string;
  'fat'?: number | string;
  'saturated-fat_100g'?: number | string;
  'saturated-fat'?: number | string;
  'trans-fat_100g'?: number | string;
  'trans-fat'?: number | string;
  'cholesterol_100g'?: number | string; // in g
  'cholesterol'?: number | string;
  'sodium_100g'?: number | string; // in g
  'sodium'?: number | string;
  'salt_100g'?: number | string; // in g
  'salt'?: number | string;
  [key: string]: number | string | undefined;
}

export interface OFFV3ProductDTO {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  serving_size?: string;
  serving_quantity?: number | string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  additives_tags?: string[];
  nutriments?: OFFV3NutrimentsDTO;
}

export interface OFFV3ResultDTO {
  id: 'product_found' | 'product_not_found' | string;
  name?: string;
}

export interface OFFV3ErrorDTO {
  message: string;
  field?: string;
}

export interface OFFV3ProductResponse {
  status?: 'success' | 'failure' | 1 | 0 | string;
  result?: OFFV3ResultDTO;
  code?: string;
  errors?: OFFV3ErrorDTO[];
  warnings?: unknown[];
  product?: OFFV3ProductDTO;
}

/**
 * Standard fields requested in OFF v3 API calls to optimize bandwidth.
 */
export const OFF_V3_REQUESTED_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'categories',
  'serving_size',
  'serving_quantity',
  'ingredients_text',
  'ingredients_text_en',
  'additives_tags',
  'nutriments'
].join(',');
