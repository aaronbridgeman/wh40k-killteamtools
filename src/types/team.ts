/**
 * Type definitions for team building and selected teams
 */

import { Operative } from './operative';
import { GameTrackingState } from './game';

/**
 * Represents a selected operative with weapon choices
 */
export interface SelectedOperative {
  /** Unique ID for this selection instance (allows same operative multiple times) */
  selectionId: string;
  /** Reference to the operative */
  operative: Operative;
  /** Selected weapon IDs from the operative's available weapons */
  selectedWeaponIds: string[];
}

/**
 * Represents faction-specific rule choices (e.g., chapter tactics)
 */
export interface FactionRuleChoices {
  /** Faction ID this applies to */
  factionId: string;
  /** Map of choice category to selected rule ID */
  choices: Record<string, string>;
  /** Chapter tactics selections (primary and secondary) */
  chapterTactics?: {
    primary: string;
    secondary: string;
  };
}

/**
 * Complete team state
 */
export interface TeamState {
  /** Selected faction ID */
  factionId: string | null;
  /** List of selected operatives with weapons */
  selectedOperatives: SelectedOperative[];
  /** Faction-specific rule choices */
  ruleChoices: FactionRuleChoices | null;
}

/**
 * Game mode state with two teams
 */
export interface GameModeState {
  /** Kill Team Alpha state */
  alpha: TeamState;
  /** Kill Team Bravo state */
  bravo: TeamState;
  /** Game tracking state (turning point, initiative, CP, wounds) */
  gameTracking?: GameTrackingState;
}
