/**
 * Service for persisting team state to localStorage
 */

import { TeamState, GameModeState } from '@/types';

const STORAGE_KEY = 'kill-team-selected-team';
const GAME_MODE_STORAGE_KEY = 'kill-team-game-mode';

/**
 * Save team state to localStorage
 */
export function saveTeamState(teamState: TeamState): void {
  try {
    const serialized = JSON.stringify(teamState);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save team state:', error);
  }
}

/**
 * Load team state from localStorage
 */
export function loadTeamState(): TeamState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized) as TeamState;
  } catch (error) {
    console.error('Failed to load team state:', error);
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
    console.error('Failed to save game mode state:', error);
  }
}

/**
 * Load game mode state from localStorage
 */
export function loadGameModeState(): GameModeState | null {
  try {
    const serialized = localStorage.getItem(GAME_MODE_STORAGE_KEY);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized) as GameModeState;
  } catch (error) {
    console.error('Failed to load game mode state:', error);
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
  };
}
