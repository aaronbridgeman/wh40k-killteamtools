/**
 * Shared constants for weapon types and terminology
 * Used across all factions to ensure consistency
 */

/**
 * Weapon type constants
 */
export const WEAPON_TYPES = {
  MELEE: 'melee',
  RANGED: 'ranged',
} as const;

/**
 * Common weapon rule names
 */
export const WEAPON_RULES = {
  ACCURATE: 'Accurate',
  BALANCED: 'Balanced',
  BLAST: 'Blast',
  BRUTAL: 'Brutal',
  CEASELESS: 'Ceaseless',
  DEVASTATING: 'Devastating',
  HEAVY: 'Heavy',
  HOT: 'Hot',
  LETHAL: 'Lethal',
  LIMITED: 'Limited',
  PIERCING: 'Piercing',
  PUNISHING: 'Punishing',
  RANGE: 'Range',
  RELENTLESS: 'Relentless',
  RENDING: 'Rending',
  SATURATE: 'Saturate',
  SEEK: 'Seek',
  SEVERE: 'Severe',
  SHOCK: 'Shock',
  SILENT: 'Silent',
  STUN: 'Stun',
  TORRENT: 'Torrent',
} as const;

/**
 * Type exports for type safety
 */
export type WeaponType = (typeof WEAPON_TYPES)[keyof typeof WEAPON_TYPES];
export type WeaponRuleName = (typeof WEAPON_RULES)[keyof typeof WEAPON_RULES];
