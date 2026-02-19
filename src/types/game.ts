/**
 * Type definitions for game state (future iterations)
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

// This file is a placeholder for future iterations
