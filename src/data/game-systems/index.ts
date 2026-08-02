import { GameSystemConfig } from '@/types';
import { killTeamGameSystemConfig } from './kill-team/config';
import { spaceWeirdosGameSystemConfig } from './space-weirdos/config';

export const GAME_SYSTEMS = [
  killTeamGameSystemConfig,
  spaceWeirdosGameSystemConfig,
] as const satisfies readonly GameSystemConfig[];

export type GameSystemId = (typeof GAME_SYSTEMS)[number]['id'];

export function getGameSystemConfig(
  gameSystemId: GameSystemId
): GameSystemConfig | undefined {
  return GAME_SYSTEMS.find((gameSystem) => gameSystem.id === gameSystemId);
}
