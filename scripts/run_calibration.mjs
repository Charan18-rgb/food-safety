import { ALL_BENCHMARK_PRODUCTS } from '../packages/engine/dist/benchmark/index.js';
import { evaluateProduct } from '../packages/engine/dist/scoringEngine.js';

console.log(`=== RUNNING FOODGRADE ALGORITHM V1.0 CALIBRATION (${ALL_BENCHMARK_PRODUCTS.length} BENCHMARK PRODUCTS) ===\n`);

const results = [];
const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
const categoryScores = {};

for (const benchmark of ALL_BENCHMARK_PRODUCTS) {
  const analysis = evaluateProduct(benchmark.product);
  gradeCounts[analysis.grade]++;

  const cat = benchmark.productMetadata.category;
  if (!categoryScores[cat]) categoryScores[cat] = [];
  categoryScores[cat].push(analysis.score);

  const topFactors = [...analysis.warnings, ...analysis.positives]
    .slice(0, 3)
    .map(f => `${f.title} (${f.pointsDelta > 0 ? '+' : ''}${f.pointsDelta})`)
    .join('; ');

  results.push({
    id: benchmark.benchmarkId,
    name: benchmark.productMetadata.productName,
    brand: benchmark.productMetadata.brand,
    category: cat,
    nutriScore: analysis.pillarScores.nutritionScore,
    ingScore: analysis.pillarScores.ingredientScore,
    addScore: analysis.pillarScores.additiveScore,
    finalScore: analysis.score,
    grade: analysis.grade,
    confidence: analysis.confidence.numericScore,
    topFactors: topFactors || 'None'
  });
}

console.log('| ID | Brand | Product | Category | Nutri | Ing | Add | Final | Grade | Conf | Top Scoring Factors |');
console.log('| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |');

for (const r of results) {
  console.log(`| \`${r.id}\` | ${r.brand} | ${r.name} | ${r.category} | ${r.nutriScore} | ${r.ingScore} | ${r.addScore} | **${r.finalScore}** | **${r.grade}** | ${(r.confidence * 100).toFixed(0)}% | ${r.topFactors} |`);
}

console.log('\n=== GRADE DISTRIBUTION ===');
for (const [grade, count] of Object.entries(gradeCounts)) {
  const pct = ((count / ALL_BENCHMARK_PRODUCTS.length) * 100).toFixed(1);
  console.log(`Grade ${grade}: ${count} products (${pct}%)`);
}

console.log('\n=== CATEGORY AVERAGE SCORES ===');
for (const [cat, scores] of Object.entries(categoryScores)) {
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  console.log(`- ${cat} (${scores.length} products): Average Score = ${avg}`);
}
