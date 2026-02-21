/**
 * Unit tests for Plague Marines faction data integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { loadFaction } from '@/services/dataLoader';
import { Faction } from '@/types';

describe('Plague Marines Faction Integration', () => {
  let faction: Faction;

  beforeAll(async () => {
    faction = await loadFaction('plague-marines');
  });

  it('should load Plague Marines faction successfully', async () => {
    expect(faction).toBeDefined();
    expect(faction.id).toBe('plague-marines');
    expect(faction.name).toBe('Plague Marines');
  });

  it('should have faction keywords', () => {
    expect(faction.faction_keywords).toBeDefined();
    expect(faction.faction_keywords).toContain('CHAOS');
    expect(faction.faction_keywords).toContain('HERETIC ASTARTES');
    expect(faction.faction_keywords).toContain('PLAGUE MARINE');
  });

  it('should have global rules', () => {
    expect(faction.global_rules).toBeDefined();
    expect(faction.global_rules?.astartes_multi_action).toBeDefined();
    expect(faction.global_rules?.disgustingly_resilient).toBeDefined();
    expect(faction.global_rules?.poison_mechanic).toBeDefined();
  });

  it('should have composition rules', () => {
    expect(faction.restrictions.composition).toBeDefined();
    expect(faction.restrictions.composition?.total_operatives).toBe(6);
    expect(
      faction.restrictions.composition?.selection_limits?.leader_count
    ).toBe(1);
    expect(
      faction.restrictions.composition?.selection_limits?.non_leader_count
    ).toBe(5);
    expect(
      faction.restrictions.composition?.selection_limits?.max_unique_operatives
    ).toBe(1);
    expect(faction.restrictions.composition?.selection_limits?.note).toContain(
      'once'
    );
  });

  it('should have 7 operatives', () => {
    expect(faction.operatives).toHaveLength(7);
  });

  it('should have 1 leader operative', () => {
    const leaders = faction.operatives.filter((op) => op.type === 'Leader');
    expect(leaders).toHaveLength(1);
    expect(leaders[0].name).toBe('Plague Marine Champion');
  });

  it('should have 6 non-leader operatives', () => {
    const operatives = faction.operatives.filter(
      (op) => op.type === 'Operative'
    );
    expect(operatives).toHaveLength(6);
  });

  describe('Operative Stats', () => {
    it('should have APL 3 for Champion', () => {
      const champion = faction.operatives.find(
        (op) => op.name === 'Plague Marine Champion'
      );
      expect(champion?.stats.actionPointLimit).toBe(3);
    });

    it('should have APL 3 for all non-leader operatives', () => {
      const operatives = faction.operatives.filter(
        (op) => op.type === 'Operative'
      );
      operatives.forEach((operative) => {
        expect(operative.stats.actionPointLimit).toBe(3);
      });
    });

    it('should have movement of 5" for all operatives', () => {
      faction.operatives.forEach((operative) => {
        expect(operative.stats.movement).toBe(5);
      });
    });

    it('should have save of 3+ for all operatives', () => {
      faction.operatives.forEach((operative) => {
        expect(operative.stats.save).toBe(3);
      });
    });

    it('should have 15 wounds for Champion', () => {
      const champion = faction.operatives.find(
        (op) => op.name === 'Plague Marine Champion'
      );
      expect(champion?.stats.wounds).toBe(15);
    });

    it('should have 14 wounds for non-leader operatives', () => {
      const operatives = faction.operatives.filter(
        (op) => op.type === 'Operative'
      );
      operatives.forEach((operative) => {
        expect(operative.stats.wounds).toBe(14);
      });
    });
  });

  describe('Fixed Loadouts', () => {
    it('should have fixed_loadout for Plague Marine Champion', () => {
      const champion = faction.operatives.find(
        (op) => op.name === 'Plague Marine Champion'
      );
      expect(champion?.fixed_loadout).toBeDefined();
      expect(champion?.fixed_loadout).toContain('Plasma pistol');
      expect(champion?.fixed_loadout).toContain('Plague sword');
    });

    it('should have fixed_loadout for Plague Marine Bombardier', () => {
      const bombardier = faction.operatives.find(
        (op) => op.name === 'Plague Marine Bombardier'
      );
      expect(bombardier?.fixed_loadout).toBeDefined();
      expect(bombardier?.fixed_loadout).toContain('Boltgun');
      expect(bombardier?.fixed_loadout).toContain('Fists');
    });

    it('should have fixed_loadout for Plague Marine Fighter', () => {
      const fighter = faction.operatives.find(
        (op) => op.name === 'Plague Marine Fighter'
      );
      expect(fighter?.fixed_loadout).toBeDefined();
      expect(fighter?.fixed_loadout).toContain('Flail of Corruption');
    });

    it('should have fixed_loadout for Plague Marine Heavy Gunner', () => {
      const gunner = faction.operatives.find(
        (op) => op.name === 'Plague Marine Heavy Gunner'
      );
      expect(gunner?.fixed_loadout).toBeDefined();
      expect(gunner?.fixed_loadout).toContain('Plague spewer');
      expect(gunner?.fixed_loadout).toContain('Fists');
    });

    it('should have fixed_loadout for Plague Marine Icon Bearer', () => {
      const iconBearer = faction.operatives.find(
        (op) => op.name === 'Plague Marine Icon Bearer'
      );
      expect(iconBearer?.fixed_loadout).toBeDefined();
      expect(iconBearer?.fixed_loadout).toContain('Bolt pistol');
      expect(iconBearer?.fixed_loadout).toContain('Plague knife');
    });

    it('should have fixed_loadout for Malignant Plaguecaster', () => {
      const plaguecaster = faction.operatives.find(
        (op) => op.name === 'Malignant Plaguecaster'
      );
      expect(plaguecaster?.fixed_loadout).toBeDefined();
      expect(plaguecaster?.fixed_loadout).toContain('Entropy');
      expect(plaguecaster?.fixed_loadout).toContain('Plague wind');
      expect(plaguecaster?.fixed_loadout).toContain('Corrupted staff');
    });

    it('should have fixed_loadout for Plague Marine Warrior', () => {
      const warrior = faction.operatives.find(
        (op) => op.name === 'Plague Marine Warrior'
      );
      expect(warrior?.fixed_loadout).toBeDefined();
      expect(warrior?.fixed_loadout).toContain('Boltgun');
      expect(warrior?.fixed_loadout).toContain('Plague knife');
    });
  });

  describe('Abilities', () => {
    it('should have abilities for Champion', () => {
      const champion = faction.operatives.find(
        (op) => op.name === 'Plague Marine Champion'
      );
      expect(champion?.abilities).toContain("Grandfather's Blessing");
    });

    it('should have abilities for Bombardier', () => {
      const bombardier = faction.operatives.find(
        (op) => op.name === 'Plague Marine Bombardier'
      );
      expect(bombardier?.abilities).toContain('Grenadier');
    });

    it('should have abilities for Icon Bearer', () => {
      const iconBearer = faction.operatives.find(
        (op) => op.name === 'Plague Marine Icon Bearer'
      );
      expect(iconBearer?.abilities).toContain('Icon Bearer');
      expect(iconBearer?.abilities).toContain('Icon of Contagion');
    });

    it('should have abilities for Warrior', () => {
      const warrior = faction.operatives.find(
        (op) => op.name === 'Plague Marine Warrior'
      );
      expect(warrior?.abilities).toContain('Repulsive Fortitude');
    });
  });

  describe('Weapon Rules', () => {
    it('should have weapon_rules for Champion', () => {
      const champion = faction.operatives.find(
        (op) => op.name === 'Plague Marine Champion'
      );
      expect(champion?.weapon_rules).toContain('Toxic');
    });

    it('should have weapon_rules for Bombardier', () => {
      const bombardier = faction.operatives.find(
        (op) => op.name === 'Plague Marine Bombardier'
      );
      expect(bombardier?.weapon_rules).toContain('Toxic');
    });

    it('should have weapon_rules for Heavy Gunner', () => {
      const gunner = faction.operatives.find(
        (op) => op.name === 'Plague Marine Heavy Gunner'
      );
      expect(gunner?.weapon_rules).toContain('Torrent 2"');
      expect(gunner?.weapon_rules).toContain('Poison');
    });
  });

  describe('Unique Actions', () => {
    it('should have unique_actions for Fighter', () => {
      const fighter = faction.operatives.find(
        (op) => op.name === 'Plague Marine Fighter'
      );
      expect(fighter?.unique_actions).toBeDefined();
      expect(fighter?.unique_actions?.length).toBeGreaterThan(0);
      expect(fighter?.unique_actions?.[0]).toContain('Flail');
      expect(fighter?.unique_actions?.[0]).toContain('D3+2');
    });

    it('should have unique_actions for Plaguecaster', () => {
      const plaguecaster = faction.operatives.find(
        (op) => op.name === 'Malignant Plaguecaster'
      );
      expect(plaguecaster?.unique_actions).toContain(
        'Poisonous Miasma (Psychic)'
      );
      expect(plaguecaster?.unique_actions).toContain(
        'Putrescent Vitality (Psychic)'
      );
    });
  });

  describe('Keywords', () => {
    it('should have PSYKER keyword for Malignant Plaguecaster', () => {
      const plaguecaster = faction.operatives.find(
        (op) => op.name === 'Malignant Plaguecaster'
      );
      expect(plaguecaster?.keywords).toContain('PSYKER');
    });

    it('should have standard keywords for all operatives', () => {
      faction.operatives.forEach((operative) => {
        expect(operative.keywords).toContain('CHAOS');
        expect(operative.keywords).toContain('HERETIC ASTARTES');
        expect(operative.keywords).toContain('PLAGUE MARINE');
      });
    });
  });

  describe('Weapons', () => {
    it('should have all required weapons', () => {
      const weaponNames = faction.weapons.map((w) => w.name);

      // Ranged weapons
      expect(weaponNames).toContain('Boltgun');
      expect(weaponNames).toContain('Bolt pistol');
      expect(weaponNames).toContain('Plasma pistol');
      expect(weaponNames).toContain('Plague spewer');
      expect(weaponNames).toContain('Entropy');
      expect(weaponNames).toContain('Plague wind');

      // Melee weapons
      expect(weaponNames).toContain('Plague knife');
      expect(weaponNames).toContain('Plague sword');
      expect(weaponNames).toContain('Flail of Corruption');
      expect(weaponNames).toContain('Corrupted staff');
      expect(weaponNames).toContain('Fists');
    });

    it('should have multiple profiles for Plasma pistol', () => {
      const plasmaPistol = faction.weapons.find(
        (w) => w.name === 'Plasma pistol'
      );
      expect(plasmaPistol?.profiles).toHaveLength(2);
      expect(plasmaPistol?.profiles.map((p) => p.name)).toContain('Standard');
      expect(plasmaPistol?.profiles.map((p) => p.name)).toContain(
        'Supercharge'
      );
    });

    it('should have Torrent rule for Plague spewer', () => {
      const plagueSpewer = faction.weapons.find(
        (w) => w.name === 'Plague spewer'
      );
      const torrentRule = plagueSpewer?.profiles[0].specialRules.find(
        (r) => r.name === 'Torrent'
      );
      expect(torrentRule).toBeDefined();
      expect(torrentRule?.value).toBe('2"');
    });

    it('should have Blast rule for Plague wind', () => {
      const plagueWind = faction.weapons.find((w) => w.name === 'Plague wind');
      const blastRule = plagueWind?.profiles[0].specialRules.find(
        (r) => r.name === 'Blast'
      );
      expect(blastRule).toBeDefined();
      expect(blastRule?.value).toBe('2"');
    });

    it('should have Blast rule for Flail of Corruption', () => {
      const flail = faction.weapons.find(
        (w) => w.name === 'Flail of Corruption'
      );
      const blastRule = flail?.profiles[0].specialRules.find(
        (r) => r.name === 'Blast'
      );
      expect(blastRule).toBeDefined();
    });
  });

  describe('Abilities Definitions', () => {
    it('should have ability definitions', () => {
      const abilityNames = faction.abilities.map((a) => a.name);
      expect(abilityNames).toContain("Grandfather's Blessing");
      expect(abilityNames).toContain('Grenadier');
      expect(abilityNames).toContain('Icon Bearer');
      expect(abilityNames).toContain('Icon of Contagion');
      expect(abilityNames).toContain('Repulsive Fortitude');
    });
  });
});
