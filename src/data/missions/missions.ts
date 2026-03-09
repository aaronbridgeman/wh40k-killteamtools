/**
 * Kill Team mission lists for Critical Op and Tactical Op selection.
 *
 * Names reflect standard Kill Team competitive operations (2nd Edition / KT24).
 * Descriptions are brief scoring summaries to help the player track goals during play.
 * Select 'Custom / Other' to enter a free-text operation not in the list.
 */

/** A single mission action that operatives can perform during a Crit Op. */
export interface MissionAction {
  /** Display name of the action */
  name: string;
  /** Action point cost */
  ap_cost: number;
  /** Full description of what the action does */
  description: string;
  /** Optional restrictions on when/how the action can be performed */
  restrictions?: string;
}

export interface MissionEntry {
  /** Unique identifier — kebab-case, e.g. `'secure'` */
  id: string;
  /** Display name shown in the dropdown */
  name: string;
  /**
   * Brief scoring reminder shown during play.
   * Empty for the 'Custom / Other' sentinel entry.
   */
  description: string;
  /** Mission-specific actions operatives can perform (Crit Ops only). */
  mission_actions?: MissionAction[];
  /** Scoring criteria for the operation (Crit Ops only). */
  victory_points?: string[];
  /**
   * Additional setup or special rules for the operation (Crit Ops only).
   * May be a single string or an array of strings.
   */
  additional_rules?: string | string[];
}

/** Sentinel id / value used when the player wants to type a custom name. */
export const CUSTOM_MISSION_VALUE = '__custom__';

/** Standard Critical Operations available in Kill Team competitive play. */
export const CRIT_OPS: MissionEntry[] = [
  {
    id: 'secure',
    name: 'Secure',
    description: 'Secure objective markers to score VP each turning point.',
    mission_actions: [
      {
        name: 'Secure',
        ap_cost: 1,
        description:
          'One objective marker the active operative controls is secured by your kill team until the enemy kill team secures that objective marker.',
        restrictions:
          'An operative cannot perform this action during the first turning point, or while within control range of an enemy operative.',
      },
    ],
    victory_points: [
      'At the end of each turning point after the first: Score 1VP if any objective markers are secured by your kill team.',
      "Score 1VP if more objective markers are secured by your kill team than your opponent's kill team.",
    ],
  },
  {
    id: 'loot',
    name: 'Loot',
    description: 'Loot objective markers to score up to 2VP per turning point.',
    mission_actions: [
      {
        name: 'Loot',
        ap_cost: 1,
        description:
          'One objective marker the active operative controls is looted.',
        restrictions:
          'An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already been looted during this turning point.',
      },
    ],
    victory_points: [
      'Whenever a friendly operative performs the Loot action, you score 1VP (to a maximum of 2VP per turning point).',
    ],
  },
  {
    id: 'transmission',
    name: 'Transmission',
    description: 'Initiate transmissions on objective markers to score VP.',
    mission_actions: [
      {
        name: 'Initiate Transmission',
        ap_cost: 1,
        description:
          'One objective marker the active operative controls is transmitting until the start of next turning point.',
        restrictions:
          'An operative cannot perform this action during the first turning point, or while within control range of an enemy operative.',
      },
    ],
    victory_points: [
      'At the end of each turning point after the first: Score 1VP if friendly operatives control any transmitting objective markers.',
      'Score 1VP if friendly operatives control more transmitting objective markers than enemy operatives do.',
    ],
  },
  {
    id: 'orb',
    name: 'Orb',
    description: 'Move the Orb token to score VP for objectives without it.',
    additional_rules:
      'At the start of the battle, the centre objective has the Orb token.',
    mission_actions: [
      {
        name: 'Move Orb',
        ap_cost: 1,
        description:
          "If the active operative controls the objective marker that has the Orb token, move the token: If the centre objective marker has it, move it to either player's objective marker (your choice). If a player's objective marker has it, move it to the centre objective marker.",
        restrictions:
          "An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if it doesn't control the objective marker that has the Orb token.",
      },
    ],
    victory_points: [
      "At the end of each turning point after the first, for each objective marker that friendly operatives control that doesn't have the Orb token, you score 1VP.",
    ],
  },
  {
    id: 'stake-claim',
    name: 'Stake Claim',
    description:
      'Declare claims on objectives and score VP for holding more than your opponent.',
    additional_rules:
      "At the start of the Gambit step of each Strategy phase after the first, starting with the player with initiative, each player must select both one objective marker and one of the following claims for that turning point: 1. Friendly operatives will control that objective marker at the end of this turning point. 2. Enemy operatives won't contest that objective marker at the end of this turning point. Each player cannot select each objective marker more than once per battle.",
    victory_points: [
      'At the end of each turning point after the first (as per errata): Score 1VP if friendly operatives control more objective markers than enemy operatives do.',
      'Score 1VP if your selected claim is true.',
    ],
  },
  {
    id: 'energy-cells',
    name: 'Energy Cells',
    description: 'Carry energy cell objectives to score VP at end of battle.',
    additional_rules: [
      'Operatives can perform the Pick Up Marker action upon each objective marker with added costs: +2AP in Turning Point 2; +1AP in Turning Point 3; normal cost in Turning Point 4. These AP additions cannot be reduced.',
      'Carrying operatives cannot be removed and set up again more than 6" away.',
    ],
    victory_points: [
      'At the end of each turning point after the first (as per errata): Score 1VP if friendly operatives control more objective markers than enemy operatives do.',
      'At the end of the battle, score 1VP for each objective marker friendly operatives are carrying.',
    ],
  },
  {
    id: 'download',
    name: 'Download',
    description:
      'Download objectives for escalating VP in later turning points.',
    mission_actions: [
      {
        name: 'Download',
        ap_cost: 1,
        description:
          "One centre or opponent's objective marker the active operative controls is downloaded.",
        restrictions:
          'An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker has already been downloaded during the battle.',
      },
    ],
    victory_points: [
      'At the end of each turning point after the first, score 1VP if friendly operatives control more objective markers than enemy operatives do (ignore downloaded objectives for this calculation).',
      'Score 1VP whenever a friendly operative performs the Download action during the third turning point.',
      'Score 2VP whenever a friendly operative performs the Download action during the fourth turning point.',
    ],
  },
  {
    id: 'data',
    name: 'Data',
    description: 'Compile and send data from objectives to score VP.',
    mission_actions: [
      {
        name: 'Compile Data',
        ap_cost: 1,
        description:
          'One objective marker the active operative controls gains 1 Data point (use a die as a token to track).',
        restrictions:
          'Cannot perform during the first turning point, while within control range of an enemy operative, or if that objective marker has already gained Data this turning point.',
      },
      {
        name: 'Send Data',
        ap_cost: 1,
        description:
          'Remove all Data points from an objective marker the active operative controls.',
        restrictions:
          'Cannot perform during the first, second or third turning point while within control range of an enemy operative, or if the marker has no Data points.',
      },
    ],
    victory_points: [
      'At the end of the second and third turning point, score 1VP if friendly operatives have performed more Compile Data actions than enemies.',
      'Whenever a friendly operative performs the Send Data action, you score VP equal to the number of Data points removed.',
    ],
  },
  {
    id: 'reboot',
    name: 'Reboot',
    description:
      'Secretly select objectives each phase; reboot inert ones to score VP.',
    additional_rules:
      'Objectives are numbered 1-3. At the start of the Gambit step each phase, each player secretly selects one objective via a hidden die. If players select the same one, that objective is inert. If different, the unselected third objective is inert.',
    mission_actions: [
      {
        name: 'Reboot',
        ap_cost: 2,
        description:
          'One inert objective marker that active operative controls is no longer inert.',
        restrictions:
          'Cannot perform during the first turning point, or while within control range of an enemy operative.',
      },
    ],
    victory_points: [
      'At the end of each turning point after the first, for each objective marker friendly operatives control, you score 1VP. Ignore inert objective markers when determining this.',
    ],
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
