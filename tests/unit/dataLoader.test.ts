/**
 * Unit tests for dataLoader service
 */

import { describe, it, expect } from 'vitest';
import { validateFaction, AVAILABLE_FACTIONS } from '@/services/dataLoader';
import { Faction } from '@/types';

describe('dataLoader', () => {
  describe('validateFaction', () => {
    it('should validate a correct faction object', () => {
      const validFaction: Faction = {
        id: 'test-faction',
        name: 'Test Faction',
        description: 'A test faction',
        rules: [],
        operatives: [],
        weapons: [],
        abilities: [],
        restrictions: {
          maxOperatives: 6,
          minOperatives: 6,
        },
        metadata: {
          version: '1.0.0',
          source: 'Test',
          lastUpdated: '2024-01-01',
        },
      };

      expect(validateFaction(validFaction)).toBe(true);
    });

    it('should reject invalid faction object', () => {
      expect(validateFaction(null)).toBe(false);
      expect(validateFaction(undefined)).toBe(false);
      expect(validateFaction({})).toBe(false);
      expect(validateFaction('string')).toBe(false);
    });

    it('should reject faction missing required fields', () => {
      const invalidFaction = {
        id: 'test',
        name: 'Test',
        // missing other required fields
      };

      expect(validateFaction(invalidFaction)).toBe(false);
    });
  });

  describe('AVAILABLE_FACTIONS', () => {
    it('should contain initial factions', () => {
      expect(AVAILABLE_FACTIONS).toContain('angels-of-death');
      expect(AVAILABLE_FACTIONS).toContain('plague-marines');
    });

    it('should have at least 2 factions', () => {
      expect(AVAILABLE_FACTIONS.length).toBeGreaterThanOrEqual(2);
    });
  });
});
