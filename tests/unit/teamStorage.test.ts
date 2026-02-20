/**
 * Unit tests for teamStorage service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveTeamState,
  loadTeamState,
  clearTeamState,
  getInitialTeamState,
} from '@/services/teamStorage';
import { TeamState } from '@/types';

describe('teamStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getInitialTeamState', () => {
    it('returns an empty team state', () => {
      const state = getInitialTeamState();
      expect(state.factionId).toBeNull();
      expect(state.selectedOperatives).toEqual([]);
      expect(state.ruleChoices).toBeNull();
    });
  });

  describe('saveTeamState and loadTeamState', () => {
    it('saves and loads team state correctly', () => {
      const teamState: TeamState = {
        factionId: 'angels-of-death',
        selectedOperatives: [
          {
            selectionId: 'sel-1',
            operative: {
              id: 'op-1',
              name: 'Test Op',
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
      };

      saveTeamState(teamState);
      const loaded = loadTeamState();

      expect(loaded).toEqual(teamState);
    });

    it('returns null when no state is saved', () => {
      const loaded = loadTeamState();
      expect(loaded).toBeNull();
    });
  });

  describe('clearTeamState', () => {
    it('clears saved team state', () => {
      const teamState: TeamState = {
        factionId: 'test',
        selectedOperatives: [],
        ruleChoices: null,
      };

      saveTeamState(teamState);
      expect(loadTeamState()).toEqual(teamState);

      clearTeamState();
      expect(loadTeamState()).toBeNull();
    });
  });
});
