import { describe, it, expect } from 'vitest';
import { KNOWLEDGE_PACKAGE_INITIALIZED } from '../src/index.js';

describe('Knowledge Package Skeleton', () => {
  it('initializes successfully with types', () => {
    expect(KNOWLEDGE_PACKAGE_INITIALIZED).toBe(true);
  });
});
