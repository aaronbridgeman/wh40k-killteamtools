/**
 * Service for persisting team state to localStorage
 */

import { TeamState, GameModeState } from '@/types';
import { GameTrackingState } from '@/types/game';
import { STORAGE_KEYS, ERROR_MESSAGES } from '@/constants';

const STORAGE_KEY = STORAGE_KEYS.TEAM_STATE;
const GAME_MODE_STORAGE_KEY = STORAGE_KEYS.GAME_MODE_STATE;

/**
 * Save team state to localStorage
 */
export function saveTeamState(teamState: TeamState): void {
  try {
    const serialized = JSON.stringify(teamState);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    // Handle QuotaExceededError or other storage errors
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error(ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED, error);
      } else {
        console.error('Failed to save team state:', error.message);
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
 * Load team state from localStorage with validation
 */
export function loadTeamState(): TeamState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }

    const parsed = JSON.parse(serialized);

    // Basic validation - ensure required structure exists
    if (
      parsed &&
      typeof parsed === 'object' &&
      'selectedOperatives' in parsed &&
      Array.isArray(parsed.selectedOperatives)
    ) {
      return parsed as TeamState;
    }

    // Invalid structure - clear corrupted data
    console.warn(ERROR_MESSAGES.INVALID_DATA);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Failed to load team state:', error);
    // Clear corrupted data on parse error
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

/**
 * Clear team state from localStorage
 */
export function clearTeamState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear team state:', error);
  }
}

/**
 * Get initial team state (empty team)
 */
export function getInitialTeamState(): TeamState {
  return {
    factionId: null,
    selectedOperatives: [],
    ruleChoices: null,
  };
}

/**
 * Save game mode state (two teams) to localStorage
 */
export function saveGameModeState(gameModeState: GameModeState): void {
  try {
    const serialized = JSON.stringify(gameModeState);
    localStorage.setItem(GAME_MODE_STORAGE_KEY, serialized);
  } catch (error) {
    // Handle QuotaExceededError or other storage errors
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error(ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED, error);
      } else {
        console.error('Failed to save game mode state:', error.message);
      }
    }
    // Attempt to clear corrupted data
    try {
      localStorage.removeItem(GAME_MODE_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Load game mode state from localStorage with validation
 */
export function loadGameModeState(): GameModeState | null {
  try {
    const serialized = localStorage.getItem(GAME_MODE_STORAGE_KEY);
    if (!serialized) {
      return null;
    }

    const parsed = JSON.parse(serialized);

    // Basic validation - ensure required structure exists
    // gameTracking is optional
    if (
      parsed &&
      typeof parsed === 'object' &&
      'alpha' in parsed &&
      'bravo' in parsed &&
      parsed.alpha &&
      parsed.bravo &&
      typeof parsed.alpha === 'object' &&
      typeof parsed.bravo === 'object'
    ) {
      return parsed as GameModeState;
    }

    // Invalid structure - clear corrupted data
    console.warn(ERROR_MESSAGES.INVALID_DATA);
    localStorage.removeItem(GAME_MODE_STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Failed to load game mode state:', error);
    // Clear corrupted data on parse error
    try {
      localStorage.removeItem(GAME_MODE_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

/**
 * Clear game mode state from localStorage
 */
export function clearGameModeState(): void {
  try {
    localStorage.removeItem(GAME_MODE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game mode state:', error);
  }
}

/**
 * Get initial game mode state (two empty teams)
 */
export function getInitialGameModeState(): GameModeState {
  return {
    alpha: getInitialTeamState(),
    bravo: getInitialTeamState(),
    gameTracking: getInitialGameTrackingState(),
  };
}

/**
 * Get initial game tracking state
 */
export function getInitialGameTrackingState(): GameTrackingState {
  return {
    turningPoint: 1,
    initiative: null,
    alphaCommandPoints: 0,
    bravoCommandPoints: 0,
    alphaOperativeWounds: [],
    bravoOperativeWounds: [],
  };
}
