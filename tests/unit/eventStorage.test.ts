/**
 * Unit tests for Quick Play Event storage service.
 *
 * Follows the same pattern as gameModeStorage.test.ts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInitialEventState,
  getInitialGameState,
  getInitialTurningPointState,
  saveEventState,
  loadEventState,
  clearEventState,
  getTurningPointState,
  updateTurningPointState,
  advanceTurningPoint,
} from '@/services/eventStorage';
import { QuickPlayEventState, GameEventState } from '@/types/event';
import { QUICK_PLAY_DEFAULTS, GAME_DEFAULTS } from '@/constants';

describe('eventStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ------------------------------------------------------------------
  // Initial state factories
  // ------------------------------------------------------------------

  describe('getInitialEventState', () => {
    it('returns state with exactly 3 games', () => {
      const state = getInitialEventState();
      expect(state.games).toHaveLength(QUICK_PLAY_DEFAULTS.GAME_COUNT);
    });

    it('returns state with setupComplete=false', () => {
      const state = getInitialEventState();
      expect(state.setupComplete).toBe(false);
    });

    it('returns state with empty eventName', () => {
      const state = getInitialEventState();
      expect(state.eventName).toBe('');
    });

    it('returns state with activeGameIndex=0', () => {
      const state = getInitialEventState();
      expect(state.activeGameIndex).toBe(0);
    });

    it('returns empty learningEntries', () => {
      const state = getInitialEventState();
      expect(state.learningEntries).toEqual([]);
    });

    it('returns state with correct schema version', () => {
      const state = getInitialEventState();
      expect(state.version).toBe(QUICK_PLAY_DEFAULTS.SCHEMA_VERSION);
    });

    it('games are numbered 1, 2, 3', () => {
      const state = getInitialEventState();
      expect(state.games[0].gameNumber).toBe(1);
      expect(state.games[1].gameNumber).toBe(2);
      expect(state.games[2].gameNumber).toBe(3);
    });
  });

  describe('getInitialGameState', () => {
    it('returns correct game number', () => {
      expect(getInitialGameState(1).gameNumber).toBe(1);
      expect(getInitialGameState(2).gameNumber).toBe(2);
      expect(getInitialGameState(3).gameNumber).toBe(3);
    });

    it('returns no removed operative', () => {
      const game = getInitialGameState(1);
      expect(game.removedOperativeId).toBeNull();
    });

    it('returns empty equipment selection', () => {
      const game = getInitialGameState(1);
      expect(game.selectedEquipmentIds).toEqual([]);
    });

    it('returns max blight grenade uses', () => {
      const game = getInitialGameState(1);
      expect(game.blightGrenadeUsesRemaining).toBe(
        QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES
      );
    });

    it('returns turningPoint=0 (not started)', () => {
      const game = getInitialGameState(1);
      expect(game.turningPoint).toBe(0);
    });

    it('returns starting command points', () => {
      const game = getInitialGameState(1);
      expect(game.commandPoints).toBe(QUICK_PLAY_DEFAULTS.STARTING_COMMAND_POINTS);
    });

    it('returns empty turningPoints record', () => {
      const game = getInitialGameState(1);
      expect(game.turningPoints).toEqual({});
    });

    it('returns empty incapacitatedOperativeIds', () => {
      const game = getInitialGameState(1);
      expect(game.incapacitatedOperativeIds).toEqual([]);
    });
  });

  describe('getInitialTurningPointState', () => {
    it('returns no selected strategic ploy', () => {
      const tp = getInitialTurningPointState();
      expect(tp.selectedStrategicPloyId).toBeNull();
    });

    it('returns empty firefightPloyCounts', () => {
      const tp = getInitialTurningPointState();
      expect(tp.firefightPloyCounts).toEqual({});
    });
  });

  // ------------------------------------------------------------------
  // localStorage save / load / clear
  // ------------------------------------------------------------------

  describe('saveEventState and loadEventState', () => {
    it('saves and loads state correctly', () => {
      const state = getInitialEventState();
      state.eventName = 'Test Event';
      state.setupComplete = true;
      state.learningEntries = [{ id: '1', text: 'Game 1 notes', timestamp: new Date().toISOString() }];

      saveEventState(state);
      const loaded = loadEventState();

      expect(loaded).not.toBeNull();
      expect(loaded!.eventName).toBe('Test Event');
      expect(loaded!.setupComplete).toBe(true);
      expect(loaded!.learningEntries).toHaveLength(1);
      expect(loaded!.learningEntries[0].text).toBe('Game 1 notes');
      expect(loaded!.games).toHaveLength(3);
    });

    it('preserves game state correctly', () => {
      const state = getInitialEventState();
      state.games[0].removedOperativeId = 'pm-plague-marine-warrior';
      state.games[0].commandPoints = 5;
      state.games[0].selectedEquipmentIds = ['blight-grenades'];

      saveEventState(state);
      const loaded = loadEventState();

      expect(loaded!.games[0].removedOperativeId).toBe('pm-plague-marine-warrior');
      expect(loaded!.games[0].commandPoints).toBe(5);
      expect(loaded!.games[0].selectedEquipmentIds).toEqual(['blight-grenades']);
    });
  });

  describe('loadEventState (missing)', () => {
    it('returns null when no saved state exists', () => {
      const loaded = loadEventState();
      expect(loaded).toBeNull();
    });
  });

  describe('loadEventState (migration)', () => {
    it('migrates v1 save: adds incapacitatedOperativeIds, converts usedFirefightPloyIds→firefightPloyCounts, adds learningEntries', () => {
      // Simulate an old v1 save that predates the v2 schema
      const oldState = {
        version: 1,
        eventName: 'Old Event',
        setupComplete: true,
        activeGameIndex: 0,
        learnings: 'Old free-text learnings',
        games: [
          { gameNumber: 1, removedOperativeId: 'pm-plague-marine-warrior', selectedEquipmentIds: ['blight-grenades'], blightGrenadeUsesRemaining: 1, turningPoint: 2, commandPoints: 3, turningPoints: { 1: { selectedStrategicPloyId: 'contagion', usedFirefightPloyIds: ['virulent-poison'] } } },
          { gameNumber: 2, removedOperativeId: null, selectedEquipmentIds: [], blightGrenadeUsesRemaining: 2, turningPoint: 0, commandPoints: 0, turningPoints: {} },
          { gameNumber: 3, removedOperativeId: null, selectedEquipmentIds: [], blightGrenadeUsesRemaining: 2, turningPoint: 0, commandPoints: 0, turningPoints: {} },
        ],
      };
      localStorage.setItem('kill-team-quick-play-event', JSON.stringify(oldState));

      const loaded = loadEventState()!;
      expect(loaded).not.toBeNull();

      // All games should have incapacitatedOperativeIds defaulted to []
      loaded.games.forEach((game) => {
        expect(game.incapacitatedOperativeIds).toEqual([]);
      });

      // usedFirefightPloyIds converted to firefightPloyCounts
      expect(loaded.games[0].turningPoints[1].firefightPloyCounts).toEqual({ 'virulent-poison': 1 });

      // learnings string is dropped; learningEntries is an empty array
      expect(loaded.learningEntries).toEqual([]);

      // All existing fields should be preserved without modification
      expect(loaded.games[0].gameNumber).toBe(1);
      expect(loaded.games[0].removedOperativeId).toBe('pm-plague-marine-warrior');
      expect(loaded.games[0].selectedEquipmentIds).toEqual(['blight-grenades']);
      expect(loaded.games[0].blightGrenadeUsesRemaining).toBe(1);
      expect(loaded.games[0].turningPoint).toBe(2);
      expect(loaded.games[0].commandPoints).toBe(3);
      expect(loaded.games[0].turningPoints[1].selectedStrategicPloyId).toBe('contagion');
    });
  });

  describe('loadEventState (corrupt)', () => {
    it('returns null and clears storage for invalid JSON', () => {
      localStorage.setItem('kill-team-quick-play-event', 'not-valid-json{{{');
      const loaded = loadEventState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem('kill-team-quick-play-event')).toBeNull();
    });

    it('returns null and clears storage for structurally invalid data', () => {
      localStorage.setItem(
        'kill-team-quick-play-event',
        JSON.stringify({ foo: 'bar' })
      );
      const loaded = loadEventState();
      expect(loaded).toBeNull();
    });
  });

  describe('clearEventState', () => {
    it('removes event state from localStorage', () => {
      saveEventState(getInitialEventState());
      expect(loadEventState()).not.toBeNull();

      clearEventState();
      expect(loadEventState()).toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // State helpers
  // ------------------------------------------------------------------

  describe('getTurningPointState', () => {
    it('returns initialised turning point state when TP exists in game', () => {
      const game: GameEventState = {
        ...getInitialGameState(1),
        turningPoints: {
          2: { selectedStrategicPloyId: 'contagion', firefightPloyCounts: {} },
        },
      };
      const tp = getTurningPointState(game, 2);
      expect(tp.selectedStrategicPloyId).toBe('contagion');
    });

    it('returns default turning point state when TP does not exist', () => {
      const game = getInitialGameState(1);
      const tp = getTurningPointState(game, 3);
      expect(tp.selectedStrategicPloyId).toBeNull();
      expect(tp.firefightPloyCounts).toEqual({});
    });
  });

  describe('updateTurningPointState', () => {
    it('returns updated game with new TP state', () => {
      const game = getInitialGameState(1);
      const updatedGame = updateTurningPointState(game, 1, {
        selectedStrategicPloyId: 'lumbering-death',
        firefightPloyCounts: { 'virulent-poison': 1 },
      });

      expect(updatedGame.turningPoints[1].selectedStrategicPloyId).toBe(
        'lumbering-death'
      );
      expect(updatedGame.turningPoints[1].firefightPloyCounts['virulent-poison']).toBe(1);
    });

    it('does not mutate the original game state', () => {
      const game = getInitialGameState(1);
      updateTurningPointState(game, 1, {
        selectedStrategicPloyId: 'cloud-of-flies',
        firefightPloyCounts: {},
      });
      expect(game.turningPoints[1]).toBeUndefined();
    });
  });

  describe('advanceTurningPoint', () => {
    it('increments the turning point', () => {
      const game = { ...getInitialGameState(1), turningPoint: 1 };
      const updated = advanceTurningPoint(game);
      expect(updated.turningPoint).toBe(2);
    });

    it('clamps at MAX_TURNING_POINT', () => {
      const game = {
        ...getInitialGameState(1),
        turningPoint: GAME_DEFAULTS.MAX_TURNING_POINT,
      };
      const updated = advanceTurningPoint(game);
      expect(updated.turningPoint).toBe(GAME_DEFAULTS.MAX_TURNING_POINT);
    });

    it('initialises fresh TP state for the new turning point', () => {
      const game = { ...getInitialGameState(1), turningPoint: 1 };
      const updated = advanceTurningPoint(game);
      expect(updated.turningPoints[2]).toBeDefined();
      expect(updated.turningPoints[2].selectedStrategicPloyId).toBeNull();
      expect(updated.turningPoints[2].firefightPloyCounts).toEqual({});
    });

    it('does not overwrite an existing TP state when advancing', () => {
      const game: GameEventState = {
        ...getInitialGameState(1),
        turningPoint: 1,
        turningPoints: {
          2: { selectedStrategicPloyId: 'nurglings', firefightPloyCounts: { 'curse-of-rot': 1 } },
        },
      };
      const updated = advanceTurningPoint(game);
      // Should preserve existing TP 2 state rather than overwrite
      expect(updated.turningPoints[2].selectedStrategicPloyId).toBe('nurglings');
    });
  });

  // ------------------------------------------------------------------
  // QuickPlayEventState round-trip
  // ------------------------------------------------------------------

  describe('full state round-trip', () => {
    it('persists and restores a complex event state', () => {
      const state: QuickPlayEventState = {
        version: 2,
        eventName: 'Nurgle Cup',
        setupComplete: true,
        activeGameIndex: 1,
        learningEntries: [
          { id: '1', text: 'Keep Icon Bearer alive for free Contagion.', timestamp: new Date().toISOString() },
        ],
        games: [
          {
            gameNumber: 1,
            removedOperativeId: 'pm-plague-marine-warrior',
            selectedEquipmentIds: ['blight-grenades', 'plague-rounds'],
            blightGrenadeUsesRemaining: 1,
            turningPoint: 3,
            commandPoints: 4,
            incapacitatedOperativeIds: ['pm-plague-marine-bombardier'],
            turningPoints: {
              1: { selectedStrategicPloyId: 'contagion', firefightPloyCounts: { 'virulent-poison': 2 } },
              2: { selectedStrategicPloyId: 'cloud-of-flies', firefightPloyCounts: {} },
              3: { selectedStrategicPloyId: null, firefightPloyCounts: {} },
            },
          },
          getInitialGameState(2),
          getInitialGameState(3),
        ],
      };

      saveEventState(state);
      const loaded = loadEventState()!;

      expect(loaded.eventName).toBe('Nurgle Cup');
      expect(loaded.activeGameIndex).toBe(1);
      expect(loaded.learningEntries).toHaveLength(1);
      expect(loaded.learningEntries[0].text).toBe('Keep Icon Bearer alive for free Contagion.');
      expect(loaded.games[0].removedOperativeId).toBe('pm-plague-marine-warrior');
      expect(loaded.games[0].blightGrenadeUsesRemaining).toBe(1);
      expect(loaded.games[0].turningPoint).toBe(3);
      expect(loaded.games[0].turningPoints[1].selectedStrategicPloyId).toBe('contagion');
      expect(loaded.games[0].turningPoints[1].firefightPloyCounts['virulent-poison']).toBe(2);
      expect(loaded.games[0].incapacitatedOperativeIds).toContain('pm-plague-marine-bombardier');
    });
  });
});
