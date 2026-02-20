/**
 * Type definitions for game state
 */

export interface GameState {
  /** Current turning point */
  turningPoint: number;
  /** Active team */
  activeTeam: 'home' | 'away';
  /** Command points for home team */
  homeCommandPoints: number;
  /** Command points for away team */
  awayCommandPoints: number;
  /** Victory points for home team */
  homeVictoryPoints: number;
  /** Victory points for away team */
  awayVictoryPoints: number;
}

export interface OperativeState {
  /** Reference to operative ID */
  operativeId: string;
  /** Current wounds */
  currentWounds: number;
  /** Whether operative is injured */
  injured: boolean;
  /** Whether operative is incapacitated */
  incapacitated: boolean;
  /** Whether operative has activated this turning point */
  activated: boolean;
  /** Status effects */
  statusEffects: string[];
}

/**
 * Tracking state for a single operative's wounds
 */
export interface OperativeWoundState {
  /** Selection ID of the operative (from SelectedOperative) */
  selectionId: string;
  /** Current wounds remaining */
  currentWounds: number;
  /** Maximum wounds (from operative profile) */
  maxWounds: number;
}

/**
 * Game tracking state for game management
 */
export interface GameTrackingState {
  /** Current turning point (1-4) */
  turningPoint: number;
  /** Which team has initiative ('alpha' | 'bravo') */
  initiative: 'alpha' | 'bravo' | null;
  /** Command points for Alpha team */
  alphaCommandPoints: number;
  /** Command points for Bravo team */
  bravoCommandPoints: number;
  /** Wound tracking for Alpha team operatives */
  alphaOperativeWounds: OperativeWoundState[];
  /** Wound tracking for Bravo team operatives */
  bravoOperativeWounds: OperativeWoundState[];
}
