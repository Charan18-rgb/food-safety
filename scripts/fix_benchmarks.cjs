const fs = require('fs');
const path = require('path');

const base = 'd:/food grade system/packages/engine/src/benchmark';
const files = fs.readdirSync(base).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const fname of files) {
  const fpath = path.join(base, fname);
  let content = fs.readFileSync(fpath, 'utf8');

  // Fix servingInfo
  content = content.replace(/servingSizeG:\s*(\d+(\.\d+)?)/g, "servingSize: $1, servingUnit: 'g'");
  content = content.replace(/servingsPerContainer:\s*(\d+)/g, 'servingsPerPackage: $1');

  // Fix liquids
  if (fname === 'beverages.ts' || fname === 'dairy.ts') {
    content = content.replace(/servingUnit:\s*'g'/g, "servingUnit: 'ml'");
  }

  // Fix provenance
  content = content.replace(
    /provenance:\s*\{\s*sourceType:\s*['"]verified_database['"],\s*rawConfidence:\s*1\.0,\s*missingMandatoryFields:\s*\[\]\s*\}/g,
    "provenance: { sourceType: 'verified_database', observationMode: 'directly_observed', rawConfidence: 1.0, missingMandatoryFields: [] }"
  );

  // Fix categories
  content = content.replace(/'mineral_salt'/g, "'salt'");
  content = content.replace(/'vegetable'/g, "'vegetable_fruit'");
  content = content.replace(/'cocoa'/g, "'general'");

  fs.writeFileSync(fpath, content, 'utf8');
  console.log('Fixed', fname);
}

// Fix index.ts
const idxPath = 'd:/food grade system/packages/engine/src/index.ts';
const indexTs = `export * from './config/index.js';
export * from './grade/index.js';
export * from './pillars/index.js';
export * from './confidence/index.js';
export * from './explainers/index.js';
export * from './scoringEngine.js';
export * from './benchmark/index.js';

export const ENGINE_PACKAGE_INITIALIZED = true;
`;
fs.writeFileSync(idxPath, indexTs, 'utf8');
console.log('Fixed engine index.ts');
