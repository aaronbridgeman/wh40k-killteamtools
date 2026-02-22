/**
 * Unit tests for injured calculator utilities
 */

import { describe, it, expect } from 'vitest';
import {
  shouldBeInjured,
  getModifiedMovement,
  getModifiedHitStat,
} from '@/services/injuredCalculator';

describe('injuredCalculator', () => {
  describe('shouldBeInjured', () => {
    it('returns true when current wounds are less than half of max wounds', () => {
      expect(shouldBeInjured(8, 18)).toBe(true); // 8 < 9
      expect(shouldBeInjured(9, 20)).toBe(true); // 9 < 10
      expect(shouldBeInjured(1, 10)).toBe(true); // 1 < 5
    });

    it('returns false when current wounds are equal to or greater than half of max wounds', () => {
      expect(shouldBeInjured(9, 18)).toBe(false); // 9 >= 9
      expect(shouldBeInjured(10, 18)).toBe(false); // 10 >= 9
      expect(shouldBeInjured(18, 18)).toBe(false); // Full health
      expect(shouldBeInjured(10, 20)).toBe(false); // 10 >= 10
      expect(shouldBeInjured(5, 10)).toBe(false); // Exactly half
    });

    it('handles edge cases correctly', () => {
      expect(shouldBeInjured(0, 18)).toBe(true); // 0 wounds
      expect(shouldBeInjured(1, 1)).toBe(false); // Single wound operative
      expect(shouldBeInjured(0, 1)).toBe(true); // Dead operative
    });

    it('correctly handles odd number wounds', () => {
      // For 17 wounds, threshold is 8.5, so 8 or fewer is injured
      expect(shouldBeInjured(8, 17)).toBe(true);
      expect(shouldBeInjured(9, 17)).toBe(false);
      
      // For 11 wounds, threshold is 5.5, so 5 or fewer is injured
      expect(shouldBeInjured(5, 11)).toBe(true);
      expect(shouldBeInjured(6, 11)).toBe(false);
    });
  });

  describe('getModifiedMovement', () => {
    it('returns base movement when not injured', () => {
      expect(getModifiedMovement(6, false)).toBe(6);
      expect(getModifiedMovement(8, false)).toBe(8);
      expect(getModifiedMovement(10, false)).toBe(10);
    });

    it('subtracts 2 from movement when injured', () => {
      expect(getModifiedMovement(6, true)).toBe(4);
      expect(getModifiedMovement(8, true)).toBe(6);
      expect(getModifiedMovement(10, true)).toBe(8);
    });

    it('returns minimum of 0 for movement', () => {
      expect(getModifiedMovement(2, true)).toBe(0);
      expect(getModifiedMovement(1, true)).toBe(0);
      expect(getModifiedMovement(0, true)).toBe(0);
    });
  });

  describe('getModifiedHitStat', () => {
    it('returns base hit stat when not injured', () => {
      expect(getModifiedHitStat(3, false)).toBe(3);
      expect(getModifiedHitStat(4, false)).toBe(4);
      expect(getModifiedHitStat(2, false)).toBe(2);
    });

    it('adds 1 to hit stat when injured (worsening it)', () => {
      expect(getModifiedHitStat(3, true)).toBe(4); // 3+ becomes 4+
      expect(getModifiedHitStat(4, true)).toBe(5); // 4+ becomes 5+
      expect(getModifiedHitStat(2, true)).toBe(3); // 2+ becomes 3+
    });

    it('returns maximum of 6 for hit stat', () => {
      expect(getModifiedHitStat(6, true)).toBe(6);
      expect(getModifiedHitStat(5, true)).toBe(6);
    });
  });
});
