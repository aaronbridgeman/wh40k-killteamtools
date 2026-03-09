/**
 * Kill Team mission lists for Critical Op and Tactical Op selection.
 *
 * Names reflect standard Kill Team competitive operations (2nd Edition / KT24).
 * Descriptions are brief scoring summaries to help the player track goals during play.
 * Select 'Custom / Other' to enter a free-text operation not in the list.
 */

export interface MissionEntry {
  /** Unique identifier — kebab-case, e.g. `'no-prisoners'` */
  id: string;
  /** Display name shown in the dropdown */
  name: string;
  /**
   * Brief scoring reminder shown during play.
   * Empty for the 'Custom / Other' sentinel entry.
   */
  description: string;
}

/** Sentinel id / value used when the player wants to type a custom name. */
export const CUSTOM_MISSION_VALUE = '__custom__';

/** Standard Critical Operations available in Kill Team competitive play. */
export const CRIT_OPS: MissionEntry[] = [
  {
    id: 'no-prisoners',
    name: 'No Prisoners',
    description: 'Score 1VP for each enemy operative you incapacitate.',
  },
  {
    id: 'data-acquisition',
    name: 'Data Acquisition',
    description:
      'Perform Data actions on intel markers to score VPs each turning point.',
  },
  {
    id: 'recover-intelligence',
    name: 'Recover Intelligence',
    description:
      "Collect intel markers from no man's land and carry them to your side.",
  },
  {
    id: 'infiltrate-and-destroy',
    name: 'Infiltrate and Destroy',
    description:
      'Score VPs for destroying enemy supply caches in their territory.',
  },
  {
    id: 'ritual',
    name: 'The Ritual',
    description: 'Score VPs for performing ritual actions on key markers.',
  },
  {
    id: 'secure-the-zone',
    name: 'Secure the Zone',
    description:
      'Score VPs by controlling objective markers at end of each TP.',
  },
  {
    id: 'supply-lines',
    name: 'Supply Lines',
    description:
      'Control supply cache markers across the killzone to score VPs.',
  },
  {
    id: 'custom',
    name: 'Custom / Other',
    description: '',
  },
];

/** Standard Tactical Operations available in Kill Team competitive play. */
export const TAC_OPS: MissionEntry[] = [
  // ── Seek & Destroy ────────────────────────────────────────────────────
  {
    id: 'assassinate',
    name: 'Assassinate',
    description:
      'Score 2VP if the enemy leader is incapacitated during the game.',
  },
  {
    id: 'target-acquired',
    name: 'Target Acquired',
    description:
      'Secretly mark an enemy operative before the game; score 2VP if they are incapacitated.',
  },
  {
    id: 'neutralise',
    name: 'Neutralise',
    description:
      'Score 1VP at the end of each TP (2–4) where you incapacitate at least one operative.',
  },
  {
    id: 'demolish',
    name: 'Demolish',
    description:
      'Score VP for destroying terrain features or markers in enemy territory.',
  },
  // ── Security ──────────────────────────────────────────────────────────
  {
    id: 'hold-firm',
    name: 'Hold Firm',
    description:
      'Score 1VP at the end of TPs 2, 3, and 4 if you control your home objective marker.',
  },
  {
    id: 'defend-ground',
    name: 'Defend Ground',
    description:
      'Score VP for controlling more objective markers than your opponent at game end.',
  },
  {
    id: 'no-way-through',
    name: 'No Way Through',
    description:
      'Score 1VP at the end of each TP where no enemy operatives are in your half.',
  },
  {
    id: 'cut-off',
    name: 'Cut Off',
    description:
      'Score VP if you control more table quarters than your opponent at the end of the game.',
  },
  // ── Infiltration ──────────────────────────────────────────────────────
  {
    id: 'behind-enemy-lines',
    name: 'Behind Enemy Lines',
    description:
      'Score 1VP for each friendly operative wholly within enemy territory at game end (max 3VP).',
  },
  {
    id: 'advance',
    name: 'Advance',
    description:
      'Score 1VP at the end of TPs 3 and 4 if you control an objective marker in enemy territory.',
  },
  {
    id: 'establish-presence',
    name: 'Establish Presence',
    description:
      'Score VP for having operatives distributed across different zones of the killzone.',
  },
  {
    id: 'seize-ground',
    name: 'Seize Ground',
    description:
      'Score 1VP at the end of each TP where you control the central objective marker.',
  },
  // ── Intel ─────────────────────────────────────────────────────────────
  {
    id: 'gain-intelligence',
    name: 'Gain Intelligence',
    description:
      'Score 1VP at the end of each TP where you activate more operatives than your opponent.',
  },
  {
    id: 'recon',
    name: 'Recon',
    description:
      'Score VP for moving operatives within range of the enemy deployment zone.',
  },
  {
    id: 'vital-information',
    name: 'Vital Information',
    description:
      'Score VP for controlling intel markers at the end of the game.',
  },
  {
    id: 'mark-their-turf',
    name: 'Mark Their Turf',
    description:
      "Score VP for performing actions near or within the opponent's deployment zone.",
  },
  {
    id: 'custom',
    name: 'Custom / Other',
    description: '',
  },
];
