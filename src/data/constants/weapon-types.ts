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
 * These extract the literal string values from the constants for type-safe usage in faction data
 */

/**
 * Weapon type - extracts "melee" | "ranged" from WEAPON_TYPES constant
 */
export type WeaponType = (typeof WEAPON_TYPES)[keyof typeof WEAPON_TYPES];

/**
 * Weapon rule name - extracts literal rule names from WEAPON_RULES constant
 * Use these values in weapon profile special rules to ensure consistency
 */
export type WeaponRuleName = (typeof WEAPON_RULES)[keyof typeof WEAPON_RULES];
