import { ALL_BENCHMARK_PRODUCTS } from '../packages/engine/dist/benchmark/index.js';
import { getAllIngredients, getAllAdditives, normalizeIngredient, lookupAdditive } from '../packages/knowledge/dist/index.js';
import { evaluateProduct } from '../packages/engine/dist/scoringEngine.js';

const allIngredients = getAllIngredients();
const allAdditives = getAllAdditives();

const canonicalMap = new Map(allIngredients.map(i => [i.id, i]));
const additiveMap = new Map(allAdditives.map(a => [a.insCode, a]));

console.log(`=== AUDITING ${ALL_BENCHMARK_PRODUCTS.length} BENCHMARKS AGAINST KNOWLEDGE BASE (${allIngredients.length} Ingredients, ${allAdditives.length} Additives) ===\n`);

const auditRows = [];

for (const b of ALL_BENCHMARK_PRODUCTS) {
  const p = b.product;
  let dataIssues = [];
  let knowledgeIssues = [];
  let provenanceIssues = [];
  let algorithmIssues = [];
  let actions = [];

  // 1. Data checks
  if (!p.barcode || p.barcode.length < 8) dataIssues.push('Missing/short barcode');
  if (!p.productName) dataIssues.push('Missing productName');
  if (!p.nutrition) dataIssues.push('Missing nutrition profile');
  if (!p.rawIngredientsText) dataIssues.push('Missing rawIngredientsText');
  if (p.parsedIngredients.length === 0) dataIssues.push('Empty parsedIngredients');

  const n = p.nutrition;
  if (!n.energyKcal) dataIssues.push('Missing energy');
  if (!n.proteinG) dataIssues.push('Missing protein');
  if (!n.carbohydratesG) dataIssues.push('Missing carbohydrates');
  if (!n.totalSugarsG) dataIssues.push('Missing totalSugars');
  if (!n.totalFatG) dataIssues.push('Missing totalFat');
  if (!n.saturatedFatG) dataIssues.push('Missing saturatedFat');
  if (!n.transFatG) dataIssues.push('Missing transFat');
  if (!n.sodiumMg) dataIssues.push('Missing sodium');

  // 2. Knowledge checks
  for (const ing of p.parsedIngredients) {
    if (!canonicalMap.has(ing.canonicalId)) {
      knowledgeIssues.push(`Unregistered canonicalId: "${ing.canonicalId}"`);
    }
  }

  for (const add of p.detectedAdditives) {
    // check both with and without "INS " prefix or insNumber
    if (!additiveMap.has(add.insCode) && !allAdditives.some(a => a.insNumber === add.insCode || a.insCode === add.insCode)) {
      knowledgeIssues.push(`Unregistered insCode: "${add.insCode}"`);
    }
  }

  // 3. Provenance checks
  if (!b.verification.sourceType) provenanceIssues.push('Missing sourceType');
  if (!b.verification.sourceReference) provenanceIssues.push('Missing sourceReference');
  if (!b.verification.verifiedAt) provenanceIssues.push('Missing verifiedAt');

  // 4. Algorithm checks
  try {
    const analysis = evaluateProduct(p);
    if (analysis.score < 0 || analysis.score > 100) algorithmIssues.push(`Score out of bounds: ${analysis.score}`);
    if (!['A', 'B', 'C', 'D', 'E'].includes(analysis.grade)) algorithmIssues.push(`Invalid grade: ${analysis.grade}`);
  } catch (err) {
    algorithmIssues.push(`Evaluation threw error: ${err.message}`);
  }

  const dataStatus = dataIssues.length === 0 ? 'VALID' : `WARN: ${dataIssues.join(', ')}`;
  const knowledgeStatus = knowledgeIssues.length === 0 ? 'VALID' : `WARN: ${knowledgeIssues.join(', ')}`;
  const provenanceStatus = provenanceIssues.length === 0 ? 'VALID' : `WARN: ${provenanceIssues.join(', ')}`;
  const algorithmStatus = algorithmIssues.length === 0 ? 'VALID' : `FAIL: ${algorithmIssues.join(', ')}`;

  if (dataIssues.length || knowledgeIssues.length || provenanceIssues.length || algorithmIssues.length) {
    actions.push([...dataIssues, ...knowledgeIssues, ...provenanceIssues, ...algorithmIssues].join('; '));
  } else {
    actions.push('None - regression-ready');
  }

  auditRows.push({
    benchmarkId: b.benchmarkId,
    dataStatus,
    knowledgeStatus,
    provenanceStatus,
    algorithmStatus,
    actionRequired: actions.join('; ')
  });
}

console.log('| benchmarkId | dataStatus | knowledgeStatus | provenanceStatus | algorithmStatus | actionRequired |');
console.log('| :--- | :--- | :--- | :--- | :--- | :--- |');
for (const r of auditRows) {
  console.log(`| \`${r.benchmarkId}\` | ${r.dataStatus} | ${r.knowledgeStatus} | ${r.provenanceStatus} | ${r.algorithmStatus} | ${r.actionRequired} |`);
}

const totalValid = auditRows.filter(r => r.dataStatus === 'VALID' && r.knowledgeStatus === 'VALID' && r.provenanceStatus === 'VALID' && r.algorithmStatus === 'VALID').length;
console.log(`\n=== AUDIT SUMMARY: ${totalValid} / ${ALL_BENCHMARK_PRODUCTS.length} Fully Valid & Regression-Ready ===`);
