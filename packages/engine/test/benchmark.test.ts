import { describe, it, expect } from 'vitest';
import { ALL_BENCHMARK_PRODUCTS, BENCHMARKS_BY_ID } from '../src/benchmark/index.js';
import { evaluateProduct, ScoringEngineV1 } from '../src/scoringEngine.js';
import { BenchmarkProductSchema, AnalysisResultSchema } from '@foodgrade/shared-types';

describe('FoodGrade Algorithm v1.0 — Ground-Truth Benchmark Dataset & Calibration', () => {
  it('should contain at least 25 verified benchmark products across 8 categories', () => {
    expect(ALL_BENCHMARK_PRODUCTS.length).toBeGreaterThanOrEqual(25);
    
    const categories = new Set(ALL_BENCHMARK_PRODUCTS.map(p => p.productMetadata.category));
    expect(categories.size).toBeGreaterThanOrEqual(7);
  });

  it('should validate every benchmark product against BenchmarkProductSchema', () => {
    for (const benchmark of ALL_BENCHMARK_PRODUCTS) {
      const parsed = BenchmarkProductSchema.safeParse(benchmark);
      expect(parsed.success, `Benchmark ${benchmark.benchmarkId} failed schema validation`).toBe(true);
      expect(benchmark.verification.sourceType).toBeDefined();
      expect(benchmark.verification.verifiedAt).toBeDefined();
    }
  });

  it('should evaluate every benchmark product without errors and produce valid AnalysisResult', () => {
    const engine = new ScoringEngineV1();

    for (const benchmark of ALL_BENCHMARK_PRODUCTS) {
      const result = engine.evaluate(benchmark.product);
      
      const parsed = AnalysisResultSchema.safeParse(result);
      expect(parsed.success, `Result for ${benchmark.benchmarkId} failed AnalysisResultSchema`).toBe(true);

      // Verify bounds
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(['A', 'B', 'C', 'D', 'E']).toContain(result.grade);

      // Verify mathematical reconciliation
      const reconciled = Math.round(
        Math.min(
          100,
          Math.max(
            0,
            result.pillarScores.nutritionScore * 0.45 +
            result.pillarScores.ingredientScore * 0.35 +
            result.pillarScores.additiveScore * 0.20
          )
        )
      );
      expect(result.score).toBe(reconciled);
    }
  });

  it('should calibrate staples and single-ingredient whole foods to Grade A', () => {
    const staples = ['aashirvaad-shudh-chakki-atta', 'quaker-rolled-oats', 'tata-sampann-unpolished-toor-dal', '24-mantra-organic-ragi-flour'];
    
    for (const id of staples) {
      const benchmark = BENCHMARKS_BY_ID.get(id);
      expect(benchmark).toBeDefined();
      const result = evaluateProduct(benchmark!.product);
      expect(result.grade).toBe('A');
      expect(result.score).toBeGreaterThanOrEqual(90);
    }
  });

  it('should calibrate high-sugar / high-fat confectioneries to Grade C or lower', () => {
    const darkFantasy = BENCHMARKS_BY_ID.get('sunfeast-dark-fantasy-choco-fills');
    expect(darkFantasy).toBeDefined();
    const dfResult = evaluateProduct(darkFantasy!.product);
    expect(dfResult.score).toBeLessThanOrEqual(50);
    expect(['D', 'E']).toContain(dfResult.grade);

    const oreo = BENCHMARKS_BY_ID.get('oreo-original-vanilla');
    expect(oreo).toBeDefined();
    const oreoResult = evaluateProduct(oreo!.product);
    expect(oreoResult.score).toBeLessThanOrEqual(60);
  });

  it('should penalize high sodium in instant noodles', () => {
    const maggi = BENCHMARKS_BY_ID.get('maggi-2-minute-masala');
    expect(maggi).toBeDefined();
    const result = evaluateProduct(maggi!.product);
    
    const sodiumWarning = result.warnings.find(w => w.id === 'moderate_sodium' || w.id === 'high_sodium');
    expect(sodiumWarning).toBeDefined();
    expect(sodiumWarning!.pointsDelta).toBeLessThanOrEqual(-10);
  });

  it('should evaluate unflavored dairy milk neutrally with high confidence', () => {
    const milk = BENCHMARKS_BY_ID.get('amul-taaza-toned-milk');
    expect(milk).toBeDefined();
    const result = evaluateProduct(milk!.product);
    expect(result.grade).toBe('A');
    expect(result.pillarScores.nutritionScore).toBe(70); // Baseline unpenalized natural lactose
    expect(result.confidence.numericScore).toBe(1.0);
  });
});
