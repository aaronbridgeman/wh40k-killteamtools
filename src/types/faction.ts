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

export interface TeamRestrictions {
  /** Maximum number of operatives */
  maxOperatives?: number;
  /** Minimum number of operatives */
  minOperatives?: number;
  /** Fire team composition rules */
  fireTeamRules?: string[];
  /** Other restriction descriptions */
  other?: string[];
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
  /** Faction-specific rules */
  rules: FactionRule[];
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
