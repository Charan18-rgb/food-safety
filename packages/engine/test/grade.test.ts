import { describe, it, expect } from 'vitest';
import { clampScore, getGrade } from '../src/index.js';

describe('Grade Mapping & Score Clamping', () => {
  describe('clampScore', () => {
    it('clamps numbers strictly to [0, 100]', () => {
      expect(clampScore(50)).toBe(50);
      expect(clampScore(0)).toBe(0);
      expect(clampScore(100)).toBe(100);
      expect(clampScore(-15)).toBe(0);
      expect(clampScore(145)).toBe(100);
      expect(clampScore(NaN)).toBe(0);
      expect(clampScore(Infinity)).toBe(0);
    });
  });

  describe('getGrade boundary testing', () => {
    it('maps exact threshold boundaries to expected FoodGrade', () => {
      // Grade A: [80, 100]
      expect(getGrade(100)).toBe('A');
      expect(getGrade(85)).toBe('A');
      expect(getGrade(80)).toBe('A');

      // Grade B: [65, 80)
      expect(getGrade(79.99)).toBe('B');
      expect(getGrade(70)).toBe('B');
      expect(getGrade(65)).toBe('B');

      // Grade C: [50, 65)
      expect(getGrade(64.99)).toBe('C');
      expect(getGrade(55)).toBe('C');
      expect(getGrade(50)).toBe('C');

      // Grade D: [35, 50)
      expect(getGrade(49.99)).toBe('D');
      expect(getGrade(40)).toBe('D');
      expect(getGrade(35)).toBe('D');

      // Grade E: [0, 35)
      expect(getGrade(34.99)).toBe('E');
      expect(getGrade(20)).toBe('E');
      expect(getGrade(0)).toBe('E');

      // Out of bounds
      expect(getGrade(-20)).toBe('E');
      expect(getGrade(150)).toBe('A');
    });
  });
});
