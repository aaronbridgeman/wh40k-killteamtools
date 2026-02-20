/**
 * Unit tests for weaponResolver service
 */

import { describe, it, expect } from 'vitest';
import {
  resolveWeaponLoadout,
  getDefaultWeaponSelection,
  validateWeaponSelection,
} from '@/services/weaponResolver';
import { Operative } from '@/types';

describe('weaponResolver', () => {
  describe('resolveWeaponLoadout', () => {
    it('should handle operatives with legacy weapons array', () => {
      const operative: Operative = {
        id: 'test-1',
        name: 'Test Operative',
        type: 'Trooper',
        stats: {
          movement: 6,
          actionPointLimit: 2,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 10,
        },
        weapons: ['Boltgun', 'Combat knife'],
      };

      const loadout = resolveWeaponLoadout(operative);
      expect(loadout.fixedWeapons).toEqual(['Boltgun', 'Combat knife']);
      expect(loadout.slots).toHaveLength(0);
    });

    it('should handle operatives with fixed_loadout', () => {
      const operative: Operative = {
        id: 'test-2',
        name: 'Test Operative',
        type: 'Trooper',
        stats: {
          movement: 6,
          actionPointLimit: 2,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 10,
        },
        fixed_loadout: ['Plasma gun', 'Power sword'],
      };

      const loadout = resolveWeaponLoadout(operative);
      expect(loadout.fixedWeapons).toEqual(['Plasma gun', 'Power sword']);
      expect(loadout.slots).toHaveLength(0);
    });

    it('should handle operatives with standard_loadout_groups', () => {
      const operative: Operative = {
        id: 'test-3',
        name: 'Test Sergeant',
        type: 'Leader',
        stats: {
          movement: 6,
          actionPointLimit: 3,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 14,
        },
        weapon_options: {
          standard_loadout_groups: [
            {
              slot_1_pistol: ['Hand flamer', 'Heavy bolt pistol'],
              slot_2_melee: ['Chainsword', 'Power fist', 'Power weapon'],
            },
          ],
        },
      };

      const loadout = resolveWeaponLoadout(operative);
      expect(loadout.slots).toHaveLength(2);
      expect(loadout.slots[0].slotId).toBe('slot_1_pistol');
      expect(loadout.slots[0].options).toEqual([
        'Hand flamer',
        'Heavy bolt pistol',
      ]);
      expect(loadout.slots[0].defaultSelection).toBe('Hand flamer');
      expect(loadout.slots[1].slotId).toBe('slot_2_melee');
      expect(loadout.slots[1].options).toEqual([
        'Chainsword',
        'Power fist',
        'Power weapon',
      ]);
    });

    it('should handle mixed fixed and choice weapons in standard_loadout_groups', () => {
      const operative: Operative = {
        id: 'test-4',
        name: 'Test Sniper',
        type: 'Operative',
        stats: {
          movement: 6,
          actionPointLimit: 2,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 10,
        },
        weapon_options: {
          standard_loadout_groups: [
            {
              slot_1_rifle: 'Bolt sniper rifle',
              slot_2_pistol: 'Bolt pistol',
              slot_3_melee: 'Fists',
            },
          ],
        },
      };

      const loadout = resolveWeaponLoadout(operative);
      expect(loadout.fixedWeapons).toEqual([
        'Bolt sniper rifle',
        'Bolt pistol',
        'Fists',
      ]);
      expect(loadout.slots).toHaveLength(0);
    });

    it('should handle direct slot definitions', () => {
      const operative: Operative = {
        id: 'test-5',
        name: 'Test Warrior',
        type: 'Operative',
        stats: {
          movement: 6,
          actionPointLimit: 2,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 10,
        },
        weapon_options: {
          slot_1_rifle: ['Auto bolt rifle', 'Bolt rifle', 'Stalker bolt rifle'],
          slot_2_melee: ['Fists'],
        },
      };

      const loadout = resolveWeaponLoadout(operative);
      expect(loadout.slots).toHaveLength(1);
      expect(loadout.slots[0].options).toEqual([
        'Auto bolt rifle',
        'Bolt rifle',
        'Stalker bolt rifle',
      ]);
      // Single-option arrays should be treated as fixed
      expect(loadout.fixedWeapons).toContain('Fists');
    });

    it('should handle fixed_secondary weapon', () => {
      const operative: Operative = {
        id: 'test-6',
        name: 'Test Operative',
        type: 'Operative',
        stats: {
          movement: 6,
          actionPointLimit: 2,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 10,
        },
        weapon_options: {
          slot_1_rifle: ['Lasgun', 'Hotshot lasgun'],
          fixed_secondary: 'Laspistol',
        },
      };

      const loadout = resolveWeaponLoadout(operative);
      expect(loadout.fixedWeapons).toContain('Laspistol');
      expect(loadout.slots).toHaveLength(1);
    });

    it('should store alternative_loadouts', () => {
      const operative: Operative = {
        id: 'test-7',
        name: 'Test Sergeant',
        type: 'Leader',
        stats: {
          movement: 6,
          actionPointLimit: 3,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 14,
        },
        weapon_options: {
          standard_loadout_groups: [
            {
              slot_1_pistol: ['Hand flamer', 'Heavy bolt pistol'],
              slot_2_melee: ['Chainsword', 'Power fist'],
            },
          ],
          alternative_loadouts: [
            {
              fixed: ['Plasma pistol', 'Chainsword'],
            },
          ],
        },
      };

      const loadout = resolveWeaponLoadout(operative);
      expect(loadout.alternativeLoadouts).toBeDefined();
      expect(loadout.alternativeLoadouts).toHaveLength(1);
      expect(loadout.alternativeLoadouts![0].fixed).toEqual([
        'Plasma pistol',
        'Chainsword',
      ]);
    });
  });

  describe('getDefaultWeaponSelection', () => {
    it('should return all weapons for fixed loadout', () => {
      const operative: Operative = {
        id: 'test-1',
        name: 'Test Operative',
        type: 'Trooper',
        stats: {
          movement: 6,
          actionPointLimit: 2,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 10,
        },
        weapons: ['Boltgun', 'Combat knife'],
      };

      const defaults = getDefaultWeaponSelection(operative);
      expect(defaults).toEqual(['Boltgun', 'Combat knife']);
    });

    it('should return fixed weapons plus default from each slot', () => {
      const operative: Operative = {
        id: 'test-2',
        name: 'Test Sergeant',
        type: 'Leader',
        stats: {
          movement: 6,
          actionPointLimit: 3,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 14,
        },
        weapon_options: {
          slot_1_pistol: ['Hand flamer', 'Heavy bolt pistol'],
          slot_2_melee: ['Chainsword', 'Power fist'],
          fixed_secondary: 'Frag grenades',
        },
      };

      const defaults = getDefaultWeaponSelection(operative);
      expect(defaults).toContain('Frag grenades'); // fixed
      expect(defaults).toContain('Hand flamer'); // first option from slot 1
      expect(defaults).toContain('Chainsword'); // first option from slot 2
      expect(defaults).toHaveLength(3);
    });
  });

  describe('validateWeaponSelection', () => {
    it('should validate fixed loadout correctly', () => {
      const operative: Operative = {
        id: 'test-1',
        name: 'Test Operative',
        type: 'Trooper',
        stats: {
          movement: 6,
          actionPointLimit: 2,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 10,
        },
        fixed_loadout: ['Boltgun', 'Combat knife'],
      };

      expect(
        validateWeaponSelection(operative, ['Boltgun', 'Combat knife'])
      ).toBe(true);
      expect(validateWeaponSelection(operative, ['Boltgun'])).toBe(false);
      expect(
        validateWeaponSelection(operative, [
          'Boltgun',
          'Combat knife',
          'Power sword',
        ])
      ).toBe(true); // Extra weapons allowed for now
    });

    it('should require all fixed weapons to be present', () => {
      const operative: Operative = {
        id: 'test-2',
        name: 'Test Operative',
        type: 'Trooper',
        stats: {
          movement: 6,
          actionPointLimit: 2,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 10,
        },
        weapon_options: {
          slot_1_pistol: ['Hand flamer', 'Heavy bolt pistol'],
          fixed_secondary: 'Frag grenades',
        },
      };

      expect(
        validateWeaponSelection(operative, ['Hand flamer', 'Frag grenades'])
      ).toBe(true);
      expect(validateWeaponSelection(operative, ['Hand flamer'])).toBe(false); // Missing fixed weapon
    });

    it('should require exactly one weapon from each slot', () => {
      const operative: Operative = {
        id: 'test-3',
        name: 'Test Sergeant',
        type: 'Leader',
        stats: {
          movement: 6,
          actionPointLimit: 3,
          groupActivation: 1,
          defense: 3,
          save: 3,
          wounds: 14,
        },
        weapon_options: {
          slot_1_pistol: ['Hand flamer', 'Heavy bolt pistol'],
          slot_2_melee: ['Chainsword', 'Power fist'],
        },
      };

      // Valid: one from each slot
      expect(
        validateWeaponSelection(operative, ['Hand flamer', 'Chainsword'])
      ).toBe(true);
      expect(
        validateWeaponSelection(operative, ['Heavy bolt pistol', 'Power fist'])
      ).toBe(true);

      // Invalid: missing slot 2
      expect(validateWeaponSelection(operative, ['Hand flamer'])).toBe(false);

      // Invalid: two from same slot
      expect(
        validateWeaponSelection(operative, [
          'Hand flamer',
          'Heavy bolt pistol',
          'Chainsword',
        ])
      ).toBe(false);

      // Invalid: no selection from slot 1
      expect(validateWeaponSelection(operative, ['Chainsword'])).toBe(false);
    });
  });
});
