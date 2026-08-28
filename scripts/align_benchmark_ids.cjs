const fs = require('fs');
const path = require('path');

const base = 'd:/food grade system/packages/engine/src/benchmark';
const files = fs.readdirSync(base).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const fname of files) {
  const fpath = path.join(base, fname);
  let content = fs.readFileSync(fpath, 'utf8');

  content = content.replace(/canonicalId:\s*'salt'/g, "canonicalId: 'iodized_salt'");
  content = content.replace(/canonicalId:\s*'toor_dal'/g, "canonicalId: 'pigeon_peas'");
  content = content.replace(/canonicalId:\s*'besan'/g, "canonicalId: 'chickpea_flour'");
  content = content.replace(/canonicalId:\s*'moth_dal'/g, "canonicalId: 'moth_beans'");

  fs.writeFileSync(fpath, content, 'utf8');
  console.log('Updated canonical references in', fname);
}
