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

export interface Operative {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Operative type (e.g., "Trooper", "Leader", "Heavy Gunner") */
  type: string;
  /** Core stats */
  stats: OperativeStats;
  /** Available weapons */
  weapons: string[]; // References to weapon IDs
  /** Special abilities */
  abilities: string[]; // References to ability IDs
  /** Operative keywords */
  keywords: string[];
  /** Points cost or fire team slots */
  cost: number;
  /** Path to operative image */
  image?: string;
  /** Additional description */
  description?: string;
}
