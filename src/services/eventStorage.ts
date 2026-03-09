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
} from '@/types/event';
import {
  STORAGE_KEYS,
  ERROR_MESSAGES,
  QUICK_PLAY_DEFAULTS,
  GAME_DEFAULTS,
} from '@/constants';

const STORAGE_KEY = STORAGE_KEYS.QUICK_PLAY_EVENT;

// ---------------------------------------------------------------------------
// Initial state factories
// ---------------------------------------------------------------------------

/**
 * Returns the initial state for a single turning point.
 */
export function getInitialTurningPointState(): TurningPointState {
  return {
    selectedStrategicPloyId: null,
    usedFirefightPloyIds: [],
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
    injuredOperativeIds: [],
  };
}

/**
 * Returns the initial state for an entire quick play event with 3 games.
 */
export function getInitialEventState(): QuickPlayEventState {
  return {
    version: QUICK_PLAY_DEFAULTS.SCHEMA_VERSION,
    eventName: '',
    setupComplete: false,
    activeGameIndex: 0,
    games: [
      getInitialGameState(1),
      getInitialGameState(2),
      getInitialGameState(3),
    ],
    learnings: '',
  };
}

// ---------------------------------------------------------------------------
// localStorage persistence
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
 * If the saved schema version is older than the current version, a migration
 * should be applied here before returning the state.
 *
 * @returns The persisted event state, or null if unavailable
 */
export function loadEventState(): QuickPlayEventState | null {
  try {
    const serialised = localStorage.getItem(STORAGE_KEY);
    if (!serialised) {
      return null;
    }

    const parsed = JSON.parse(serialised);

    // Basic structural validation
    if (
      parsed &&
      typeof parsed === 'object' &&
      'games' in parsed &&
      Array.isArray(parsed.games) &&
      parsed.games.length === QUICK_PLAY_DEFAULTS.GAME_COUNT &&
      typeof parsed.setupComplete === 'boolean'
    ) {
      // Migrate: ensure each game has injuredOperativeIds (added later;
      // old saves may not have this field)
      const migratedGames = (parsed.games as GameEventState[]).map(
        (game: GameEventState) => ({
          ...game,
          injuredOperativeIds: game.injuredOperativeIds ?? [],
        })
      );
      return { ...parsed, games: migratedGames } as QuickPlayEventState;
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
 */
export function clearEventState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear event state:', error);
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
