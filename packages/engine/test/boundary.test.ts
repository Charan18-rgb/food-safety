import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Architecture & Dependency Boundary Enforcement', () => {
  it('engine package.json must not have UI or browser dependencies', () => {
    const pkgJsonPath = path.resolve(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    };

    const forbiddenDeps = [
      'react',
      'react-dom',
      '@types/react',
      '@types/react-dom',
      '@foodgrade/client-services',
      'dexie',
      'idb',
      'tesseract.js',
      'lucide-react',
      'tailwindcss'
    ];

    for (const forbidden of forbiddenDeps) {
      expect(allDeps[forbidden], `Engine package must not depend on ${forbidden}`).toBeUndefined();
    }
  });

  it('engine source files must not reference browser globals', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts'));

    const forbiddenTokens = ['window.', 'document.', 'localStorage.', 'sessionStorage.', 'fetch(', 'navigator.'];

    for (const file of files) {
      const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
      for (const token of forbiddenTokens) {
        expect(content.includes(token), `File ${file} should not contain browser token ${token}`).toBe(false);
      }
    }
  });
});
