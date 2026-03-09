/**
 * Type definitions for the Quick Play Event feature.
 *
 * These types model the state for a Plague Marines quick play tournament event
 * consisting of exactly 3 games. They deliberately reuse existing types from
 * the broader codebase (Faction, Operative, Ploy, Equipment) for consistency.
 *
 * @see QUICK_PLAY_EVENT_SPEC.md for full feature specification.
 */

/**
 * State for a single turning point within a game, tracking ploy selections
 * and which firefight ploys have been used.
 */
export interface TurningPointState {
  /** ID of the strategic ploy selected at the start of this turning point, or null if not yet chosen */
  selectedStrategicPloyId: string | null;
  /** IDs of firefight ploys that have been used during this turning point */
  usedFirefightPloyIds: string[];
}

/**
 * State for a single game within the event.
 *
 * The Plague Marines roster always starts at 7 operatives (Nurgle's sacred number).
 * One operative (non-leader) is removed per game, leaving 6 active operatives.
 */
export interface GameEventState {
  /** Game number within the event (1–3) */
  gameNumber: 1 | 2 | 3;
  /**
   * ID of the operative removed from the 7-man roster for this game.
   * null means all 7 operatives are present (game not yet configured).
   * The leader (Plague Marine Champion) may never be removed.
   */
  removedOperativeId: string | null;
  /** IDs of equipment items selected for this game */
  selectedEquipmentIds: string[];
  /**
   * Remaining Blight Grenade uses for this game.
   * Maximum 2 per game. The Bombardier's Grenadier ability means his uses
   * do not count against this limit.
   */
  blightGrenadeUsesRemaining: number;
  /**
   * Current turning point (1–4).
   * 0 indicates the game has not started yet.
   */
  turningPoint: number;
  /** Current command point total for the player */
  commandPoints: number;
  /**
   * Per-turning-point ploy state, keyed by turning point number (1–4).
   * Populated lazily as turning points are reached.
   */
  turningPoints: Record<number, TurningPointState>;
  /**
   * IDs of operatives currently marked as Injured.
   * An injured operative is still active but visually flagged.
   * Physical wound tracking is handled on-board.
   */
  injuredOperativeIds: string[];
}

/**
 * Top-level state for the entire quick play event.
 *
 * This is the root object persisted to localStorage and (optionally) Google Drive.
 */
export interface QuickPlayEventState {
  /**
   * Schema version for future migrations.
   * Increment this when making breaking changes to the state structure.
   */
  version: number;
  /** Optional display name for the event (e.g. "Nurgle's Harvest GT") */
  eventName: string;
  /** Whether the initial event setup screen has been completed */
  setupComplete: boolean;
  /**
   * Zero-based index of the currently active game (0 = Game 1, 1 = Game 2, 2 = Game 3).
   */
  activeGameIndex: number;
  /**
   * State for each of the 3 games.
   * Always contains exactly 3 elements — one per game in the event.
   */
  games: GameEventState[];
  /**
   * Shared free-text notes / learnings, displayed at the bottom of the view
   * and persisted across all 3 games.
   */
  learnings: string;
}
