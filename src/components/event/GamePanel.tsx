/**
 * GamePanel — renders all per-game content for one of the 3 event games.
 *
 * Composes the OperativeRosterManager, EventEquipmentTracker,
 * TurningPointPloys, and CPTracker components, passing game state down
 * and propagating updates back via the onChange callback.
 */

import { useCallback } from 'react';
import { Faction, Equipment } from '@/types';
import { GameEventState } from '@/types/event';
import { OperativeRosterManager } from './OperativeRosterManager';
import { EventEquipmentTracker } from './EventEquipmentTracker';
import { TurningPointPloys } from './TurningPointPloys';
import './GamePanel.css';

interface GamePanelProps {
  /** Current state of this game */
  game: GameEventState;
  /** Zero-based index within the event (0 = Game 1) */
  gameIndex: number;
  /** Loaded Plague Marines faction data */
  faction: Faction;
  /** Universal (generic) equipment items available to any faction */
  universalEquipment: Equipment[];
  /** Called whenever any part of the game state changes */
  onChange: (updatedGame: GameEventState) => void;
}

/**
 * Per-game panel composing all game management sub-components.
 */
export function GamePanel({
  game,
  gameIndex,
  faction,
  universalEquipment,
  onChange,
}: GamePanelProps) {
  const handleRosterChange = useCallback(
    (removedOperativeId: string | null) => {
      onChange({ ...game, removedOperativeId });
    },
    [game, onChange]
  );

  const handleIncapacitatedChange = useCallback(
    (incapacitatedOperativeIds: string[]) => {
      onChange({ ...game, incapacitatedOperativeIds });
    },
    [game, onChange]
  );

  const handleEquipmentChange = useCallback(
    (selectedEquipmentIds: string[], blightGrenadeUsesRemaining: number) => {
      onChange({ ...game, selectedEquipmentIds, blightGrenadeUsesRemaining });
    },
    [game, onChange]
  );

  const handleTurningPointChange = useCallback(
    (updatedGame: GameEventState) => {
      onChange(updatedGame);
    },
    [onChange]
  );

  const gameLabel = `Game ${gameIndex + 1}`;

  return (
    <div className="game-panel" aria-label={gameLabel}>
      {/* Operative roster: show all 7, remove 1 */}
      <section
        className="panel-section"
        aria-labelledby={`roster-title-${gameIndex}`}
      >
        <h3 className="panel-section-title" id={`roster-title-${gameIndex}`}>
          ☠️ Operative Roster
        </h3>
        <OperativeRosterManager
          faction={faction}
          removedOperativeId={game.removedOperativeId}
          selectedEquipmentIds={game.selectedEquipmentIds}
          onRosterChange={handleRosterChange}
          incapacitatedOperativeIds={game.incapacitatedOperativeIds}
          onIncapacitatedChange={handleIncapacitatedChange}
        />
      </section>

      {/* Equipment selection */}
      <section
        className="panel-section"
        aria-labelledby={`equip-title-${gameIndex}`}
      >
        <h3 className="panel-section-title" id={`equip-title-${gameIndex}`}>
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

      {/* Turning points, strategic ploys, CP, and firefight ploys */}
      <section
        className="panel-section"
        aria-labelledby={`ploys-title-${gameIndex}`}
      >
        <h3 className="panel-section-title" id={`ploys-title-${gameIndex}`}>
          🎲 Turning Points & Ploys
        </h3>
        <TurningPointPloys
          game={game}
          faction={faction}
          onChange={handleTurningPointChange}
          removedOperativeId={game.removedOperativeId}
          incapacitatedOperativeIds={game.incapacitatedOperativeIds}
        />
      </section>
    </div>
  );
}
