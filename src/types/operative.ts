/**
 * Core type definitions for Kill Team operatives
 */

export interface OperativeStats {
  /** Movement in inches */
  movement: number;
  /** Action Point Limit */
  actionPointLimit: number;
  /** Group Activation */
  groupActivation: number;
  /** Defense dice */
  defense: number;
  /** Save target number */
  save: number;
  /** Wounds */
  wounds: number;
}

/**
 * Weapon options for operatives with loadout choices
 */
export interface WeaponOptions {
  /** Standard loadout groups with slots */
  standard_loadout_groups?: Array<Record<string, string | string[]>>;
  /** Alternative complete loadouts */
  alternative_loadouts?: Array<{ fixed: string[] }>;
  /** Fixed secondary weapon */
  fixed_secondary?: string;
  /** Ammo profiles for special ammunition types */
  ammo_profiles?: string[];
  /** Firing profiles for different firing modes */
  firing_profiles?: string[];
  /** Direct slot definitions for weapon choices */
  [key: string]:
    | string
    | string[]
    | Array<Record<string, string | string[]>>
    | Array<{ fixed: string[] }>
    | undefined;
}

export interface Operative {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Operative type (e.g., "Trooper", "Leader", "Heavy Gunner") */
  type: string;
  /** Core stats */
  stats: OperativeStats;
  /** Available weapons (for backward compatibility) */
  weapons?: string[]; // References to weapon IDs
  /** Fixed loadout (for operatives with no weapon choices) */
  fixed_loadout?: string[];
  /** Weapon options (for operatives with loadout choices) */
  weapon_options?: WeaponOptions;
  /** Special abilities */
  abilities?: string[]; // References to ability IDs
  /** Operative keywords */
  keywords?: string[];
  /** Points cost or fire team slots */
  cost?: number;
  /** Path to operative image */
  image?: string;
  /** Additional description */
  description?: string;
}
