/**
 * TurningPointPloys — turning point navigation, strategic ploy selection,
 * CP tracking, and firefight ploy display.
 *
 * Data sourced directly from the loaded faction (ploys array in faction.json).
 * No hardcoded ploy data — fully driven by the faction configuration.
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

  const handleSelectStrategicPloy = useCallback(
    (ployId: string) => {
      if (!isStarted) return;
      const updated = updateTurningPointState(game, game.turningPoint, {
        ...currentTpState,
        selectedStrategicPloyId:
          currentTpState.selectedStrategicPloyId === ployId ? null : ployId,
      });
      onChange(updated);
    },
    [game, onChange, isStarted, currentTpState]
  );

  const handleToggleFirefightPloy = useCallback(
    (ployId: string) => {
      if (!isStarted) return;
      const alreadyUsed = currentTpState.usedFirefightPloyIds.includes(ployId);
      const updatedUsed = alreadyUsed
        ? currentTpState.usedFirefightPloyIds.filter((id) => id !== ployId)
        : [...currentTpState.usedFirefightPloyIds, ployId];

      const updated = updateTurningPointState(game, game.turningPoint, {
        ...currentTpState,
        usedFirefightPloyIds: updatedUsed,
      });
      onChange(updated);
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
              return (
                <button
                  key={ploy.id}
                  className={`strategic-ploy-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectStrategicPloy(ploy.id)}
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
              <div
                key={ploy.id}
                className={cardClass}
                role="button"
                tabIndex={isStarted ? 0 : -1}
                onClick={() => isStarted && handleToggleFirefightPloy(ploy.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isStarted) handleToggleFirefightPloy(ploy.id);
                  }
                }}
                aria-pressed={isUsed}
                aria-label={`${ploy.name} — ${isUsed ? 'Used this turning point' : canAfford ? 'Affordable' : 'Cannot afford'}`}
              >
                <div className="ff-ploy-info">
                  <p className="ff-ploy-name">{ploy.name}</p>
                  <p className="ff-ploy-cost">{ploy.cost}CP</p>
                  <p className="ff-ploy-desc">{ploy.description}</p>
                </div>
                {isUsed && <span className="ff-used-badge">✓ Used</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
