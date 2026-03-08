/**
 * Application constants
 * Centralized location for magic strings and configuration values
 */

// LocalStorage Keys
export const STORAGE_KEYS = {
  TEAM_STATE: 'kill-team-selected-team',
  GAME_MODE_STATE: 'kill-team-game-mode',
  QUICK_PLAY_EVENT: 'kill-team-quick-play-event',
} as const;

// Team Identifiers
export const TEAM_IDS = {
  ALPHA: 'alpha',
  BRAVO: 'bravo',
} as const;

// View Modes
export const VIEW_MODES = {
  HOME: 'home',
  WEAPON_RULES: 'weapon-rules',
  ACTIONS: 'actions',
  GENERAL_RULES: 'general-rules',
  GAME_MODE: 'game-mode',
  QUICK_PLAY_EVENT: 'quick-play-event',
} as const;

// Team View Modes
export const TEAM_VIEW_MODES = {
  FACTION_INFO: 'faction-info',
  TEAM_SELECTION: 'team-selection',
} as const;

// Game Tracking Defaults
export const GAME_DEFAULTS = {
  INITIAL_TURNING_POINT: 1,
  INITIAL_COMMAND_POINTS: 0,
  MIN_TURNING_POINT: 1,
  MAX_TURNING_POINT: 4,
  MIN_COMMAND_POINTS: 0,
  MAX_COMMAND_POINTS: 20,
} as const;

// Quick Play Event Defaults
export const QUICK_PLAY_DEFAULTS = {
  /** Number of games in a quick play event (Nurgle's sacred number 3) */
  GAME_COUNT: 3,
  /** Total operatives in a Plague Marines roster (Nurgle's sacred number 7) */
  ROSTER_SIZE: 7,
  /** Starting CP per turning point */
  STARTING_COMMAND_POINTS: 2,
  /** Maximum Blight Grenade uses per game */
  MAX_BLIGHT_GRENADE_USES: 2,
  /** Current schema version for QuickPlayEventState */
  SCHEMA_VERSION: 1,
  /** Faction ID for the quick play event */
  FACTION_ID: 'plague-marines',
  /** ID of the Blight Grenades equipment item */
  BLIGHT_GRENADES_ID: 'blight-grenades',
  /** ID of the Plague Marine Bombardier operative */
  BOMBARDIER_ID: 'pm-plague-marine-bombardier',
  /** Synthetic weapon ID injected into Bombardier's OperativeCard when grenades are selected */
  GRENADIER_WEAPON_ID: 'event-blight-grenades-bombardier',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FACTION_LOAD_FAILED: 'Failed to load faction data. Please try again.',
  STORAGE_QUOTA_EXCEEDED:
    'Storage limit reached. Please clear some saved teams.',
  INVALID_DATA: 'Invalid data detected. Clearing corrupted data.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Accessibility Labels
export const ARIA_LABELS = {
  FACTION_SELECT: 'Select Faction:',
  OPERATIVE_SELECT: 'Jump to Operative:',
  INCREASE_TURNING_POINT: 'Increase turning point',
  DECREASE_TURNING_POINT: 'Decrease turning point',
  INCREASE_COMMAND_POINTS: 'Increase {team} command points',
  DECREASE_COMMAND_POINTS: 'Decrease {team} command points',
} as const;

// Export type for TypeScript
export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];
export type TeamViewMode =
  (typeof TEAM_VIEW_MODES)[keyof typeof TEAM_VIEW_MODES];
export type TeamId = (typeof TEAM_IDS)[keyof typeof TEAM_IDS];
