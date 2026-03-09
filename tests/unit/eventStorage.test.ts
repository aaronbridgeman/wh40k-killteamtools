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
  saveLearningsLog,
  loadLearningsLog,
  clearLearningsLog,
  getTurningPointState,
  updateTurningPointState,
  advanceTurningPoint,
} from '@/services/eventStorage';
import { QuickPlayEventState, GameEventState, LearningEntry } from '@/types/event';
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

    it('returns state with setupComplete=true (setup screen removed in v3)', () => {
      const state = getInitialEventState();
      expect(state.setupComplete).toBe(true);
    });

    it('returns state with empty eventName', () => {
      const state = getInitialEventState();
      expect(state.eventName).toBe('');
    });

    it('returns state with activeGameIndex=0', () => {
      const state = getInitialEventState();
      expect(state.activeGameIndex).toBe(0);
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

    it('does not contain learningEntries (moved to separate storage in v3)', () => {
      const state = getInitialEventState();
      expect('learningEntries' in state).toBe(false);
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

    it('returns gamePhase=setup', () => {
      const game = getInitialGameState(1);
      expect(game.gamePhase).toBe('setup');
    });

    it('returns empty opposition, critOp, tacOp', () => {
      const game = getInitialGameState(1);
      expect(game.opposition).toBe('');
      expect(game.critOp).toBe('');
      expect(game.tacOp).toBe('');
    });

    it('returns killOpKillCount=0', () => {
      const game = getInitialGameState(1);
      expect(game.killOpKillCount).toBe(0);
    });

    it('returns playerVP=0 and opponentVP=0', () => {
      const game = getInitialGameState(1);
      expect(game.playerVP).toBe(0);
      expect(game.opponentVP).toBe(0);
    });
  });

  describe('getInitialTurningPointState', () => {
    it('returns no selected strategic ploys', () => {
      const tp = getInitialTurningPointState();
      expect(tp.selectedStrategicPloyIds).toEqual([]);
    });

    it('returns empty firefightPloyCounts', () => {
      const tp = getInitialTurningPointState();
      expect(tp.firefightPloyCounts).toEqual({});
    });
  });

  // ------------------------------------------------------------------
  // localStorage save / load / clear — event state
  // ------------------------------------------------------------------

  describe('saveEventState and loadEventState', () => {
    it('saves and loads state correctly', () => {
      const state = getInitialEventState();
      state.eventName = 'Test Event';
      state.activeGameIndex = 1;

      saveEventState(state);
      const loaded = loadEventState();

      expect(loaded).not.toBeNull();
      expect(loaded!.eventName).toBe('Test Event');
      expect(loaded!.setupComplete).toBe(true);
      expect(loaded!.games).toHaveLength(3);
    });

    it('preserves game state correctly', () => {
      const state = getInitialEventState();
      state.games[0].removedOperativeId = 'pm-plague-marine-warrior';
      state.games[0].commandPoints = 5;
      state.games[0].selectedEquipmentIds = ['blight-grenades'];
      state.games[0].gamePhase = 'playing';
      state.games[0].opposition = 'Grey Knights';
      state.games[0].critOp = 'No Prisoners';
      state.games[0].tacOp = 'Assassinate';
      state.games[0].killOpKillCount = 3;

      saveEventState(state);
      const loaded = loadEventState();

      expect(loaded!.games[0].removedOperativeId).toBe('pm-plague-marine-warrior');
      expect(loaded!.games[0].commandPoints).toBe(5);
      expect(loaded!.games[0].selectedEquipmentIds).toEqual(['blight-grenades']);
      expect(loaded!.games[0].gamePhase).toBe('playing');
      expect(loaded!.games[0].opposition).toBe('Grey Knights');
      expect(loaded!.games[0].critOp).toBe('No Prisoners');
      expect(loaded!.games[0].tacOp).toBe('Assassinate');
      expect(loaded!.games[0].killOpKillCount).toBe(3);
    });

    it('preserves playerVP and opponentVP', () => {
      const state = getInitialEventState();
      state.games[0].playerVP = 12;
      state.games[0].opponentVP = 8;
      state.games[1].playerVP = 5;
      state.games[1].opponentVP = 5;

      saveEventState(state);
      const loaded = loadEventState();

      expect(loaded!.games[0].playerVP).toBe(12);
      expect(loaded!.games[0].opponentVP).toBe(8);
      expect(loaded!.games[1].playerVP).toBe(5);
      expect(loaded!.games[1].opponentVP).toBe(5);
    });
  });

  describe('loadEventState (missing)', () => {
    it('returns null when no saved state exists', () => {
      const loaded = loadEventState();
      expect(loaded).toBeNull();
    });
  });

  describe('loadEventState (migration from v1/v2)', () => {
    it('migrates v1 save: adds incapacitatedOperativeIds, converts usedFirefightPloyIds, adds v3 fields, migrates selectedStrategicPloyId to selectedStrategicPloyIds', () => {
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

      // selectedStrategicPloyId migrated to selectedStrategicPloyIds array
      expect(loaded.games[0].turningPoints[1].selectedStrategicPloyIds).toEqual(['contagion']);

      // v3 fields added with defaults
      expect(loaded.games[0].gamePhase).toBe('playing'); // turningPoint > 0 → playing
      expect(loaded.games[1].gamePhase).toBe('setup');   // turningPoint === 0 → setup
      expect(loaded.games[0].opposition).toBe('');
      expect(loaded.games[0].critOp).toBe('');
      expect(loaded.games[0].tacOp).toBe('');
      expect(loaded.games[0].killOpKillCount).toBe(0);

      // existing fields preserved
      expect(loaded.games[0].removedOperativeId).toBe('pm-plague-marine-warrior');
      expect(loaded.games[0].turningPoint).toBe(2);

      // v6 fields defaulted to 0
      loaded.games.forEach((game) => {
        expect(game.playerVP).toBe(0);
        expect(game.opponentVP).toBe(0);
      });
    });

    it('migrates v2 learningEntries to separate storage if separate storage is empty', () => {
      const oldState = {
        version: 2,
        eventName: 'Old Event',
        setupComplete: true,
        activeGameIndex: 0,
        learningEntries: [
          { id: '1', text: 'Test note', timestamp: new Date().toISOString() },
        ],
        games: [
          { gameNumber: 1, removedOperativeId: null, selectedEquipmentIds: [], blightGrenadeUsesRemaining: 2, turningPoint: 0, commandPoints: 0, turningPoints: {}, incapacitatedOperativeIds: [] },
          { gameNumber: 2, removedOperativeId: null, selectedEquipmentIds: [], blightGrenadeUsesRemaining: 2, turningPoint: 0, commandPoints: 0, turningPoints: {}, incapacitatedOperativeIds: [] },
          { gameNumber: 3, removedOperativeId: null, selectedEquipmentIds: [], blightGrenadeUsesRemaining: 2, turningPoint: 0, commandPoints: 0, turningPoints: {}, incapacitatedOperativeIds: [] },
        ],
      };
      localStorage.setItem('kill-team-quick-play-event', JSON.stringify(oldState));

      loadEventState();

      // learningEntries should have been migrated to separate storage
      const migrated = loadLearningsLog();
      expect(migrated).toHaveLength(1);
      expect(migrated[0].text).toBe('Test note');
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

    it('does NOT clear the learnings log', () => {
      saveLearningsLog([{ id: '1', text: 'A note', timestamp: new Date().toISOString() }]);
      saveEventState(getInitialEventState());

      clearEventState();

      // Event state cleared
      expect(loadEventState()).toBeNull();
      // Learnings preserved
      expect(loadLearningsLog()).toHaveLength(1);
    });
  });

  // ------------------------------------------------------------------
  // Learnings log (separate storage)
  // ------------------------------------------------------------------

  describe('saveLearningsLog / loadLearningsLog', () => {
    it('saves and loads an empty array', () => {
      saveLearningsLog([]);
      expect(loadLearningsLog()).toEqual([]);
    });

    it('saves and loads multiple entries', () => {
      const entries: LearningEntry[] = [
        { id: '1', text: 'Note 1', timestamp: '2026-01-01T00:00:00Z' },
        { id: '2', text: 'Note 2', timestamp: '2026-01-02T00:00:00Z', oppositionTeam: 'Orks' },
      ];
      saveLearningsLog(entries);
      const loaded = loadLearningsLog();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].text).toBe('Note 1');
      expect(loaded[1].oppositionTeam).toBe('Orks');
    });

    it('returns empty array when no log is stored', () => {
      expect(loadLearningsLog()).toEqual([]);
    });
  });

  describe('clearLearningsLog', () => {
    it('removes the learnings log from localStorage', () => {
      saveLearningsLog([{ id: '1', text: 'A note', timestamp: new Date().toISOString() }]);
      expect(loadLearningsLog()).toHaveLength(1);

      clearLearningsLog();
      expect(loadLearningsLog()).toEqual([]);
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
          2: { selectedStrategicPloyIds: ['contagion'], firefightPloyCounts: {} },
        },
      };
      const tp = getTurningPointState(game, 2);
      expect(tp.selectedStrategicPloyIds).toContain('contagion');
    });

    it('returns default turning point state when TP does not exist', () => {
      const game = getInitialGameState(1);
      const tp = getTurningPointState(game, 3);
      expect(tp.selectedStrategicPloyIds).toEqual([]);
      expect(tp.firefightPloyCounts).toEqual({});
    });
  });

  describe('updateTurningPointState', () => {
    it('returns updated game with new TP state', () => {
      const game = getInitialGameState(1);
      const updatedGame = updateTurningPointState(game, 1, {
        selectedStrategicPloyIds: ['lumbering-death'],
        firefightPloyCounts: { 'virulent-poison': 1 },
      });

      expect(updatedGame.turningPoints[1].selectedStrategicPloyIds).toContain(
        'lumbering-death'
      );
      expect(updatedGame.turningPoints[1].firefightPloyCounts['virulent-poison']).toBe(1);
    });

    it('does not mutate the original game state', () => {
      const game = getInitialGameState(1);
      updateTurningPointState(game, 1, {
        selectedStrategicPloyIds: ['cloud-of-flies'],
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
      expect(updated.turningPoints[2].selectedStrategicPloyIds).toEqual([]);
      expect(updated.turningPoints[2].firefightPloyCounts).toEqual({});
    });

    it('does not overwrite an existing TP state when advancing', () => {
      const game: GameEventState = {
        ...getInitialGameState(1),
        turningPoint: 1,
        turningPoints: {
          2: { selectedStrategicPloyIds: ['nurglings'], firefightPloyCounts: { 'curse-of-rot': 1 } },
        },
      };
      const updated = advanceTurningPoint(game);
      expect(updated.turningPoints[2].selectedStrategicPloyIds).toContain('nurglings');
    });
  });

  // ------------------------------------------------------------------
  // QuickPlayEventState round-trip
  // ------------------------------------------------------------------

  describe('full state round-trip', () => {
    it('persists and restores a complex event state with v4 fields', () => {
      const state: QuickPlayEventState = {
        version: 4,
        eventName: 'Nurgle Cup',
        setupComplete: true,
        activeGameIndex: 1,
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
              1: { selectedStrategicPloyIds: ['contagion'], firefightPloyCounts: { 'virulent-poison': 2 } },
              2: { selectedStrategicPloyIds: ['cloud-of-flies', 'nurglings'], firefightPloyCounts: {} },
              3: { selectedStrategicPloyIds: [], firefightPloyCounts: {} },
            },
            gamePhase: 'playing',
            opposition: 'Grey Knights',
            critOp: 'No Prisoners',
            tacOp: 'Assassinate',
            killOpKillCount: 2,
            playerVP: 0,
            opponentVP: 0,
          },
          getInitialGameState(2),
          getInitialGameState(3),
        ],
      };

      saveEventState(state);
      const loaded = loadEventState()!;

      expect(loaded.eventName).toBe('Nurgle Cup');
      expect(loaded.activeGameIndex).toBe(1);
      expect(loaded.games[0].removedOperativeId).toBe('pm-plague-marine-warrior');
      expect(loaded.games[0].blightGrenadeUsesRemaining).toBe(1);
      expect(loaded.games[0].turningPoint).toBe(3);
      expect(loaded.games[0].turningPoints[1].selectedStrategicPloyIds).toContain('contagion');
      expect(loaded.games[0].turningPoints[1].firefightPloyCounts['virulent-poison']).toBe(2);
      // Multiple ploys preserved
      expect(loaded.games[0].turningPoints[2].selectedStrategicPloyIds).toContain('cloud-of-flies');
      expect(loaded.games[0].turningPoints[2].selectedStrategicPloyIds).toContain('nurglings');
      expect(loaded.games[0].incapacitatedOperativeIds).toContain('pm-plague-marine-bombardier');
      expect(loaded.games[0].gamePhase).toBe('playing');
      expect(loaded.games[0].opposition).toBe('Grey Knights');
      expect(loaded.games[0].critOp).toBe('No Prisoners');
      expect(loaded.games[0].tacOp).toBe('Assassinate');
      expect(loaded.games[0].killOpKillCount).toBe(2);
      // v6 fields defaulted
      expect(loaded.games[0].playerVP).toBe(0);
      expect(loaded.games[0].opponentVP).toBe(0);
    });

    it('persists and restores playerVP and opponentVP (v6 fields)', () => {
      const state = getInitialEventState();
      state.games[0].playerVP = 15;
      state.games[0].opponentVP = 10;
      state.games[1].playerVP = 8;
      state.games[1].opponentVP = 12;

      saveEventState(state);
      const loaded = loadEventState()!;

      expect(loaded.games[0].playerVP).toBe(15);
      expect(loaded.games[0].opponentVP).toBe(10);
      expect(loaded.games[1].playerVP).toBe(8);
      expect(loaded.games[1].opponentVP).toBe(12);
      expect(loaded.games[2].playerVP).toBe(0);
      expect(loaded.games[2].opponentVP).toBe(0);
    });
  });
});
