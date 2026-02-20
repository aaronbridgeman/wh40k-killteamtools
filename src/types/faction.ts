/**
 * Core type definitions for factions and team rules
 */

import { Operative } from './operative';
import { Weapon } from './weapon';
import { Ability } from './ability';

export interface FactionRule {
  /** Unique identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Rule type */
  type: 'strategic' | 'tactical' | 'passive';
}

export interface CompositionRules {
  /** Total number of operatives in kill team */
  total_operatives?: number;
  /** Specific selection limits */
  selection_limits?: {
    /** Number of leader operatives required */
    leader_count?: number;
    /** Number of non-leader operatives */
    non_leader_count?: number;
    /** Maximum number of any unique operative (except exceptions) */
    max_unique_operatives?: number;
    /** Exception text for operatives that can be taken multiple times */
    exception?: string;
  };
}

export interface TeamRestrictions {
  /** Maximum number of operatives */
  maxOperatives?: number;
  /** Minimum number of operatives */
  minOperatives?: number;
  /** Fire team composition rules */
  fireTeamRules?: string[];
  /** Other restriction descriptions */
  other?: string[];
  /** Detailed composition rules (new structure) */
  composition?: CompositionRules;
}

export interface FactionMetadata {
  /** Data version */
  version: string;
  /** Source rulebook or supplement */
  source: string;
  /** Last update date (ISO format) */
  lastUpdated: string;
}

export interface Faction {
  /** Unique identifier (e.g., "angels-of-death") */
  id: string;
  /** Display name */
  name: string;
  /** Faction description */
  description: string;
  /** Faction keywords (e.g., ["IMPERIUM", "ADEPTUS ASTARTES"]) */
  faction_keywords?: string[];
  /** Faction-specific rules */
  rules: FactionRule[];
  /** Global rules applying to the faction */
  global_rules?: Record<string, string>;
  /** Available operatives */
  operatives: Operative[];
  /** Available weapons */
  weapons: Weapon[];
  /** Available abilities */
  abilities: Ability[];
  /** Team building restrictions */
  restrictions: TeamRestrictions;
  /** Metadata */
  metadata: FactionMetadata;
}
