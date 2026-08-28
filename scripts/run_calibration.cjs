const { ALL_BENCHMARK_PRODUCTS } = require('./packages/engine/dist/benchmark/index.js');
const { evaluateProduct } = require('./packages/engine/dist/scoringEngine.js');

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

  results.push({
    id: benchmark.benchmarkId,
    name: benchmark.productMetadata.productName,
    brand: benchmark.productMetadata.brand,
    category: cat,
    nutriScore: analysis.pillarScores.nutrition.score,
    ingScore: analysis.pillarScores.ingredients.score,
    addScore: analysis.pillarScores.additives.score,
    finalScore: analysis.score,
    grade: analysis.grade,
    confidence: analysis.confidence.score,
    factorsCount: analysis.factors.length,
    topFactors: analysis.factors.slice(0, 3).map(f => `${f.title} (${f.impact > 0 ? '+' : ''}${f.impact})`).join('; ')
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
