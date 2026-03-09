/**
 * GamePlayView — focused play-phase screen for one game.
 *
 * Shown when game.gamePhase === 'playing'. Deliberately shows only what is
 * needed during a live game:
 *
 *  1. Context bar — Crit Op, Tac Op, Kill Op counter + level (above everything)
 *  2. TP navigation + CP tracker + strategic ploy selection  (TurningPointPloys)
 *  3. Active strategic ploy banner
 *  4. Firefight ploys (interactive)
 *  5. Equipment in use (compact, with grenade counter)
 *  6. Operative datacards (with incapacitate-only toggle)
 *
 * A "← Back to Setup" link lets the player edit setup details if needed.
 *
 * Kill Op levels (enemy kills → estimated VP tier):
 *   0 kills  → not scored
 *   1 kill   → Level 1
 *   2 kills  → Level 2
 *   3+ kills → Level 3
 */

import { useCallback } from 'react';
import { Faction, Equipment } from '@/types';
import { GameEventState } from '@/types/event';
import { QUICK_PLAY_DEFAULTS } from '@/constants';
import { TurningPointPloys } from './TurningPointPloys';
import { OperativeRosterManager } from './OperativeRosterManager';
import './GamePlayView.css';

interface GamePlayViewProps {
  /** Current state of this game */
  game: GameEventState;
  /** Loaded Plague Marines faction data */
  faction: Faction;
  /** Universal equipment (used for Bombardier grenade augmentation pass-through) */
  universalEquipment: Equipment[];
  /** Called whenever any part of the game state changes */
  onChange: (updatedGame: GameEventState) => void;
}

/** Maps a kill count to a descriptive Kill Op level string. */
function killOpLevel(kills: number): string {
  if (kills === 0) return '—';
  if (kills === 1) return 'Level 1';
  if (kills === 2) return 'Level 2';
  return 'Level 3';
}

/**
 * Focused play-phase screen composing TP/ploy management and operative cards.
 */
export function GamePlayView({
  game,
  faction,
  universalEquipment,
  onChange,
}: GamePlayViewProps) {
  const handleIncapacitatedChange = useCallback(
    (incapacitatedOperativeIds: string[]) => {
      onChange({ ...game, incapacitatedOperativeIds });
    },
    [game, onChange]
  );

  const handleKillOpChange = useCallback(
    (delta: number) => {
      const next = Math.max(0, game.killOpKillCount + delta);
      onChange({ ...game, killOpKillCount: next });
    },
    [game, onChange]
  );

  const handleBackToSetup = useCallback(() => {
    onChange({ ...game, gamePhase: 'setup' });
  }, [game, onChange]);

  const grenadeSelected = game.selectedEquipmentIds.includes(
    QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID
  );

  // Equipment items selected for this game (for the in-play summary)
  const factionEquipment = faction.equipment ?? [];
  const allEquipment: Equipment[] = [
    ...factionEquipment,
    ...universalEquipment,
  ];
  const selectedEquipment = allEquipment.filter((e) =>
    game.selectedEquipmentIds.includes(e.id)
  );

  const level = killOpLevel(game.killOpKillCount);

  return (
    <div className="game-play-view">
      {/* ── 1. Context bar: objectives + kill op ─────────────────────── */}
      <div className="play-context-bar" role="region" aria-label="Game context">
        <div className="context-objectives">
          {game.critOp && (
            <span className="context-badge crit-op-badge">
              <span className="context-badge-label">Crit Op</span>
              <span className="context-badge-value">{game.critOp}</span>
            </span>
          )}
          {game.tacOp && (
            <span className="context-badge tac-op-badge">
              <span className="context-badge-label">Tac Op</span>
              <span className="context-badge-value">{game.tacOp}</span>
            </span>
          )}
          {game.opposition && (
            <span className="context-badge opp-badge">
              <span className="context-badge-label">vs.</span>
              <span className="context-badge-value">{game.opposition}</span>
            </span>
          )}
        </div>

        {/* Kill Op counter */}
        <div className="kill-op-tracker" aria-label="Kill Operation tracker">
          <span className="kill-op-label">💀 Kill Op</span>
          <button
            type="button"
            className="kill-op-btn"
            onClick={() => handleKillOpChange(-1)}
            disabled={game.killOpKillCount <= 0}
            aria-label="Decrease kill count"
          >
            −
          </button>
          <span
            className="kill-op-count"
            aria-label={`${game.killOpKillCount} kills`}
            aria-live="polite"
          >
            {game.killOpKillCount}
          </span>
          <button
            type="button"
            className="kill-op-btn"
            onClick={() => handleKillOpChange(1)}
            aria-label="Increase kill count"
          >
            +
          </button>
          <span className="kill-op-level" aria-label={`Kill Op ${level}`}>
            {level}
          </span>
        </div>
      </div>

      {/* ── 2–4. TP nav, CP, strategic & firefight ploys ──────────────── */}
      <TurningPointPloys
        game={game}
        faction={faction}
        onChange={onChange}
        removedOperativeId={game.removedOperativeId}
        incapacitatedOperativeIds={game.incapacitatedOperativeIds}
      />

      {/* ── 5. Equipment in use ───────────────────────────────────────── */}
      {selectedEquipment.length > 0 && (
        <div className="play-equipment-summary" aria-label="Equipment in use">
          <p className="play-equip-title">🎒 Equipment</p>
          <ul className="play-equip-list">
            {selectedEquipment.map((item) => {
              const isGrenades =
                item.id === QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID;
              return (
                <li key={item.id} className="play-equip-item">
                  <span className="play-equip-name">{item.name}</span>
                  {isGrenades && (
                    <span
                      className={`play-equip-uses ${game.blightGrenadeUsesRemaining === 0 ? 'expended' : ''}`}
                      aria-label={`${game.blightGrenadeUsesRemaining} of ${QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES} uses remaining`}
                    >
                      {game.blightGrenadeUsesRemaining}/
                      {QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── 6. Operative datacards ────────────────────────────────────── */}
      <section
        className="play-operatives-section"
        aria-labelledby="play-operatives-title"
      >
        <h3 className="play-operatives-title" id="play-operatives-title">
          ☠️ Operatives
        </h3>
        <OperativeRosterManager
          faction={faction}
          removedOperativeId={game.removedOperativeId}
          selectedEquipmentIds={game.selectedEquipmentIds}
          incapacitatedOperativeIds={game.incapacitatedOperativeIds}
          onIncapacitatedChange={handleIncapacitatedChange}
        />
      </section>

      {/* ── Back to setup link ───────────────────────────────────────── */}
      <div className="play-back-setup">
        <button
          type="button"
          className="play-back-setup-btn"
          onClick={handleBackToSetup}
          aria-label="Return to game setup to edit roster, equipment, or objectives"
        >
          ← Back to Game Setup
          {grenadeSelected && (
            <span className="play-back-note">
              {' '}
              (equipment changes take effect on return)
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
