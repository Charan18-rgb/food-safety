import { z } from 'zod';

export const AlgorithmVersionSchema = z.string().min(1);
export type AlgorithmVersion = z.infer<typeof AlgorithmVersionSchema>;

export const DEFAULT_ALGORITHM_VERSION: AlgorithmVersion = 'foodgrade-v1.0.0';
