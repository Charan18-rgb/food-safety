import { describe, it, expect } from 'vitest';
import { CLIENT_SERVICES_PACKAGE_INITIALIZED } from '../src/index.js';

describe('Client Services Package Skeleton', () => {
  it('initializes successfully with types', () => {
    expect(CLIENT_SERVICES_PACKAGE_INITIALIZED).toBe(true);
  });
});
