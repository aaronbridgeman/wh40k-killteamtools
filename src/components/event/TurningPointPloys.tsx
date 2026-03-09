/**
 * TurningPointPloys — turning point navigation, strategic ploy selection,
 * CP tracking, and firefight ploy display.
 *
 * Data sourced directly from the loaded faction (ploys array in faction.json).
 * No hardcoded ploy data — fully driven by the faction configuration.
 *
 * CP rules (per user spec):
 *  - CP is managed manually via the CPTracker (+/−).
 *  - Selecting a strategic ploy automatically deducts its effective CP cost;
 *    deselecting refunds it.  Switching ploys (refund + deduct) is
 *    always allowed because all Plague Marines ploys cost the same.
 *  - Contagion costs 0 CP when the Icon Bearer is active (not removed and
 *    not incapacitated).
 *  - Firefight ploys can be used multiple times if CP is available.
 *    Each use deducts the ploy cost; an Undo button refunds the last use.
 *  - The generic "Command Reroll" ploy (1 CP) is always available.
 *
 * @see QUICK_PLAY_EVENT_SPEC.md — sections 4, 5, 6, 7
 */

import { useCallback, useState } from 'react';
import { Faction, Ploy } from '@/types';
import { GameEventState, TurningPointState } from '@/types/event';
import {
  getTurningPointState,
  updateTurningPointState,
  advanceTurningPoint,
  getInitialTurningPointState,
} from '@/services/eventStorage';
import {
  GAME_DEFAULTS,
  QUICK_PLAY_DEFAULTS,
  COMMAND_REROLL_PLOY,
} from '@/constants';
import './TurningPointPloys.css';

interface TurningPointPloysProps {
  /** Current game state */
  game: GameEventState;
  /** Loaded faction data (provides ploys list) */
  faction: Faction;
  /** Called whenever game state changes (TP advance, ploy selection, CP) */
  onChange: (updatedGame: GameEventState) => void;
  /** ID of the removed operative (may be null) — used for Icon Bearer check */
  removedOperativeId: string | null;
  /** IDs of incapacitated operatives — used for Icon Bearer check */
  incapacitatedOperativeIds: string[];
}

interface FirefightPloyRowProps {
  ployId: string;
  ployName: string;
  ployCost: number;
  ployDesc: string;
  useCount: number;
  isStarted: boolean;
  canAfford: boolean;
  onUse: (id: string, cost: number) => void;
  onUndo: (id: string, cost: number) => void;
}

/** Renders a single firefight ploy row with use/undo buttons and use-count badge. */
function FirefightPloyRow({
  ployId,
  ployName,
  ployCost,
  ployDesc,
  useCount,
  isStarted,
  canAfford,
  onUse,
  onUndo,
}: FirefightPloyRowProps) {
  let cardClass = 'firefight-ploy-card';
  if (useCount > 0) cardClass += ' used';
  else if (canAfford) cardClass += ' affordable';
  else cardClass += ' unaffordable';

  return (
    <div key={ployId} className={cardClass}>
      <div className="ff-ploy-info">
        <p className="ff-ploy-name">{ployName}</p>
        <p className="ff-ploy-cost">{ployCost}CP</p>
        <p className="ff-ploy-desc">{ployDesc}</p>
      </div>
      <div className="ff-ploy-actions">
        {useCount > 0 && (
          <button
            type="button"
            className="ff-undo-button"
            onClick={() => onUndo(ployId, ployCost)}
            disabled={!isStarted}
            aria-label={`Undo last use of ${ployName}`}
          >
            ↩ Undo
          </button>
        )}
        {useCount > 0 && (
          <span
            className="ff-use-count"
            aria-label={`Used ${useCount} time${useCount !== 1 ? 's' : ''} this turning point`}
          >
            ✓ ×{useCount}
          </span>
        )}
        <button
          type="button"
          className={`ff-use-button ${!canAfford ? 'cannot-afford' : ''}`}
          onClick={() => onUse(ployId, ployCost)}
          disabled={!isStarted || !canAfford}
          aria-label={`${ployName} — ${canAfford ? 'Use ploy' : 'Cannot afford'}`}
        >
          Use ({ployCost}CP)
        </button>
      </div>
    </div>
  );
}

/** Clamps a CP value to the valid range [MIN, MAX]. */
function clampCp(cp: number): number {
  return Math.max(
    GAME_DEFAULTS.MIN_COMMAND_POINTS,
    Math.min(GAME_DEFAULTS.MAX_COMMAND_POINTS, cp)
  );
}

/**
 * Returns true if the Icon Bearer is currently active in the roster
 * (not removed from this game and not incapacitated).
 */
function isIconBearerActive(
  removedOperativeId: string | null,
  incapacitatedOperativeIds: string[]
): boolean {
  const id = QUICK_PLAY_DEFAULTS.ICON_BEARER_ID;
  return removedOperativeId !== id && !incapacitatedOperativeIds.includes(id);
}

/**
 * Returns the effective CP cost for a ploy, taking into account
 * the Contagion 0-cost rule when the Icon Bearer is active and in enemy territory.
 */
function getEffectivePloyCost(
  ploy: Ploy,
  iconBearerActive: boolean,
  iconBearerInEnemyTerritory: boolean
): number {
  if (
    ploy.id === QUICK_PLAY_DEFAULTS.CONTAGION_PLOY_ID &&
    iconBearerActive &&
    iconBearerInEnemyTerritory
  ) {
    return 0;
  }
  return ploy.cost;
}

/**
 * Renders the turning point selector, strategic ploy selector (pick one per TP),
 * active strategic ploy display, CP tracker, and firefight ploy grid.
 */
export function TurningPointPloys({
  game,
  faction,
  onChange,
  removedOperativeId,
  incapacitatedOperativeIds,
}: TurningPointPloysProps) {
  const ploys: Ploy[] = faction.ploys ?? [];
  const strategicPloys = ploys.filter((p) => p.type === 'strategy');
  const firefightPloys = ploys.filter((p) => p.type === 'firefight');

  const iconBearerActive = isIconBearerActive(
    removedOperativeId,
    incapacitatedOperativeIds
  );
  const iconBearerInEnemyTerritory = game.iconBearerInEnemyTerritory ?? false;

  const isStarted = game.turningPoint > 0;
  const currentTpState: TurningPointState = isStarted
    ? getTurningPointState(game, game.turningPoint)
    : getInitialTurningPointState();

  // Auto-collapse the strategic ploy grid when no unselected ploys are affordable
  const allPloysSelectedOrUnaffordable =
    isStarted &&
    strategicPloys.every((ploy) => {
      const isSelected = currentTpState.selectedStrategicPloyIds.includes(
        ploy.id
      );
      const effectiveCost = getEffectivePloyCost(
        ploy,
        iconBearerActive,
        iconBearerInEnemyTerritory
      );
      return isSelected || game.commandPoints < effectiveCost;
    });

  const [ployGridExpanded, setPloyGridExpanded] = useState(true);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleAdvanceTp = useCallback(() => {
    onChange(advanceTurningPoint(game));
  }, [game, onChange]);

  const handleRetreatTp = useCallback(() => {
    const prevTp = Math.max(1, game.turningPoint - 1);
    onChange({ ...game, turningPoint: prevTp });
  }, [game, onChange]);

  /**
   * Toggle a strategic ploy for the current turning point.
   * Selecting adds to the active set and deducts its effective CP cost.
   * Deselecting removes from the active set and refunds its effective CP cost.
   * Multiple ploys may be active simultaneously.
   * Contagion costs 0 CP when the Icon Bearer is active.
   */
  const handleSelectStrategicPloy = useCallback(
    (ploy: Ploy) => {
      if (!isStarted) return;
      const isCurrentlySelected =
        currentTpState.selectedStrategicPloyIds.includes(ploy.id);
      const effectiveCost = getEffectivePloyCost(
        ploy,
        iconBearerActive,
        iconBearerInEnemyTerritory
      );

      // CP delta: deselecting refunds, selecting deducts
      const cpDelta = isCurrentlySelected ? effectiveCost : -effectiveCost;

      const updatedIds = isCurrentlySelected
        ? currentTpState.selectedStrategicPloyIds.filter((id) => id !== ploy.id)
        : [...currentTpState.selectedStrategicPloyIds, ploy.id];

      const updatedWithTp = updateTurningPointState(game, game.turningPoint, {
        ...currentTpState,
        selectedStrategicPloyIds: updatedIds,
      });
      onChange({
        ...updatedWithTp,
        commandPoints: clampCp(game.commandPoints + cpDelta),
      });
    },
    [
      game,
      onChange,
      isStarted,
      currentTpState,
      iconBearerActive,
      iconBearerInEnemyTerritory,
    ]
  );

  /**
   * Use a firefight ploy (or Command Reroll) once, deducting its CP cost.
   * Ploys can be used multiple times as long as CP is available.
   */
  const handleUseFirefightPloy = useCallback(
    (ployId: string, ployCost: number) => {
      if (!isStarted || game.commandPoints < ployCost) return;
      const currentCount = currentTpState.firefightPloyCounts[ployId] ?? 0;
      const updatedWithTp = updateTurningPointState(game, game.turningPoint, {
        ...currentTpState,
        firefightPloyCounts: {
          ...currentTpState.firefightPloyCounts,
          [ployId]: currentCount + 1,
        },
      });
      onChange({
        ...updatedWithTp,
        commandPoints: clampCp(game.commandPoints - ployCost),
      });
    },
    [game, onChange, isStarted, currentTpState]
  );

  /**
   * Undo the last use of a firefight ploy, refunding its CP cost.
   */
  const handleUndoFirefightPloy = useCallback(
    (ployId: string, ployCost: number) => {
      if (!isStarted) return;
      const currentCount = currentTpState.firefightPloyCounts[ployId] ?? 0;
      if (currentCount <= 0) return;
      const updatedWithTp = updateTurningPointState(game, game.turningPoint, {
        ...currentTpState,
        firefightPloyCounts: {
          ...currentTpState.firefightPloyCounts,
          [ployId]: currentCount - 1,
        },
      });
      onChange({
        ...updatedWithTp,
        commandPoints: clampCp(game.commandPoints + ployCost),
      });
    },
    [game, onChange, isStarted, currentTpState]
  );

  // ------------------------------------------------------------------
  // Helpers for rendering firefight ploy rows
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="tp-ploys">
      {/* Turning point navigation */}
      <div className="tp-selector">
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
          <span className="tp-of">of {GAME_DEFAULTS.MAX_TURNING_POINT}</span>
        </div>
        <button
          className="tp-button"
          onClick={handleAdvanceTp}
          disabled={game.turningPoint >= GAME_DEFAULTS.MAX_TURNING_POINT}
          aria-label="Advance to next turning point"
        >
          ›
        </button>
      </div>

      {/* CP tracker */}
      {/* CP is managed in the combined stats section above — see GamePlayView */}

      {/* Icon Bearer status + enemy territory toggle */}
      {isStarted && (
        <div className="icon-bearer-status-row">
          {iconBearerActive ? (
            <label className="icon-bearer-toggle-label">
              <input
                type="checkbox"
                checked={iconBearerInEnemyTerritory}
                onChange={(e) =>
                  onChange({
                    ...game,
                    iconBearerInEnemyTerritory: e.target.checked,
                  })
                }
                className="icon-bearer-checkbox"
                aria-label="Icon Bearer is in enemy territory (Contagion costs 0 CP)"
              />
              <span className="icon-bearer-status active">
                🏳️ Icon Bearer in enemy territory
                {iconBearerInEnemyTerritory
                  ? ' — Contagion: 0 CP'
                  : ' — Contagion: 1 CP'}
              </span>
            </label>
          ) : (
            <p className="icon-bearer-status inactive">
              ⚠️ Icon Bearer inactive — Contagion: 1 CP
            </p>
          )}
        </div>
      )}

      {/* Strategic ploy selection — shown once game is started */}
      {isStarted && (
        <div>
          <div className="strategic-ploys-header">
            <p className="strategic-ploys-title">
              Select Strategic Ploy for TP {game.turningPoint}
            </p>
            {allPloysSelectedOrUnaffordable && (
              <button
                type="button"
                className="ploys-toggle-btn"
                onClick={() => setPloyGridExpanded((prev) => !prev)}
                aria-expanded={ployGridExpanded}
                aria-label={
                  ployGridExpanded ? 'Collapse ploy list' : 'Expand ploy list'
                }
              >
                {ployGridExpanded ? 'Collapse' : 'Expand'}
              </button>
            )}
          </div>
          {/* Auto-collapse: hide unaffordable/all-selected ploy grid */}
          {(!allPloysSelectedOrUnaffordable || ployGridExpanded) && (
            <div className="strategic-ploy-grid">
              {strategicPloys.map((ploy) => {
                const isSelected =
                  currentTpState.selectedStrategicPloyIds.includes(ploy.id);
                const effectiveCost = getEffectivePloyCost(
                  ploy,
                  iconBearerActive,
                  iconBearerInEnemyTerritory
                );
                // Disable when not selected and cannot afford
                const isDisabled =
                  !isSelected && game.commandPoints < effectiveCost;
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
                    <p className="ploy-card-cost">
                      {effectiveCost === 0 && ploy.cost > 0 ? (
                        <>
                          <s>{ploy.cost}CP</s> 0CP
                        </>
                      ) : (
                        `${effectiveCost}CP`
                      )}
                    </p>
                    <p className="ploy-card-desc">{ploy.description}</p>
                  </button>
                );
              })}
            </div>
          )}
          {/* Summary of selected ploys when collapsed */}
          {allPloysSelectedOrUnaffordable && !ployGridExpanded && (
            <div className="strategic-ploys-summary">
              {currentTpState.selectedStrategicPloyIds.length > 0 ? (
                currentTpState.selectedStrategicPloyIds.map((id) => {
                  const ploy = strategicPloys.find((p) => p.id === id);
                  return ploy ? (
                    <span key={id} className="ploy-summary-badge">
                      ✓ {ploy.name}
                    </span>
                  ) : null;
                })
              ) : (
                <span className="ploy-summary-none">No ploys selected</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Active strategic ploy banner — moved to GamePlayView (rendered after equipment) */}

      {/* Firefight ploys — faction + Command Reroll */}
      <div>
        <p className="firefight-ploys-title">Firefight Ploys</p>
        <div className="firefight-ploy-list">
          {firefightPloys.map((ploy) => (
            <FirefightPloyRow
              key={ploy.id}
              ployId={ploy.id}
              ployName={ploy.name}
              ployCost={ploy.cost}
              ployDesc={ploy.description}
              useCount={currentTpState.firefightPloyCounts[ploy.id] ?? 0}
              isStarted={isStarted}
              canAfford={game.commandPoints >= ploy.cost}
              onUse={handleUseFirefightPloy}
              onUndo={handleUndoFirefightPloy}
            />
          ))}
          {/* Generic Command Reroll ploy — always available */}
          <FirefightPloyRow
            key={COMMAND_REROLL_PLOY.id}
            ployId={COMMAND_REROLL_PLOY.id}
            ployName={COMMAND_REROLL_PLOY.name}
            ployCost={COMMAND_REROLL_PLOY.cost}
            ployDesc={COMMAND_REROLL_PLOY.description}
            useCount={
              currentTpState.firefightPloyCounts[COMMAND_REROLL_PLOY.id] ?? 0
            }
            isStarted={isStarted}
            canAfford={game.commandPoints >= COMMAND_REROLL_PLOY.cost}
            onUse={handleUseFirefightPloy}
            onUndo={handleUndoFirefightPloy}
          />
        </div>
      </div>
    </div>
  );
}
