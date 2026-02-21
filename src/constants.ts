/**
 * Application constants
 * Centralized location for magic strings and configuration values
 */

// LocalStorage Keys
export const STORAGE_KEYS = {
  TEAM_STATE: 'kill-team-selected-team',
  GAME_MODE_STATE: 'kill-team-game-mode',
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
