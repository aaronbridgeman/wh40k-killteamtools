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
 * A single learning / note entry submitted during or after the event.
 */
export interface LearningEntry {
  /** Unique identifier (timestamp-based) */
  id: string;
  /** The note text */
  text: string;
  /** ISO 8601 timestamp when the entry was submitted */
  timestamp: string;
  /** Optional: the opposing kill team faction */
  oppositionTeam?: string;
  /** Optional: the Critical Operation played */
  critOp?: string;
  /** Optional: the Tactical Objective played */
  tacOp?: string;
  /** Optional: the map / killzone used */
  map?: string;
}

/**
 * State for a single turning point within a game, tracking ploy selections
 * and how many times each firefight ploy has been used.
 */
export interface TurningPointState {
  /**
   * IDs of strategic ploys active at the start of this turning point.
   * Multiple ploys may be active simultaneously; each deducts its own CP cost.
   * Replaces the old `selectedStrategicPloyId: string | null` field (schema v3).
   */
  selectedStrategicPloyIds: string[];
  /**
   * Number of times each firefight ploy has been used this turning point,
   * keyed by ploy ID. Absent keys mean 0 uses.
   * Replaces the old `usedFirefightPloyIds: string[]` field (schema v1).
   */
  firefightPloyCounts: Record<string, number>;
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
   * 0 indicates the game has not started yet (still in setup phase).
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
   * IDs of operatives currently marked as Incapacitated (removed from play).
   * An incapacitated operative is still on the roster but is out of action.
   * Physical wound tracking is handled on-board.
   */
  incapacitatedOperativeIds: string[];
  /**
   * IDs of operatives currently marked as Injured.
   * An injured operative has dropped below half wounds during the game.
   * Tracked for reference only — no stat changes are applied in Quick Play.
   * When Plague Bells are selected, injury has no stat effect (already the case).
   */
  injuredOperativeIds: string[];
  /**
   * Current phase of this game.
   * 'setup': player is configuring the roster, equipment, and objectives.
   * 'playing': game is in progress (TP 1–4 active).
   */
  gamePhase: 'setup' | 'playing';
  /** Optional: the opposing kill team faction for this game */
  opposition: string;
  /** Optional: the Critical Operation objective selected for this game */
  critOp: string;
  /** Optional: the Tactical Operation objective selected for this game */
  tacOp: string;
  /**
   * Number of enemy operatives incapacitated (kills) made during this game.
   * Used to track Kill Op scoring.
   */
  killOpKillCount: number;
  /**
   * Total number of operatives on the opponent's team.
   * Used to compute Kill Op score thresholds (level tiers).
   * 0 means not set; falls back to fixed thresholds (1=L1, 2=L2, 3+=L3).
   */
  opponentCount: number;
  /**
   * Player's final Victory Points for this game.
   * Recorded at the end of the game for tournament scoring purposes.
   * 0 = not yet recorded.
   */
  playerVP: number;
  /**
   * Opponent's final Victory Points for this game.
   * Recorded at the end of the game for tournament scoring purposes.
   * 0 = not yet recorded.
   */
  opponentVP: number;
  /**
   * Whether the Icon Bearer is currently within the opponent's territory.
   * When true and the Icon Bearer is active (alive, not incapacitated),
   * the Contagion strategic ploy costs 0 CP.
   * Toggled manually by the player during the game.
   */
  iconBearerInEnemyTerritory: boolean;
}

/**
 * Top-level state for the entire quick play event.
 *
 * Learning entries are stored separately via eventStorage.saveLearningsLog /
 * loadLearningsLog so they survive event resets.
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
  /**
   * Whether the initial event setup screen has been completed.
   * Always true in schema v3 — the setup screen has been removed.
   */
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
}
