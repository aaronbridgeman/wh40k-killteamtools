/**
 * Unit tests for Angels of Death faction data integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
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
    expect(faction.faction_keywords).toContain('ANGELS OF DEATH');
  });

  it('should have global rules', () => {
    expect(faction.global_rules).toBeDefined();
    expect(faction.global_rules?.astartes_multi_action).toBeDefined();
    expect(faction.global_rules?.astartes_counteract).toBeDefined();
  });

  it('should have composition rules', () => {
    expect(faction.restrictions.composition).toBeDefined();
    expect(faction.restrictions.composition?.total_operatives).toBe(6);
    expect(faction.restrictions.composition?.selection_limits?.leader_count).toBe(1);
    expect(faction.restrictions.composition?.selection_limits?.non_leader_count).toBe(5);
    expect(faction.restrictions.composition?.selection_limits?.max_unique_operatives).toBe(1);
    expect(faction.restrictions.composition?.selection_limits?.exception).toContain('Warrior');
  });

  it('should have 9 operatives', () => {
    expect(faction.operatives).toHaveLength(9);
  });

  it('should have 3 leader operatives', () => {
    const leaders = faction.operatives.filter(op => op.type === 'Leader');
    expect(leaders).toHaveLength(3);
    expect(leaders.map(l => l.name)).toContain('Assault Intercessor Sergeant');
    expect(leaders.map(l => l.name)).toContain('Intercessor Sergeant');
    expect(leaders.map(l => l.name)).toContain('Space Marine Captain');
  });

  it('should have 6 non-leader operatives', () => {
    const operatives = faction.operatives.filter(op => op.type === 'Operative');
    expect(operatives).toHaveLength(6);
  });

  describe('Operative Stats', () => {
    it('should have correct APL of 3 for all operatives', () => {
      faction.operatives.forEach(operative => {
        expect(operative.stats.actionPointLimit).toBe(3);
      });
    });

    it('should have correct movement for operatives', () => {
      const eliminator = faction.operatives.find(op => op.name === 'Eliminator Sniper');
      const heavyGunner = faction.operatives.find(op => op.name === 'Heavy Intercessor Gunner');
      
      expect(eliminator?.stats.movement).toBe(7);
      expect(heavyGunner?.stats.movement).toBe(5);
      
      // All other operatives should have movement 6
      const otherOperatives = faction.operatives.filter(
        op => op.name !== 'Eliminator Sniper' && op.name !== 'Heavy Intercessor Gunner'
      );
      otherOperatives.forEach(operative => {
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
    it('should have all required abilities', () => {
      const abilityNames = faction.abilities.map(a => a.name);
      expect(abilityNames).toContain('Heroic Leader');
      expect(abilityNames).toContain('Iron Halo');
      expect(abilityNames).toContain('Grenadier');
      expect(abilityNames).toContain('Camo Cloak');
      expect(abilityNames).toContain('Unyielding');
      expect(abilityNames).toContain('Chapter Veteran');
      expect(abilityNames).toContain('Doctrine Warfare (Assault/Tactical)');
      expect(abilityNames).toContain('Doctrine Warfare (Devastator/Tactical)');
    });

    it('should assign Grenadier to Assault Intercessor Grenadier', () => {
      const grenadier = faction.operatives.find(op => op.name === 'Assault Intercessor Grenadier');
      expect(grenadier?.abilities).toContain('Grenadier');
    });

    it('should assign Camo Cloak ability and Optics unique action to Eliminator Sniper', () => {
      const sniper = faction.operatives.find(op => op.name === 'Eliminator Sniper');
      expect(sniper?.abilities).toContain('Camo Cloak');
      expect(sniper?.unique_actions).toContain('optics');
    });

    it('should assign Unyielding to Heavy Intercessor Gunner', () => {
      const gunner = faction.operatives.find(op => op.name === 'Heavy Intercessor Gunner');
      expect(gunner?.abilities).toContain('Unyielding');
    });

    it('should assign Chapter Veteran and Doctrine Warfare to Assault Intercessor Sergeant', () => {
      const sergeant = faction.operatives.find(op => op.name === 'Assault Intercessor Sergeant');
      expect(sergeant?.abilities).toContain('Chapter Veteran');
      expect(sergeant?.abilities).toContain('Doctrine Warfare (Assault/Tactical)');
    });

    it('should assign Chapter Veteran and Doctrine Warfare to Intercessor Sergeant', () => {
      const sergeant = faction.operatives.find(op => op.name === 'Intercessor Sergeant');
      expect(sergeant?.abilities).toContain('Chapter Veteran');
      expect(sergeant?.abilities).toContain('Doctrine Warfare (Devastator/Tactical)');
    });

    it('should assign Heroic Leader and Iron Halo to Space Marine Captain', () => {
      const captain = faction.operatives.find(op => op.name === 'Space Marine Captain');
      expect(captain?.abilities).toContain('Heroic Leader');
      expect(captain?.abilities).toContain('Iron Halo');
    });
  });

  describe('Unique Actions', () => {
    it('should have Optics unique action defined', () => {
      const uniqueAction = faction.unique_actions?.find(ua => ua.id === 'optics');
      expect(uniqueAction).toBeDefined();
      expect(uniqueAction?.name).toBe('Optics');
      expect(uniqueAction?.cost).toBe('1AP');
    });

    it('should assign Optics unique action to Eliminator Sniper', () => {
      const sniper = faction.operatives.find(op => op.name === 'Eliminator Sniper');
      expect(sniper?.unique_actions).toContain('optics');
    });
  });

  describe('New Operatives', () => {
    it('should have Assault Intercessor Warrior', () => {
      const warrior = faction.operatives.find(op => op.name === 'Assault Intercessor Warrior');
      expect(warrior).toBeDefined();
      expect(warrior?.type).toBe('Operative');
      expect(warrior?.stats.wounds).toBe(14);
      expect(warrior?.stats.actionPointLimit).toBe(3);
      expect(warrior?.stats.movement).toBe(6);
      expect(warrior?.keywords).toContain('WARRIOR');
    });

    it('should have Intercessor Warrior', () => {
      const warrior = faction.operatives.find(op => op.name === 'Intercessor Warrior');
      expect(warrior).toBeDefined();
      expect(warrior?.type).toBe('Operative');
      expect(warrior?.stats.wounds).toBe(14);
      expect(warrior?.stats.actionPointLimit).toBe(3);
      expect(warrior?.stats.movement).toBe(6);
      expect(warrior?.keywords).toContain('WARRIOR');
    });

    it('should have Intercessor Gunner', () => {
      const gunner = faction.operatives.find(op => op.name === 'Intercessor Gunner');
      expect(gunner).toBeDefined();
      expect(gunner?.type).toBe('Operative');
      expect(gunner?.stats.wounds).toBe(14);
      expect(gunner?.stats.actionPointLimit).toBe(3);
      expect(gunner?.stats.movement).toBe(6);
      expect(gunner?.keywords).toContain('GUNNER');
    });
  });

  describe('Updated Weapon Profiles', () => {
    it('should have two profiles for Stalker Bolt Rifle', () => {
      const stalker = faction.weapons.find(w => w.name === 'Stalker bolt rifle');
      expect(stalker?.profiles).toHaveLength(2);
      expect(stalker?.profiles.map(p => p.name)).toContain('Heavy');
      expect(stalker?.profiles.map(p => p.name)).toContain('Mobile');
      
      const heavy = stalker?.profiles.find(p => p.name === 'Heavy');
      expect(heavy?.damage).toBe(3);
      expect(heavy?.criticalDamage).toBe(5);
      
      const mobile = stalker?.profiles.find(p => p.name === 'Mobile');
      expect(mobile?.damage).toBe(3);
      expect(mobile?.criticalDamage).toBe(4);
    });
  });

  describe('Ploys', () => {
    it('should have 8 ploys', () => {
      expect(faction.ploys).toBeDefined();
      expect(faction.ploys).toHaveLength(8);
    });

    it('should have 4 strategy ploys', () => {
      const strategyPloys = faction.ploys?.filter(p => p.type === 'strategy');
      expect(strategyPloys).toHaveLength(4);
      expect(strategyPloys?.map(p => p.name)).toContain('Combat Doctrine');
      expect(strategyPloys?.map(p => p.name)).toContain('And They Shall Know No Fear');
      expect(strategyPloys?.map(p => p.name)).toContain('Adaptive Tactics');
      expect(strategyPloys?.map(p => p.name)).toContain('Indomitus');
    });

    it('should have 4 firefight ploys', () => {
      const firefightPloys = faction.ploys?.filter(p => p.type === 'firefight');
      expect(firefightPloys).toHaveLength(4);
      expect(firefightPloys?.map(p => p.name)).toContain('Adjust Doctrine');
      expect(firefightPloys?.map(p => p.name)).toContain('Transhuman Physiology');
      expect(firefightPloys?.map(p => p.name)).toContain('Shock Assault');
      expect(firefightPloys?.map(p => p.name)).toContain('Wrath of Vengeance');
    });

    it('should have cost modifiers for Combat Doctrine', () => {
      const combatDoctrine = faction.ploys?.find(p => p.id === 'combat-doctrine');
      expect(combatDoctrine?.cost_modifiers).toBeDefined();
      expect(combatDoctrine?.cost_modifiers).toHaveLength(2);
      expect(combatDoctrine?.cost_modifiers?.[0]).toContain('Assault Intercessor Sergeant');
      expect(combatDoctrine?.cost_modifiers?.[1]).toContain('Intercessor Sergeant');
    });

    it('should have cost modifiers for Adjust Doctrine', () => {
      const adjustDoctrine = faction.ploys?.find(p => p.id === 'adjust-doctrine');
      expect(adjustDoctrine?.cost_modifiers).toBeDefined();
      expect(adjustDoctrine?.cost_modifiers).toHaveLength(1);
      expect(adjustDoctrine?.cost_modifiers?.[0]).toContain('Space Marine Captain');
    });

    it('should have cost modifiers for Wrath of Vengeance', () => {
      const wrathOfVengeance = faction.ploys?.find(p => p.id === 'wrath-of-vengeance');
      expect(wrathOfVengeance?.cost_modifiers).toBeDefined();
      expect(wrathOfVengeance?.cost_modifiers).toHaveLength(1);
      expect(wrathOfVengeance?.cost_modifiers?.[0]).toContain('Chapter Reliquaries');
    });

    it('should have correct descriptions for all ploys', () => {
      faction.ploys?.forEach(ploy => {
        expect(ploy.description).toBeDefined();
        expect(ploy.description.length).toBeGreaterThan(0);
        expect(ploy.cost).toBe(1);
      });
    });
  });
});
