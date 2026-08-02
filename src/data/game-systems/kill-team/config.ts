import { GameSystemConfig } from '@/types';

export const killTeamGameSystemConfig: GameSystemConfig = {
  id: 'kill-team',
  name: 'Kill Team',
  description:
    'Warhammer 40,000 Kill Team rules, team building, and Solo/Joint Ops support.',
  status: 'active',
  referenceSources: [
    {
      id: 'kill-team-factions',
      name: 'Faction Configs',
      description: 'Faction definitions, operatives, and ploys',
      path: 'src/data/factions',
    },
    {
      id: 'kill-team-rules',
      name: 'Reference Rules',
      description: 'General and weapon rule reference data',
      path: 'src/data/rules',
    },
    {
      id: 'kill-team-weapons',
      name: 'Weapon Rules',
      description: 'Weapon rule glossary definitions',
      path: 'src/data/weapons',
    },
  ],
};
