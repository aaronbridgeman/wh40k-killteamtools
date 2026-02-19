/**
 * Core type definitions for weapons
 */

export type WeaponType = 'ranged' | 'melee';

export interface WeaponRule {
  /** Rule name (e.g., "Piercing", "Lethal") */
  name: string;
  /** Rule parameter value if applicable */
  value?: number | string;
  /** Full rule description */
  description: string;
}

export interface WeaponProfile {
  /** Profile name for weapons with multiple modes */
  name?: string;
  /** Number of attack dice */
  attacks: number;
  /** Ballistic Skill for ranged weapons (target number) */
  ballisticSkill?: number;
  /** Weapon Skill for melee weapons (target number) */
  weaponSkill?: number;
  /** Normal damage */
  damage: number | string;
  /** Critical hit damage */
  criticalDamage: number | string;
  /** Special weapon rules */
  specialRules: WeaponRule[];
}

export interface Weapon {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Weapon type */
  type: WeaponType;
  /** Weapon profiles (can have multiple for different modes) */
  profiles: WeaponProfile[];
  /** Additional description */
  description?: string;
}
