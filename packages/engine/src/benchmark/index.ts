import { BenchmarkProduct } from '@foodgrade/shared-types';
import { BISCUIT_BENCHMARKS } from './biscuits.js';
import { NOODLE_BENCHMARKS } from './noodles.js';
import { CEREAL_BENCHMARKS } from './cereals.js';
import { STAPLE_BENCHMARKS } from './staples.js';
import { SNACK_BENCHMARKS } from './snacks.js';
import { BEVERAGE_BENCHMARKS } from './beverages.js';
import { DAIRY_BENCHMARKS } from './dairy.js';
import { MALTED_BENCHMARKS } from './malted.js';

export const ALL_BENCHMARK_PRODUCTS: BenchmarkProduct[] = [
  ...BISCUIT_BENCHMARKS,
  ...NOODLE_BENCHMARKS,
  ...CEREAL_BENCHMARKS,
  ...STAPLE_BENCHMARKS,
  ...SNACK_BENCHMARKS,
  ...BEVERAGE_BENCHMARKS,
  ...DAIRY_BENCHMARKS,
  ...MALTED_BENCHMARKS
];

export const BENCHMARKS_BY_ID: Map<string, BenchmarkProduct> = new Map(
  ALL_BENCHMARK_PRODUCTS.map(p => [p.benchmarkId, p])
);

export {
  BISCUIT_BENCHMARKS,
  NOODLE_BENCHMARKS,
  CEREAL_BENCHMARKS,
  STAPLE_BENCHMARKS,
  SNACK_BENCHMARKS,
  BEVERAGE_BENCHMARKS,
  DAIRY_BENCHMARKS,
  MALTED_BENCHMARKS
};
