import { describe, it, expect } from 'vitest';
import { PARSER_PACKAGE_INITIALIZED } from '../src/index.js';

describe('Parser Package Skeleton', () => {
  it('initializes successfully with types', () => {
    expect(PARSER_PACKAGE_INITIALIZED).toBe(true);
  });
});
