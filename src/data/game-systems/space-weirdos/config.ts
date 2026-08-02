import { GameSystemConfig } from '@/types';

export const spaceWeirdosGameSystemConfig: GameSystemConfig = {
  id: 'space-weirdos',
  name: 'Space Weirdos',
  description:
    'Scaffolded integration target for Space Weirdos config and reference data.',
  status: 'scaffolded',
  referenceSources: [
    {
      id: 'space-weirdos-config',
      name: 'Game System Config',
      description: 'System-level metadata and integration status',
      path: 'src/data/game-systems/space-weirdos/config.ts',
    },
    {
      id: 'space-weirdos-reference-data',
      name: 'Reference Data Scaffold',
      description:
        'Placeholder collections for factions, traits, and scenarios',
      path: 'src/data/game-systems/space-weirdos/reference-data.ts',
    },
  ],
};
