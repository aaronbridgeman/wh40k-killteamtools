/**
 * TurningPointPloys — turning point navigation, strategic ploy selection,
 * CP tracking, and firefight ploy display.
 *
 * Data sourced directly from the loaded faction (ploys array in faction.json).
 * No hardcoded ploy data — fully driven by the faction configuration.
 *
 * CP rules (per user spec):
 *  - CP is managed manually via the CPTracker (+/−).
 *  - Selecting a strategic ploy automatically deducts ploy.cost CP;
 *    deselecting refunds it.  Switching ploys (refund + deduct) is
 *    always allowed because all Plague Marines ploys cost the same.
 *  - Using a firefight ploy automatically deducts ploy.cost CP;
 *    un-using it refunds CP.  Firefight ploy buttons are disabled when
 *    the player cannot afford them (and the ploy has not yet been used).
 *
 * @see QUICK_PLAY_EVENT_SPEC.md — sections 4, 5, 6, 7
 */

import { useCallback } from 'react';
import { Faction, Ploy } from '@/types';
import { GameEventState, TurningPointState } from '@/types/event';
import {
  getTurningPointState,
  updateTurningPointState,
  advanceTurningPoint,
  getInitialTurningPointState,
} from '@/services/eventStorage';
import { GAME_DEFAULTS } from '@/constants';
import { CPTracker } from './CPTracker';
import './TurningPointPloys.css';

interface TurningPointPloysProps {
  /** Current game state */
  game: GameEventState;
  /** Loaded faction data (provides ploys list) */
  faction: Faction;
  /** Called whenever game state changes (TP advance, ploy selection, CP) */
  onChange: (updatedGame: GameEventState) => void;
}

/** Clamps a CP value to the valid range [MIN, MAX]. */
function clampCp(cp: number): number {
  return Math.max(
    GAME_DEFAULTS.MIN_COMMAND_POINTS,
    Math.min(GAME_DEFAULTS.MAX_COMMAND_POINTS, cp)
  );
}

/**
 * Renders the turning point selector, strategic ploy selector (pick one per TP),
 * active strategic ploy display, CP tracker, and firefight ploy grid.
 */
export function TurningPointPloys({
  game,
  faction,
  onChange,
}: TurningPointPloysProps) {
  const ploys: Ploy[] = faction.ploys ?? [];
  const strategicPloys = ploys.filter((p) => p.type === 'strategy');
  const firefightPloys = ploys.filter((p) => p.type === 'firefight');

  const isStarted = game.turningPoint > 0;
  const currentTpState: TurningPointState = isStarted
    ? getTurningPointState(game, game.turningPoint)
    : getInitialTurningPointState();

  const activePloy =
    isStarted && currentTpState.selectedStrategicPloyId
      ? strategicPloys.find(
          (p) => p.id === currentTpState.selectedStrategicPloyId
        )
      : null;

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleStartGame = useCallback(() => {
    onChange({ ...game, turningPoint: 1 });
  }, [game, onChange]);

  const handleAdvanceTp = useCallback(() => {
    onChange(advanceTurningPoint(game));
  }, [game, onChange]);

  const handleRetreatTp = useCallback(() => {
    const prevTp = Math.max(1, game.turningPoint - 1);
    onChange({ ...game, turningPoint: prevTp });
  }, [game, onChange]);

  /**
   * Select or deselect a strategic ploy for the current turning point.
   * Automatically deducts ploy.cost CP when selecting; refunds when deselecting.
   * Switching from one ploy to another refunds the old cost and deducts the new.
   */
  const handleSelectStrategicPloy = useCallback(
    (ploy: Ploy) => {
      if (!isStarted) return;
      const isCurrentlySelected =
        currentTpState.selectedStrategicPloyId === ploy.id;

      // CP delta: deselecting refunds, selecting deducts
      let cpDelta = isCurrentlySelected ? ploy.cost : -ploy.cost;

      // When switching ploys, also refund the previously selected ploy's cost
      if (!isCurrentlySelected && currentTpState.selectedStrategicPloyId) {
        const prevPloy = strategicPloys.find(
          (p) => p.id === currentTpState.selectedStrategicPloyId
        );
        if (prevPloy) cpDelta += prevPloy.cost;
      }

      const updatedWithTp = updateTurningPointState(game, game.turningPoint, {
        ...currentTpState,
        selectedStrategicPloyId: isCurrentlySelected ? null : ploy.id,
      });
      onChange({ ...updatedWithTp, commandPoints: clampCp(game.commandPoints + cpDelta) });
    },
    [game, onChange, isStarted, currentTpState, strategicPloys]
  );

  /**
   * Toggle a firefight ploy's used state for the current turning point.
   * Automatically deducts ploy.cost CP when marking used; refunds when unmarking.
   */
  const handleToggleFirefightPloy = useCallback(
    (ploy: Ploy) => {
      if (!isStarted) return;
      const alreadyUsed = currentTpState.usedFirefightPloyIds.includes(ploy.id);
      const updatedUsed = alreadyUsed
        ? currentTpState.usedFirefightPloyIds.filter((id) => id !== ploy.id)
        : [...currentTpState.usedFirefightPloyIds, ploy.id];

      // Deduct CP when using; refund when un-using
      const cpDelta = alreadyUsed ? ploy.cost : -ploy.cost;

      const updatedWithTp = updateTurningPointState(game, game.turningPoint, {
        ...currentTpState,
        usedFirefightPloyIds: updatedUsed,
      });
      onChange({ ...updatedWithTp, commandPoints: clampCp(game.commandPoints + cpDelta) });
    },
    [game, onChange, isStarted, currentTpState]
  );

  const handleCpChange = useCallback(
    (commandPoints: number) => {
      onChange({ ...game, commandPoints });
    },
    [game, onChange]
  );

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="tp-ploys">
      {/* Turning point navigation */}
      <div className="tp-selector">
        {isStarted ? (
          <>
            <button
              className="tp-button"
              onClick={handleRetreatTp}
              disabled={game.turningPoint <= 1}
              aria-label="Go back to previous turning point"
            >
              ‹
            </button>
            <div className="tp-display">
              <span className="tp-value">TP {game.turningPoint}</span>
              <span className="tp-of">
                of {GAME_DEFAULTS.MAX_TURNING_POINT}
              </span>
            </div>
            <button
              className="tp-button"
              onClick={handleAdvanceTp}
              disabled={game.turningPoint >= GAME_DEFAULTS.MAX_TURNING_POINT}
              aria-label="Advance to next turning point"
            >
              ›
            </button>
          </>
        ) : (
          <button
            className="tp-button"
            onClick={handleStartGame}
            style={{ width: 'auto', borderRadius: 8, padding: '0.5rem 1.5rem' }}
          >
            Start Game
          </button>
        )}
      </div>

      {/* CP tracker */}
      <CPTracker commandPoints={game.commandPoints} onChange={handleCpChange} />

      {/* Strategic ploy selection — shown once game is started */}
      {isStarted && (
        <div>
          <p className="strategic-ploys-title">
            Select Strategic Ploy for TP {game.turningPoint}
          </p>
          <div className="strategic-ploy-grid">
            {strategicPloys.map((ploy) => {
              const isSelected =
                currentTpState.selectedStrategicPloyId === ploy.id;
              const hasCurrentSelection =
                currentTpState.selectedStrategicPloyId !== null;
              // Disable only when making a fresh selection and can't afford it
              const isDisabled =
                !isSelected &&
                !hasCurrentSelection &&
                game.commandPoints < ploy.cost;
              return (
                <button
                  key={ploy.id}
                  type="button"
                  className={`strategic-ploy-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectStrategicPloy(ploy)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? 'Deselect' : 'Select'} strategic ploy: ${ploy.name}`}
                >
                  <p className="ploy-card-name">{ploy.name}</p>
                  <p className="ploy-card-cost">{ploy.cost}CP</p>
                  <p className="ploy-card-desc">{ploy.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active strategic ploy banner */}
      {activePloy && (
        <div className="active-ploy-banner" role="status" aria-live="polite">
          <p className="active-ploy-label">⚔️ Active Strategic Ploy</p>
          <p className="active-ploy-name">{activePloy.name}</p>
          <p className="active-ploy-desc">{activePloy.description}</p>
          {activePloy.cost_modifiers &&
            activePloy.cost_modifiers.length > 0 && (
              <p
                className="active-ploy-desc"
                style={{ marginTop: '0.5rem', fontStyle: 'italic' }}
              >
                💡 {activePloy.cost_modifiers.join(' ')}
              </p>
            )}
        </div>
      )}

      {!isStarted && (
        <p className="tp-start-prompt">
          Press &quot;Start Game&quot; to begin Turning Point 1 and select your
          strategic ploy.
        </p>
      )}

      {/* Firefight ploys */}
      <div>
        <p className="firefight-ploys-title">Firefight Ploys</p>
        <div className="firefight-ploy-list">
          {firefightPloys.map((ploy) => {
            const isUsed = currentTpState.usedFirefightPloyIds.includes(
              ploy.id
            );
            const canAfford = game.commandPoints >= ploy.cost;
            let cardClass = 'firefight-ploy-card';
            if (isUsed) cardClass += ' used';
            else if (canAfford) cardClass += ' affordable';
            else cardClass += ' unaffordable';

            return (
              <button
                key={ploy.id}
                type="button"
                className={cardClass}
                onClick={() => handleToggleFirefightPloy(ploy)}
                disabled={!isStarted || (!isUsed && !canAfford)}
                aria-pressed={isUsed}
                aria-label={`${ploy.name} — ${isUsed ? 'Used this turning point' : canAfford ? 'Affordable' : 'Cannot afford'}`}
              >
                <div className="ff-ploy-info">
                  <p className="ff-ploy-name">{ploy.name}</p>
                  <p className="ff-ploy-cost">{ploy.cost}CP</p>
                  <p className="ff-ploy-desc">{ploy.description}</p>
                </div>
                {isUsed && <span className="ff-used-badge">✓ Used</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
