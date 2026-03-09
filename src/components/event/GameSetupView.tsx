/**
 * GameSetupView — per-game setup phase.
 *
 * Shown when game.gamePhase === 'setup'. The player:
 *  1. Optionally enters the opposition, Critical Operation, and Tactical Operation.
 *  2. Uses the compact QuickOperativeSelector to remove one non-leader.
 *  3. Selects equipment for the game.
 *  4. Taps "Begin Game" to transition to the play phase.
 *
 * Deliberately shows only setup-relevant information — no TP, ploy, or
 * gameplay controls.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Faction, Equipment } from '@/types';
import { GameEventState } from '@/types/event';
import { CRIT_OPS, TAC_OPS } from '@/data/missions/missions';
import { loadOpponentKillTeams } from '@/services/dataLoader';
import { OpponentKillTeam } from '@/types/opponent';
import { MatchupTipsPanel } from '@/components/game/MatchupTipsPanel';
import { QuickOperativeSelector } from './QuickOperativeSelector';
import { EventEquipmentTracker } from './EventEquipmentTracker';
import { MissionSelect } from './MissionSelect';
import './GameSetupView.css';

interface GameSetupViewProps {
  /** Current state of this game */
  game: GameEventState;
  /** Loaded Plague Marines faction data */
  faction: Faction;
  /** Universal (generic) equipment items */
  universalEquipment: Equipment[];
  /** Called whenever any part of the game state changes */
  onChange: (updatedGame: GameEventState) => void;
}

/**
 * Game setup screen: operative selection, equipment, objectives, then begin.
 */
export function GameSetupView({
  game,
  faction,
  universalEquipment,
  onChange,
}: GameSetupViewProps) {
  const [opponentTeams, setOpponentTeams] = useState<OpponentKillTeam[]>([]);

  useEffect(() => {
    loadOpponentKillTeams().then(setOpponentTeams).catch(console.error);
  }, []);

  /** ID of the currently selected opposing kill team, derived from its name */
  const selectedOpponentId = useMemo(
    () => opponentTeams.find((t) => t.name === game.opposition)?.id ?? null,
    [opponentTeams, game.opposition]
  );

  const handleRosterChange = useCallback(
    (removedOperativeId: string | null) => {
      onChange({ ...game, removedOperativeId });
    },
    [game, onChange]
  );

  const handleEquipmentChange = useCallback(
    (selectedEquipmentIds: string[], blightGrenadeUsesRemaining: number) => {
      onChange({ ...game, selectedEquipmentIds, blightGrenadeUsesRemaining });
    },
    [game, onChange]
  );

  const handleBeginGame = useCallback(() => {
    onChange({
      ...game,
      gamePhase: 'playing',
      turningPoint: 1,
      // Initialise TP 1 state so strategic ploy selection is ready immediately
      turningPoints: {
        ...game.turningPoints,
        1: game.turningPoints[1] ?? {
          selectedStrategicPloyIds: [],
          firefightPloyCounts: {},
        },
      },
    });
  }, [game, onChange]);

  return (
    <div className="game-setup-view">
      {/* 1 — Game details (optional) */}
      <section className="setup-section" aria-labelledby="setup-details-title">
        <h3 className="setup-section-title" id="setup-details-title">
          📋 Game Details{' '}
          <span className="setup-optional-label">(optional)</span>
        </h3>
        <div className="setup-details-grid">
          <div className="setup-detail-field">
            <label
              className="setup-detail-label"
              htmlFor={`opposition-${game.gameNumber}`}
            >
              vs. Team
            </label>
            <select
              id={`opposition-${game.gameNumber}`}
              className="setup-detail-input"
              value={game.opposition}
              onChange={(e) => {
                const selectedTeam = opponentTeams.find(
                  (t) => t.name === e.target.value
                );
                onChange({
                  ...game,
                  opposition: e.target.value,
                  opponentCount: selectedTeam ? selectedTeam.model_count : 0,
                });
              }}
              aria-label="Opposition kill team"
            >
              <option value="">— Select opposing kill team —</option>
              {opponentTeams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name} ({team.faction})
                </option>
              ))}
            </select>
          </div>
          <div className="setup-detail-field">
            <label
              className="setup-detail-label"
              htmlFor={`opponent-count-${game.gameNumber}`}
            >
              Opponent Count
            </label>
            <input
              id={`opponent-count-${game.gameNumber}`}
              className="setup-detail-input"
              type="number"
              min={0}
              max={20}
              value={game.opponentCount || ''}
              onChange={(e) =>
                onChange({
                  ...game,
                  opponentCount: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              placeholder="e.g. 8"
              aria-label="Opponent operative count"
            />
          </div>
          <div className="setup-detail-field">
            <MissionSelect
              label="Crit Op"
              options={CRIT_OPS}
              value={game.critOp}
              onChange={(val) => onChange({ ...game, critOp: val })}
              placeholder="Enter custom Critical Op…"
            />
          </div>
          <div className="setup-detail-field">
            <MissionSelect
              label="Tac Op"
              options={TAC_OPS}
              value={game.tacOp}
              onChange={(val) => onChange({ ...game, tacOp: val })}
              placeholder="Enter custom Tactical Op…"
            />
          </div>
        </div>
      </section>

      {/* 1a — Matchup tips (shown when an opponent is selected) */}
      <MatchupTipsPanel opponentTeamId={selectedOpponentId} />

      {/* 2 — Operative roster */}
      <section className="setup-section" aria-labelledby="setup-roster-title">
        <h3 className="setup-section-title" id="setup-roster-title">
          ☠️ Operative Roster
        </h3>
        <QuickOperativeSelector
          faction={faction}
          removedOperativeId={game.removedOperativeId}
          onRosterChange={handleRosterChange}
        />
      </section>

      {/* 3 — Equipment */}
      <section
        className="setup-section"
        aria-labelledby="setup-equipment-title"
      >
        <h3 className="setup-section-title" id="setup-equipment-title">
          🎒 Equipment
        </h3>
        <EventEquipmentTracker
          faction={faction}
          universalEquipment={universalEquipment}
          selectedEquipmentIds={game.selectedEquipmentIds}
          blightGrenadeUsesRemaining={game.blightGrenadeUsesRemaining}
          onChange={handleEquipmentChange}
        />
      </section>

      {/* 4 — Begin button */}
      <div className="setup-begin-section">
        <button
          type="button"
          className="setup-begin-button"
          onClick={handleBeginGame}
          aria-label="Begin game and move to play view"
        >
          ☠️ Begin Game
        </button>
      </div>
    </div>
  );
}
