/**
 * Core type definitions for equipment
 */

import { WeaponProfile, WeaponRule } from './weapon';

export type EquipmentCategory =
  | 'universal' // Available to all factions
  | 'faction'; // Faction-specific

export interface EquipmentEffect {
  /** Effect type (e.g., "terrain", "action", "weapon_modification", "stat_modification") */
  type: string;
  /** Description of the effect */
  description: string;
  /** Weapon rules added to friendly operatives (e.g., for Plague Rounds) */
  weaponRules?: WeaponRule[];
  /** Weapons affected by this effect (e.g., "boltguns", "bolt pistols") */
  affectedWeapons?: string[];
}

export interface Equipment {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Equipment category */
  category: EquipmentCategory;
  /** Full equipment description */
  description: string;
  /** Equipment effects */
  effects?: EquipmentEffect[];
  /** Weapon profile if equipment has attack actions (e.g., grenades) */
  weaponProfile?: WeaponProfile;
  /** Weapon type if equipment has attacks */
  weaponType?: 'ranged' | 'melee';
  /** Range in inches for weapon equipment */
  range?: string;
  /** Usage limits (e.g., "Once per turning point", "Max twice per battle") */
  usageLimit?: string;
  /** Keywords that restrict usage (e.g., ["ANGEL OF DEATH"]) */
  restrictedToKeywords?: string[];
  /** Quantity included in selection (e.g., "2x" for grenades) */
  quantity?: number;
}
