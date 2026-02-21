/**
 * Unit tests for ruleExpander service
 */

import { describe, it, expect } from 'vitest';
import {
  expandWeaponRule,
  getAllWeaponRules,
  searchWeaponRules,
} from '@/services/ruleExpander';

describe('ruleExpander', () => {
  describe('expandWeaponRule', () => {
    it('should expand a rule without value', () => {
      const result = expandWeaponRule('Balanced');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Balanced');
      expect(result?.description).toContain('re-roll');
      expect(result?.source).toBe('Default Rules');
    });

    it('should expand a rule with value', () => {
      const result = expandWeaponRule('Piercing', 1);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Piercing 1');
      expect(result?.description).toContain('1');
      expect(result?.source).toBe('Default Rules');
    });

    it('should return null for unknown rule', () => {
      const result = expandWeaponRule('UnknownRule');
      expect(result).toBeNull();
    });

    it('should handle Lethal with value', () => {
      const result = expandWeaponRule('Lethal', 5);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Lethal 5+');
      expect(result?.description).toContain('5');
      expect(result?.source).toBe('Default Rules');
    });

    it('should expand Plague Marines rules with correct source', () => {
      const poisonResult = expandWeaponRule('Poison');
      expect(poisonResult).not.toBeNull();
      expect(poisonResult?.source).toBe('Plague Marines');

      const toxicResult = expandWeaponRule('Toxic');
      expect(toxicResult).not.toBeNull();
      expect(toxicResult?.source).toBe('Plague Marines');
    });
  });

  describe('getAllWeaponRules', () => {
    it('should return all weapon rules', () => {
      const rules = getAllWeaponRules();
      expect(Object.keys(rules).length).toBeGreaterThan(0);
      expect(rules['Piercing']).toBeDefined();
      expect(rules['Lethal']).toBeDefined();
    });

    it('should include source field in all rules', () => {
      const rules = getAllWeaponRules();
      Object.values(rules).forEach((rule) => {
        expect(rule).toHaveProperty('source');
        expect(typeof rule.source).toBe('string');
      });
    });
  });

  describe('searchWeaponRules', () => {
    it('should find rules by name', () => {
      const results = searchWeaponRules('Piercing');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Piercing');
      expect(results[0]).toHaveProperty('source');
    });

    it('should find rules by description', () => {
      const results = searchWeaponRules('critical');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result).toHaveProperty('source');
      });
    });

    it('should return empty array for no matches', () => {
      const results = searchWeaponRules('xyzabc123');
      expect(results.length).toBe(0);
    });

    it('should be case insensitive', () => {
      const results = searchWeaponRules('LETHAL');
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
