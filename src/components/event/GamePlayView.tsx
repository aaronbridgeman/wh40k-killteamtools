/**
 * GamePlayView — focused play-phase screen for one game.
 *
 * Shown when game.gamePhase === 'playing'. Layout (top to bottom):
 *
 *  1. Context bar — Crit Op, Tac Op, Opposition badges
 *  2. Combined stats — CP tracker + Kill counter + Kill Op score (compact row)
 *  3. TP navigation + strategic ploy selection + firefight ploys  (TurningPointPloys)
 *  4. Faction rules (reference)
 *  5. Equipment in use (compact, with grenade counter)
 *  6. Active strategic ploy banner (moved here, below equipment)
 *  7. Operative datacards (pill selector → single card view)
 *  8. Final score — player VP / opponent VP counters + W/L/D result
 *
 * A "← Back to Setup" link lets the player edit setup details if needed.
 *
 * Kill Op score thresholds (when opponentCount > 0):
 *   0 kills            → not scored
 *   < half opponent    → Level 1
 *   ≥ half opponent    → Level 2
 *   = all opponents    → Level 3
 * Fallback (opponentCount === 0):
 *   1 kill → Level 1 · 2 kills → Level 2 · 3+ kills → Level 3
 */

import { useCallback } from 'react';
import { Faction, Equipment, Ploy } from '@/types';
import { GameEventState } from '@/types/event';
import { QUICK_PLAY_DEFAULTS } from '@/constants';
import { TAC_OPS } from '@/data/missions/missions';
import {
  getTurningPointState,
  getInitialTurningPointState,
} from '@/services/eventStorage';
import { TurningPointPloys } from './TurningPointPloys';
import { OperativeRosterManager } from './OperativeRosterManager';
import { CPTracker } from './CPTracker';
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

/**
 * Maps a kill count to a descriptive Kill Op level string.
 * When opponentCount is provided (> 0), uses proportional thresholds.
 */
function killOpLevel(kills: number, opponentCount: number): string {
  if (kills === 0) return '—';
  if (opponentCount > 0) {
    if (kills >= opponentCount) return 'Level 3';
    if (kills >= Math.ceil(opponentCount / 2)) return 'Level 2';
    return 'Level 1';
  }
  // Fallback: fixed thresholds
  if (kills >= 3) return 'Level 3';
  if (kills >= 2) return 'Level 2';
  return 'Level 1';
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

  const handleCpChange = useCallback(
    (commandPoints: number) => {
      onChange({ ...game, commandPoints });
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

  // Active strategic ploys for current TP (to render after equipment)
  const isStarted = game.turningPoint > 0;
  const currentTpState = isStarted
    ? getTurningPointState(game, game.turningPoint)
    : getInitialTurningPointState();
  const strategicPloys: Ploy[] = (faction.ploys ?? []).filter(
    (p) => p.type === 'strategy'
  );
  const activePloys: Ploy[] = isStarted
    ? currentTpState.selectedStrategicPloyIds
        .map((id) => strategicPloys.find((p) => p.id === id))
        .filter((p): p is Ploy => p !== undefined)
    : [];

  const level = killOpLevel(game.killOpKillCount, game.opponentCount);

  // Tac Op description lookup — show scoring reminder in context bar
  const tacOpEntry = game.tacOp
    ? TAC_OPS.find((o) => o.name === game.tacOp)
    : undefined;

  return (
    <div className="game-play-view">
      {/* ── 1. Context bar: objectives (only shown when at least one is set) ── */}
      {(game.critOp || game.tacOp || game.opposition) && (
      <div className="play-context-bar" role="region" aria-label="Game context">
        <div className="context-objectives">
          {game.critOp && (
            <span className="context-badge crit-op-badge">
              <span className="context-badge-label">Crit Op</span>
              <span className="context-badge-value">{game.critOp}</span>
            </span>
          )}
          {game.tacOp && (
            <div className="tac-op-wrapper">
              <span className="context-badge tac-op-badge">
                <span className="context-badge-label">Tac Op</span>
                <span className="context-badge-value">{game.tacOp}</span>
              </span>
              {tacOpEntry?.description && (
                <p
                  className="tac-op-reminder"
                  aria-label="Tac Op scoring reminder"
                >
                  📋 {tacOpEntry.description}
                </p>
              )}
            </div>
          )}
          {game.opposition && (
            <span className="context-badge opp-badge">
              <span className="context-badge-label">vs.</span>
              <span className="context-badge-value">{game.opposition}</span>
            </span>
          )}
        </div>
      </div>
      )}

      {/* ── 2. Combined stats: CP + Kill counter + Kill Op score ─────── */}
      <div
        className="play-stats-bar"
        role="region"
        aria-label="Game statistics"
      >
        {/* Command Points */}
        <div className="stats-item stats-cp">
          <CPTracker
            commandPoints={game.commandPoints}
            onChange={handleCpChange}
          />
        </div>

        {/* Kill counter + Kill Op score */}
        <div
          className="stats-item stats-kills"
          aria-label="Kill Operation tracker"
        >
          <span className="stats-label">💀 Kill Op</span>
          <div className="stats-counter">
            <button
              type="button"
              className="stats-btn"
              onClick={() => handleKillOpChange(-1)}
              disabled={game.killOpKillCount <= 0}
              aria-label="Decrease kill count"
            >
              −
            </button>
            <span
              className="stats-count"
              aria-label={`${game.killOpKillCount} kills`}
              aria-live="polite"
            >
              {game.killOpKillCount}
              {game.opponentCount > 0 && (
                <span className="stats-of-total">/{game.opponentCount}</span>
              )}
            </span>
            <button
              type="button"
              className="stats-btn"
              onClick={() => handleKillOpChange(1)}
              disabled={
                game.opponentCount > 0 &&
                game.killOpKillCount >= game.opponentCount
              }
              aria-label="Increase kill count"
            >
              +
            </button>
          </div>
          <span
            className={`stats-level ${level === '—' ? 'unscored' : ''}`}
            aria-label={`Kill Op ${level}`}
          >
            {level}
          </span>
        </div>
      </div>

      {/* ── 3. TP nav, strategic & firefight ploys ────────────────────── */}
      <TurningPointPloys
        game={game}
        faction={faction}
        onChange={onChange}
        removedOperativeId={game.removedOperativeId}
        incapacitatedOperativeIds={game.incapacitatedOperativeIds}
      />

      {/* ── 4. Faction rules ──────────────────────────────────────────── */}
      {faction.rules.length > 0 && (
        <div
          className="play-faction-rules"
          role="region"
          aria-label="Faction rules"
        >
          <p className="play-faction-rules-title">⚜️ Faction Rules</p>
          <div className="play-faction-rules-list">
            {faction.rules.map((rule) => (
              <div key={rule.id} className="play-faction-rule">
                <p className="play-faction-rule-name">
                  {rule.name}
                  <span className="play-faction-rule-type">({rule.type})</span>
                </p>
                <p className="play-faction-rule-desc">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <div className="play-equip-title-row">
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
                  </div>
                  {item.description && (
                    <p className="play-equip-desc">{item.description}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── 6. Active strategic ploy banner (below equipment) ─────────── */}
      {activePloys.length > 0 && (
        <div className="active-ploy-banner" role="status" aria-live="polite">
          <p className="active-ploy-label">
            ⚔️ Active Strategic Ploy{activePloys.length > 1 ? 's' : ''}
          </p>
          {activePloys.map((activePloy) => (
            <div key={activePloy.id} className="active-ploy-entry">
              <p className="active-ploy-name">{activePloy.name}</p>
              <p className="active-ploy-desc">{activePloy.description}</p>
              {activePloy.cost_modifiers &&
                activePloy.cost_modifiers.length > 0 && (
                  <p className="active-ploy-desc active-ploy-modifier">
                    💡 {activePloy.cost_modifiers.join(' ')}
                  </p>
                )}
            </div>
          ))}
        </div>
      )}

      {/* ── 7. Operative datacards ────────────────────────────────────── */}
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

      {/* ── 8. Final score ───────────────────────────────────────────── */}
      <section
        className="play-score-section"
        aria-labelledby="play-score-title"
      >
        <h3 className="play-score-title" id="play-score-title">
          🏆 Final Score
        </h3>
        <div className="play-score-grid">
          <div className="play-score-field">
            <label
              className="play-score-label"
              htmlFor={`player-vp-${game.gameNumber}`}
            >
              Your VP
            </label>
            <div className="play-score-counter">
              <button
                type="button"
                className="play-score-btn"
                onClick={() =>
                  onChange({
                    ...game,
                    playerVP: Math.max(0, game.playerVP - 1),
                  })
                }
                disabled={game.playerVP <= 0}
                aria-label="Decrease your victory points"
              >
                −
              </button>
              <input
                id={`player-vp-${game.gameNumber}`}
                className="play-score-input"
                type="number"
                min={0}
                value={game.playerVP}
                onChange={(e) =>
                  onChange({
                    ...game,
                    playerVP: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                aria-label="Your victory points"
              />
              <button
                type="button"
                className="play-score-btn"
                onClick={() =>
                  onChange({ ...game, playerVP: game.playerVP + 1 })
                }
                aria-label="Increase your victory points"
              >
                +
              </button>
            </div>
          </div>

          <div className="play-score-result" aria-live="polite">
            {game.playerVP > game.opponentVP
              ? '🏆 Win'
              : game.playerVP < game.opponentVP
                ? '💀 Loss'
                : '🤝 Draw'}
          </div>

          <div className="play-score-field">
            <label
              className="play-score-label"
              htmlFor={`opponent-vp-${game.gameNumber}`}
            >
              Opp VP
            </label>
            <div className="play-score-counter">
              <button
                type="button"
                className="play-score-btn"
                onClick={() =>
                  onChange({
                    ...game,
                    opponentVP: Math.max(0, game.opponentVP - 1),
                  })
                }
                disabled={game.opponentVP <= 0}
                aria-label="Decrease opponent victory points"
              >
                −
              </button>
              <input
                id={`opponent-vp-${game.gameNumber}`}
                className="play-score-input"
                type="number"
                min={0}
                value={game.opponentVP}
                onChange={(e) =>
                  onChange({
                    ...game,
                    opponentVP: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                aria-label="Opponent victory points"
              />
              <button
                type="button"
                className="play-score-btn"
                onClick={() =>
                  onChange({ ...game, opponentVP: game.opponentVP + 1 })
                }
                aria-label="Increase opponent victory points"
              >
                +
              </button>
            </div>
          </div>
        </div>
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
