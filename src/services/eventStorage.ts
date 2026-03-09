/**
 * Service for persisting Quick Play Event state.
 *
 * Primary storage: localStorage (works offline, no authentication required,
 * fully compatible with GitHub Pages deployment).
 *
 * Secondary storage: Google Drive (stub — see QUICK_PLAY_EVENT_SPEC.md for
 * implementation requirements and Open Question #1).
 *
 * Follows the same save/load/clear pattern established in teamStorage.ts.
 *
 * @see QUICK_PLAY_EVENT_SPEC.md
 */

import {
  QuickPlayEventState,
  GameEventState,
  TurningPointState,
  LearningEntry,
} from '@/types/event';
import {
  STORAGE_KEYS,
  ERROR_MESSAGES,
  QUICK_PLAY_DEFAULTS,
  GAME_DEFAULTS,
} from '@/constants';

const STORAGE_KEY = STORAGE_KEYS.QUICK_PLAY_EVENT;
const LEARNINGS_STORAGE_KEY = STORAGE_KEYS.LEARNINGS_LOG;

// ---------------------------------------------------------------------------
// Legacy schema types for migration
// ---------------------------------------------------------------------------

/** Schema v1/v2/v3 turning point — used single `selectedStrategicPloyId` or v4 `selectedStrategicPloyIds` */
interface LegacyTurningPointStateV1 {
  selectedStrategicPloyId?: string | null; // v1/v2/v3 single ploy (legacy)
  selectedStrategicPloyIds?: string[]; // v4+ multiple ploys
  usedFirefightPloyIds?: string[];
  firefightPloyCounts?: Record<string, number>;
}

/** Schema v1/v2 game — may lack v3 fields */
interface LegacyGameStateV1 {
  gameNumber: 1 | 2 | 3;
  removedOperativeId: string | null;
  selectedEquipmentIds: string[];
  blightGrenadeUsesRemaining: number;
  turningPoint: number;
  commandPoints: number;
  turningPoints: Record<string, LegacyTurningPointStateV1>;
  injuredOperativeIds?: string[];
  incapacitatedOperativeIds?: string[];
  // v3 optional fields (may be absent when migrating from v2)
  gamePhase?: 'setup' | 'playing';
  opposition?: string;
  critOp?: string;
  tacOp?: string;
  killOpKillCount?: number;
  opponentCount?: number;
  // v6 optional fields (may be absent when migrating from v5)
  playerVP?: number;
  opponentVP?: number;
}

/** Schema v1/v2 root state — may include learningEntries (moved to separate storage in v3) */
interface LegacyEventStateV1 {
  version?: number;
  eventName: string;
  setupComplete: boolean;
  activeGameIndex: number;
  games: LegacyGameStateV1[];
  learnings?: string;
  learningEntries?: LearningEntry[];
}

// ---------------------------------------------------------------------------
// Initial state factories
// ---------------------------------------------------------------------------

/**
 * Returns the initial state for a single turning point.
 */
export function getInitialTurningPointState(): TurningPointState {
  return {
    selectedStrategicPloyIds: [],
    firefightPloyCounts: {},
  };
}

/**
 * Returns the initial state for a single game within the event.
 *
 * @param gameNumber - The game number (1, 2, or 3)
 */
export function getInitialGameState(gameNumber: 1 | 2 | 3): GameEventState {
  return {
    gameNumber,
    removedOperativeId: null,
    selectedEquipmentIds: [],
    blightGrenadeUsesRemaining: QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES,
    turningPoint: 0,
    commandPoints: QUICK_PLAY_DEFAULTS.STARTING_COMMAND_POINTS,
    turningPoints: {},
    incapacitatedOperativeIds: [],
    gamePhase: 'setup',
    opposition: '',
    critOp: '',
    tacOp: '',
    killOpKillCount: 0,
    opponentCount: 0,
    playerVP: 0,
    opponentVP: 0,
  };
}

/**
 * Returns the initial state for an entire quick play event with 3 games.
 * The event starts immediately without a setup screen (setupComplete is always true).
 */
export function getInitialEventState(): QuickPlayEventState {
  return {
    version: QUICK_PLAY_DEFAULTS.SCHEMA_VERSION,
    eventName: '',
    setupComplete: true,
    activeGameIndex: 0,
    games: [
      getInitialGameState(1),
      getInitialGameState(2),
      getInitialGameState(3),
    ],
  };
}

// ---------------------------------------------------------------------------
// localStorage persistence — event state
// ---------------------------------------------------------------------------

/**
 * Saves the Quick Play Event state to localStorage.
 *
 * @param state - The event state to persist
 */
export function saveEventState(state: QuickPlayEventState): void {
  try {
    const serialised = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialised);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error(ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED, error);
      } else {
        console.error('Failed to save event state:', error.message);
      }
    }
    // Attempt to clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Loads the Quick Play Event state from localStorage.
 * Returns null if no saved state exists or the saved data is invalid.
 *
 * Applies migrations for older schema versions:
 *  v1 → v2: rename `usedFirefightPloyIds`→`firefightPloyCounts`,
 *            rename `injuredOperativeIds`→`incapacitatedOperativeIds`,
 *            rename `learnings`→`learningEntries`.
 *  v2 → v3: add `gamePhase`, `opposition`, `critOp`, `tacOp`, `killOpKillCount`;
 *            migrate `learningEntries` from event state to separate learnings storage.
 *  v3 → v4: replace `selectedStrategicPloyId` with `selectedStrategicPloyIds` array.
 *  v4 → v5: add `opponentCount` per game.
 *  v5 → v6: add `playerVP`, `opponentVP` per game.
 *
 * @returns The persisted event state, or null if unavailable
 */
export function loadEventState(): QuickPlayEventState | null {
  try {
    const serialised = localStorage.getItem(STORAGE_KEY);
    if (!serialised) {
      return null;
    }

    const parsed = JSON.parse(serialised) as LegacyEventStateV1;

    // Basic structural validation
    if (
      parsed &&
      typeof parsed === 'object' &&
      'games' in parsed &&
      Array.isArray(parsed.games) &&
      parsed.games.length === QUICK_PLAY_DEFAULTS.GAME_COUNT &&
      typeof parsed.setupComplete === 'boolean'
    ) {
      // v2 → v3: if the old state had learningEntries, migrate them to
      // the separate learnings storage (only if separate storage is empty).
      if (
        Array.isArray(parsed.learningEntries) &&
        parsed.learningEntries.length > 0
      ) {
        const existing = loadLearningsLog();
        if (existing.length === 0) {
          saveLearningsLog(parsed.learningEntries);
        }
      }

      // Migrate each game's fields to the current schema
      const migratedGames = parsed.games.map(
        (game: LegacyGameStateV1): GameEventState => {
          // v1 → v2: rename injuredOperativeIds → incapacitatedOperativeIds
          const incapacitatedOperativeIds: string[] = Array.isArray(
            game.incapacitatedOperativeIds
          )
            ? game.incapacitatedOperativeIds
            : Array.isArray(game.injuredOperativeIds)
              ? game.injuredOperativeIds
              : [];

          // v1 → v2: migrate turning points
          const turningPoints: Record<number, TurningPointState> = {};
          if (game.turningPoints && typeof game.turningPoints === 'object') {
            for (const [tpKey, tpVal] of Object.entries(game.turningPoints)) {
              const tpCounts: Record<string, number> = {};
              if (tpVal.firefightPloyCounts !== undefined) {
                // Already v2 format — sanitise values to ensure they are numbers
                for (const [k, v] of Object.entries(
                  tpVal.firefightPloyCounts
                )) {
                  tpCounts[k] = typeof v === 'number' ? v : 0;
                }
              } else if (Array.isArray(tpVal.usedFirefightPloyIds)) {
                // Legacy v1: each entry in the list counts as one use
                tpVal.usedFirefightPloyIds.forEach((id) => {
                  tpCounts[id] = 1;
                });
              }
              turningPoints[Number(tpKey)] = {
                selectedStrategicPloyIds: Array.isArray(
                  tpVal.selectedStrategicPloyIds
                )
                  ? tpVal.selectedStrategicPloyIds // already v4 format
                  : tpVal.selectedStrategicPloyId // migrate from v1/v2/v3
                    ? [tpVal.selectedStrategicPloyId]
                    : [],
                firefightPloyCounts: tpCounts,
              };
            }
          }

          // v2 → v3: add new game fields with sensible defaults
          const gamePhase: 'setup' | 'playing' =
            game.gamePhase === 'playing'
              ? 'playing'
              : game.turningPoint > 0
                ? 'playing' // already started — treat as playing
                : 'setup';

          return {
            gameNumber: game.gameNumber,
            removedOperativeId: game.removedOperativeId,
            selectedEquipmentIds: game.selectedEquipmentIds,
            blightGrenadeUsesRemaining: game.blightGrenadeUsesRemaining,
            turningPoint: game.turningPoint,
            commandPoints: game.commandPoints,
            incapacitatedOperativeIds,
            turningPoints,
            gamePhase,
            opposition: game.opposition ?? '',
            critOp: game.critOp ?? '',
            tacOp: game.tacOp ?? '',
            killOpKillCount: game.killOpKillCount ?? 0,
            opponentCount: game.opponentCount ?? 0,
            playerVP: game.playerVP ?? 0,
            opponentVP: game.opponentVP ?? 0,
          };
        }
      );

      return {
        version: QUICK_PLAY_DEFAULTS.SCHEMA_VERSION,
        eventName: parsed.eventName,
        setupComplete: true, // always true in v3 — no setup screen
        activeGameIndex: parsed.activeGameIndex,
        games: migratedGames,
      };
    }

    // Invalid structure — clear corrupted data
    console.warn(ERROR_MESSAGES.INVALID_DATA);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Failed to load event state:', error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

/**
 * Clears the Quick Play Event state from localStorage.
 * Does NOT clear the learnings log — use clearLearningsLog() for that.
 */
export function clearEventState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear event state:', error);
  }
}

// ---------------------------------------------------------------------------
// localStorage persistence — learnings log (separate from event state)
// ---------------------------------------------------------------------------

/**
 * Saves the learnings log to its own localStorage key.
 * The log is stored separately from the event state so it survives resets.
 *
 * @param entries - The full list of learning entries to persist
 */
export function saveLearningsLog(entries: LearningEntry[]): void {
  try {
    localStorage.setItem(LEARNINGS_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to save learnings log:', error.message);
    }
  }
}

/**
 * Loads the learnings log from its own localStorage key.
 * Returns an empty array if no entries exist or the data is invalid.
 */
export function loadLearningsLog(): LearningEntry[] {
  try {
    const serialised = localStorage.getItem(LEARNINGS_STORAGE_KEY);
    if (!serialised) return [];
    const parsed = JSON.parse(serialised);
    return Array.isArray(parsed) ? (parsed as LearningEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Clears the learnings log from localStorage.
 */
export function clearLearningsLog(): void {
  try {
    localStorage.removeItem(LEARNINGS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear learnings log:', error);
  }
}

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------

/**
 * Returns the turning point state for a given turning point number,
 * initialising it with defaults if it has not been reached yet.
 *
 * @param game - The current game state
 * @param turningPointNumber - The turning point number (1–4)
 */
export function getTurningPointState(
  game: GameEventState,
  turningPointNumber: number
): TurningPointState {
  return (
    game.turningPoints[turningPointNumber] ?? getInitialTurningPointState()
  );
}

/**
 * Returns an updated game state with the given turning point state applied.
 *
 * @param game - The current game state
 * @param turningPointNumber - The turning point number to update (1–4)
 * @param tpState - The new turning point state
 */
export function updateTurningPointState(
  game: GameEventState,
  turningPointNumber: number,
  tpState: TurningPointState
): GameEventState {
  return {
    ...game,
    turningPoints: {
      ...game.turningPoints,
      [turningPointNumber]: tpState,
    },
  };
}

/**
 * Advances the turning point for a game, clearing used firefight ploy markers
 * for the new turning point and clamping to the maximum.
 *
 * @param game - The current game state
 * @returns Updated game state with incremented turning point
 */
export function advanceTurningPoint(game: GameEventState): GameEventState {
  const nextTp = Math.min(
    game.turningPoint + 1,
    GAME_DEFAULTS.MAX_TURNING_POINT
  );
  return {
    ...game,
    turningPoint: nextTp,
    // Initialise fresh turning point state (clears used firefight ploys)
    turningPoints: {
      ...game.turningPoints,
      [nextTp]: game.turningPoints[nextTp] ?? getInitialTurningPointState(),
    },
  };
}

// ---------------------------------------------------------------------------
// Google Drive — stub (not yet implemented)
// ---------------------------------------------------------------------------

/**
 * @stub Google Drive OAuth2 sign-in.
 *
 * To implement this feature:
 * 1. Create a Google Cloud project and enable the Drive API v3
 * 2. Configure an OAuth 2.0 Web Application client with the GitHub Pages origin
 * 3. Load the Google Identity Services script and call `google.accounts.oauth2.initTokenClient`
 * 4. Request the `https://www.googleapis.com/auth/drive.file` scope
 * 5. Store the access token in memory (never in localStorage — security risk)
 *
 * See Open Question #1 in QUICK_PLAY_EVENT_SPEC.md.
 *
 * @throws Error always — not yet implemented
 */
export async function signInWithGoogle(): Promise<void> {
  throw new Error(
    'Google Drive sync is not yet implemented. See Open Question #1 in QUICK_PLAY_EVENT_SPEC.md.'
  );
}

/**
 * @stub Saves the Quick Play Event state to Google Drive.
 *
 * When implemented, this will:
 * 1. Serialise state to JSON
 * 2. Create or update a file named `kill-team-event.json` in the user's Drive
 *    using the Drive Files API (multipart upload)
 *
 * @param _state - The event state to save (unused until implemented)
 * @throws Error always — not yet implemented
 */
export async function saveEventStateToGoogleDrive(
  _state: QuickPlayEventState
): Promise<void> {
  throw new Error(
    'Google Drive sync is not yet implemented. See Open Question #1 in QUICK_PLAY_EVENT_SPEC.md.'
  );
}

/**
 * @stub Loads the Quick Play Event state from Google Drive.
 *
 * When implemented, this will:
 * 1. Search for `kill-team-event.json` in the user's Drive
 * 2. Download and parse the file contents
 * 3. Validate and return the state
 *
 * @returns null always — not yet implemented
 */
export async function loadEventStateFromGoogleDrive(): Promise<QuickPlayEventState | null> {
  throw new Error(
    'Google Drive sync is not yet implemented. See Open Question #1 in QUICK_PLAY_EVENT_SPEC.md.'
  );
}
