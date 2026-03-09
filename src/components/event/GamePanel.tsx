/**
 * GamePanel — renders per-game content for one of the 3 event games.
 *
 * Routes to GameSetupView (game.gamePhase === 'setup') or GamePlayView
 * (game.gamePhase === 'playing'), keeping each screen focused on the
 * activity in question.
 */

import { Faction, Equipment } from '@/types';
import { GameEventState } from '@/types/event';
import { GameSetupView } from './GameSetupView';
import { GamePlayView } from './GamePlayView';

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
 * Per-game panel — routes to setup or play phase based on game.gamePhase.
 */
export function GamePanel({
  game,
  faction,
  universalEquipment,
  onChange,
}: GamePanelProps) {
  if (game.gamePhase === 'playing') {
    return (
      <GamePlayView
        game={game}
        faction={faction}
        universalEquipment={universalEquipment}
        onChange={onChange}
      />
    );
  }

  return (
    <GameSetupView
      game={game}
      faction={faction}
      universalEquipment={universalEquipment}
      onChange={onChange}
    />
  );
}
