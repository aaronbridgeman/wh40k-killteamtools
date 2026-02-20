/**
 * Unit tests for Angels of Death faction data integration
 */

import { describe, it, expect } from 'vitest';
import { loadFaction } from '@/services/dataLoader';
import { Faction } from '@/types';

describe('Angels of Death Faction Integration', () => {
  let faction: Faction;

  beforeAll(async () => {
    faction = await loadFaction('angels-of-death');
  });

  it('should load Angels of Death faction successfully', async () => {
    expect(faction).toBeDefined();
    expect(faction.id).toBe('angels-of-death');
    expect(faction.name).toBe('Angels of Death');
  });

  it('should have faction keywords', () => {
    expect(faction.faction_keywords).toBeDefined();
    expect(faction.faction_keywords).toContain('IMPERIUM');
    expect(faction.faction_keywords).toContain('ADEPTUS ASTARTES');
    expect(faction.faction_keywords).toContain('ANGEL OF DEATH');
  });

  it('should have global rules', () => {
    expect(faction.global_rules).toBeDefined();
    expect(faction.global_rules?.bolt_weapon_definition).toBeDefined();
    expect(faction.global_rules?.astartes_multi_action).toBeDefined();
    expect(faction.global_rules?.and_they_shall_know_no_fear).toBeDefined();
  });

  it('should have composition rules', () => {
    expect(faction.restrictions.composition).toBeDefined();
    expect(faction.restrictions.composition?.total_operatives).toBe(6);
    expect(faction.restrictions.composition?.selection_limits?.leader_count).toBe(1);
    expect(faction.restrictions.composition?.selection_limits?.non_leader_count).toBe(5);
    expect(faction.restrictions.composition?.selection_limits?.max_unique_operatives).toBe(1);
    expect(faction.restrictions.composition?.selection_limits?.exception).toContain('Warrior');
  });

  it('should have 8 operatives', () => {
    expect(faction.operatives).toHaveLength(8);
  });

  it('should have 3 leader operatives', () => {
    const leaders = faction.operatives.filter(op => op.type === 'Leader');
    expect(leaders).toHaveLength(3);
    expect(leaders.map(l => l.name)).toContain('Assault Intercessor Sergeant');
    expect(leaders.map(l => l.name)).toContain('Intercessor Sergeant');
    expect(leaders.map(l => l.name)).toContain('Space Marine Captain');
  });

  it('should have 5 non-leader operatives', () => {
    const operatives = faction.operatives.filter(op => op.type === 'Operative');
    expect(operatives).toHaveLength(5);
  });

  describe('Operative Stats', () => {
    it('should have correct APL of 3 for all operatives', () => {
      faction.operatives.forEach(operative => {
        expect(operative.stats.actionPointLimit).toBe(3);
      });
    });

    it('should have correct movement of 6" for all operatives', () => {
      faction.operatives.forEach(operative => {
        expect(operative.stats.movement).toBe(6);
      });
    });

    it('should have correct save of 3+ for all operatives', () => {
      faction.operatives.forEach(operative => {
        expect(operative.stats.save).toBe(3);
      });
    });

    it('should have 14 wounds for most operatives', () => {
      const standardOperatives = faction.operatives.filter(
        op => !op.name.includes('Captain') && !op.name.includes('Heavy Intercessor')
      );
      standardOperatives.forEach(operative => {
        expect(operative.stats.wounds).toBe(14);
      });
    });

    it('should have 15 wounds for Captain and Heavy Intercessor', () => {
      const captain = faction.operatives.find(op => op.name === 'Space Marine Captain');
      const heavyGunner = faction.operatives.find(op => op.name === 'Heavy Intercessor Gunner');
      expect(captain?.stats.wounds).toBe(15);
      expect(heavyGunner?.stats.wounds).toBe(15);
    });
  });

  describe('Weapon Options and Loadouts', () => {
    it('should have fixed_loadout for Space Marine Captain', () => {
      const captain = faction.operatives.find(op => op.name === 'Space Marine Captain');
      expect(captain?.fixed_loadout).toBeDefined();
      expect(captain?.fixed_loadout).toContain('Plasma pistol');
      expect(captain?.fixed_loadout).toContain('Power fist');
    });

    it('should have fixed_loadout for Assault Intercessor Grenadier', () => {
      const grenadier = faction.operatives.find(op => op.name === 'Assault Intercessor Grenadier');
      expect(grenadier?.fixed_loadout).toBeDefined();
      expect(grenadier?.fixed_loadout).toContain('Heavy bolt pistol');
      expect(grenadier?.fixed_loadout).toContain('Chainsword');
    });

    it('should have weapon_options for Assault Intercessor Sergeant', () => {
      const sergeant = faction.operatives.find(op => op.name === 'Assault Intercessor Sergeant');
      expect(sergeant?.weapon_options).toBeDefined();
      expect(sergeant?.weapon_options?.standard_loadout_groups).toBeDefined();
      expect(sergeant?.weapon_options?.alternative_loadouts).toBeDefined();
    });

    it('should have weapon_options for Intercessor Sergeant', () => {
      const sergeant = faction.operatives.find(op => op.name === 'Intercessor Sergeant');
      expect(sergeant?.weapon_options).toBeDefined();
      expect(sergeant?.weapon_options?.slot_1_rifle).toBeDefined();
      expect(sergeant?.weapon_options?.slot_2_melee).toBeDefined();
    });

    it('should have ammo_profiles for Eliminator Sniper', () => {
      const sniper = faction.operatives.find(op => op.name === 'Eliminator Sniper');
      expect(sniper?.weapon_options?.ammo_profiles).toBeDefined();
      expect(sniper?.weapon_options?.ammo_profiles).toContain('Executioner');
      expect(sniper?.weapon_options?.ammo_profiles).toContain('Hyperfrag');
      expect(sniper?.weapon_options?.ammo_profiles).toContain('Mortis');
    });

    it('should have firing_profiles for Heavy Intercessor Gunner', () => {
      const gunner = faction.operatives.find(op => op.name === 'Heavy Intercessor Gunner');
      expect(gunner?.weapon_options?.firing_profiles).toBeDefined();
      expect(gunner?.weapon_options?.firing_profiles).toContain('Focused');
      expect(gunner?.weapon_options?.firing_profiles).toContain('Sweeping');
    });

    it('should have fixed_secondary for Intercessor Gunner', () => {
      const gunner = faction.operatives.find(op => op.name === 'Intercessor Gunner');
      expect(gunner?.weapon_options?.fixed_secondary).toBe('Auxiliary grenade launcher');
    });
  });

  describe('Weapons', () => {
    it('should have all required weapons', () => {
      const weaponNames = faction.weapons.map(w => w.name);
      
      // Pistols
      expect(weaponNames).toContain('Hand flamer');
      expect(weaponNames).toContain('Heavy bolt pistol');
      expect(weaponNames).toContain('Bolt pistol');
      expect(weaponNames).toContain('Plasma pistol');
      
      // Rifles
      expect(weaponNames).toContain('Auto bolt rifle');
      expect(weaponNames).toContain('Bolt rifle');
      expect(weaponNames).toContain('Stalker bolt rifle');
      expect(weaponNames).toContain('Bolt sniper rifle');
      
      // Heavy weapons
      expect(weaponNames).toContain('Heavy bolter');
      expect(weaponNames).toContain('Auxiliary grenade launcher');
      
      // Melee weapons
      expect(weaponNames).toContain('Chainsword');
      expect(weaponNames).toContain('Power fist');
      expect(weaponNames).toContain('Power weapon');
      expect(weaponNames).toContain('Thunder hammer');
      expect(weaponNames).toContain('Fists');
    });

    it('should have multiple profiles for Bolt sniper rifle', () => {
      const boltSniper = faction.weapons.find(w => w.name === 'Bolt sniper rifle');
      expect(boltSniper?.profiles).toHaveLength(3);
      expect(boltSniper?.profiles.map(p => p.name)).toContain('Executioner');
      expect(boltSniper?.profiles.map(p => p.name)).toContain('Hyperfrag');
      expect(boltSniper?.profiles.map(p => p.name)).toContain('Mortis');
    });

    it('should have multiple profiles for Heavy bolter', () => {
      const heavyBolter = faction.weapons.find(w => w.name === 'Heavy bolter');
      expect(heavyBolter?.profiles).toHaveLength(2);
      expect(heavyBolter?.profiles.map(p => p.name)).toContain('Focused');
      expect(heavyBolter?.profiles.map(p => p.name)).toContain('Sweeping');
    });

    it('should have multiple profiles for Plasma pistol', () => {
      const plasmaPistol = faction.weapons.find(w => w.name === 'Plasma pistol');
      expect(plasmaPistol?.profiles).toHaveLength(2);
      expect(plasmaPistol?.profiles.map(p => p.name)).toContain('Standard');
      expect(plasmaPistol?.profiles.map(p => p.name)).toContain('Supercharge');
    });
  });

  describe('Abilities', () => {
    it('should have Frag Grenade and Krak Grenade abilities', () => {
      const abilityNames = faction.abilities.map(a => a.name);
      expect(abilityNames).toContain('Frag Grenade');
      expect(abilityNames).toContain('Krak Grenade');
    });

    it('should assign grenades to Assault Intercessor Grenadier', () => {
      const grenadier = faction.operatives.find(op => op.name === 'Assault Intercessor Grenadier');
      expect(grenadier?.abilities).toContain('Frag Grenade');
      expect(grenadier?.abilities).toContain('Krak Grenade');
    });
  });
});
