/**
 * Unit tests for weapon rules
 */

import { describe, it, expect } from 'vitest';
import weaponRulesData from '@/data/weapons/weapon-rules.json';

describe('weaponRules', () => {
  describe('master weapon rules list', () => {
    it('should contain Poison rule', () => {
      const weaponRules = weaponRulesData[0].rules;
      const poisonRule = weaponRules.find((rule) => rule.name === 'Poison');

      expect(poisonRule).toBeDefined();
      expect(poisonRule?.description).toBe(
        'On a successful hit, inflicts a Poison token.'
      );
      expect(poisonRule?.source).toBe('Plague Marines');
    });

    it('should contain Toxic rule', () => {
      const weaponRules = weaponRulesData[0].rules;
      const toxicRule = weaponRules.find((rule) => rule.name === 'Toxic');

      expect(toxicRule).toBeDefined();
      expect(toxicRule?.description).toBe(
        'If target has a Poison token, add 1 to both Normal and Critical damage stats.'
      );
      expect(toxicRule?.source).toBe('Plague Marines');
    });

    it('should have all standard weapon rules', () => {
      const weaponRules = weaponRulesData[0].rules;
      const ruleNames = weaponRules.map((rule) => rule.name);

      // Check for some essential rules
      expect(ruleNames).toContain('Balanced');
      expect(ruleNames).toContain('Lethal x+');
      expect(ruleNames).toContain('Piercing x');
      expect(ruleNames).toContain('Poison');
      expect(ruleNames).toContain('Toxic');
    });

    it('should have valid structure for each rule', () => {
      const weaponRules = weaponRulesData[0].rules;

      weaponRules.forEach((rule) => {
        expect(rule).toHaveProperty('name');
        expect(rule).toHaveProperty('description');
        expect(rule).toHaveProperty('source');
        expect(typeof rule.name).toBe('string');
        expect(typeof rule.description).toBe('string');
        expect(typeof rule.source).toBe('string');
        expect(rule.name.length).toBeGreaterThan(0);
        expect(rule.description.length).toBeGreaterThan(0);
        expect(rule.source.length).toBeGreaterThan(0);
      });
    });

    it('should have Default Rules source for standard rules', () => {
      const weaponRules = weaponRulesData[0].rules;
      const balancedRule = weaponRules.find((rule) => rule.name === 'Balanced');

      expect(balancedRule).toBeDefined();
      expect(balancedRule?.source).toBe('Default Rules');
    });
  });
});
