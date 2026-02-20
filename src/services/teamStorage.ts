/**
 * Service for persisting team state to localStorage
 */

import { TeamState } from '@/types';

const STORAGE_KEY = 'kill-team-selected-team';

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
