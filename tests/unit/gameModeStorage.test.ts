/**
 * Unit tests for game mode team storage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveGameModeState,
  loadGameModeState,
  clearGameModeState,
  getInitialGameModeState,
} from '@/services/teamStorage';
import { GameModeState } from '@/types';

describe('gameModeStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getInitialGameModeState', () => {
    it('returns initial game mode state with two empty teams', () => {
      const state = getInitialGameModeState();
      
      expect(state.alpha).toBeDefined();
      expect(state.bravo).toBeDefined();
      
      expect(state.alpha.factionId).toBeNull();
      expect(state.alpha.selectedOperatives).toEqual([]);
      expect(state.alpha.ruleChoices).toBeNull();
      
      expect(state.bravo.factionId).toBeNull();
      expect(state.bravo.selectedOperatives).toEqual([]);
      expect(state.bravo.ruleChoices).toBeNull();
    });
  });

  describe('saveGameModeState and loadGameModeState', () => {
    it('saves and loads game mode state correctly', () => {
      const gameModeState: GameModeState = {
        alpha: {
          factionId: 'angels-of-death',
          selectedOperatives: [
            {
              selectionId: 'sel-1',
              operative: {
                id: 'op-1',
                name: 'Test Op Alpha',
                type: 'Trooper',
                stats: {
                  movement: 6,
                  actionPointLimit: 2,
                  groupActivation: 1,
                  defense: 3,
                  save: 3,
                  wounds: 18,
                },
                weapons: ['weapon-1'],
                abilities: [],
                keywords: [],
                cost: 1,
              },
              selectedWeaponIds: ['weapon-1'],
            },
          ],
          ruleChoices: {
            factionId: 'angels-of-death',
            choices: { primary: 'rule-1' },
          },
        },
        bravo: {
          factionId: 'plague-marines',
          selectedOperatives: [],
          ruleChoices: null,
        },
      };

      saveGameModeState(gameModeState);
      const loaded = loadGameModeState();

      expect(loaded).toEqual(gameModeState);
    });

    it('returns null when no game mode state is saved', () => {
      const loaded = loadGameModeState();
      expect(loaded).toBeNull();
    });

    it('handles both teams with full data', () => {
      const gameModeState: GameModeState = {
        alpha: {
          factionId: 'angels-of-death',
          selectedOperatives: [
            {
              selectionId: 'sel-alpha-1',
              operative: {
                id: 'op-alpha',
                name: 'Alpha Operative',
                type: 'Leader',
                stats: {
                  movement: 6,
                  actionPointLimit: 2,
                  groupActivation: 1,
                  defense: 3,
                  save: 3,
                  wounds: 18,
                },
                weapons: ['weapon-alpha'],
                abilities: [],
                keywords: [],
                cost: 1,
              },
              selectedWeaponIds: ['weapon-alpha'],
            },
          ],
          ruleChoices: {
            factionId: 'angels-of-death',
            choices: { chapter: 'ultramarines' },
          },
        },
        bravo: {
          factionId: 'plague-marines',
          selectedOperatives: [
            {
              selectionId: 'sel-bravo-1',
              operative: {
                id: 'op-bravo',
                name: 'Bravo Operative',
                type: 'Fighter',
                stats: {
                  movement: 5,
                  actionPointLimit: 2,
                  groupActivation: 1,
                  defense: 3,
                  save: 3,
                  wounds: 20,
                },
                weapons: ['weapon-bravo'],
                abilities: [],
                keywords: [],
                cost: 1,
              },
              selectedWeaponIds: ['weapon-bravo'],
            },
          ],
          ruleChoices: {
            factionId: 'plague-marines',
            choices: { blessing: 'nurgle' },
          },
        },
      };

      saveGameModeState(gameModeState);
      const loaded = loadGameModeState();

      expect(loaded).toEqual(gameModeState);
      expect(loaded?.alpha.selectedOperatives).toHaveLength(1);
      expect(loaded?.bravo.selectedOperatives).toHaveLength(1);
    });
  });

  describe('clearGameModeState', () => {
    it('clears saved game mode state', () => {
      const gameModeState: GameModeState = {
        alpha: {
          factionId: 'test-alpha',
          selectedOperatives: [],
          ruleChoices: null,
        },
        bravo: {
          factionId: 'test-bravo',
          selectedOperatives: [],
          ruleChoices: null,
        },
      };

      saveGameModeState(gameModeState);
      expect(loadGameModeState()).toEqual(gameModeState);

      clearGameModeState();
      expect(loadGameModeState()).toBeNull();
    });
  });
});
