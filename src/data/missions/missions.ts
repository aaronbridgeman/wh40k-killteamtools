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
  /** Mission-specific actions operatives can perform. */
  mission_actions?: MissionAction[];
  /** Scoring criteria for the operation. */
  victory_points?: string[];
  /**
   * Additional setup or special rules for the operation.
   * May be a single string or an array of strings.
   */
  additional_rules?: string | string[];
  /**
   * Archetype this tac op belongs to (e.g. 'Recon', 'Infiltration').
   * Used to group entries in the dropdown.
   */
  archetype?: string;
  /**
   * The condition under which this tac op is revealed to the opponent.
   * Applies to tac ops only.
   */
  reveal_condition?: string;
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
  // ── Recon ─────────────────────────────────────────────────────────────
  {
    id: 'flank',
    name: 'Flank',
    archetype: 'Recon',
    reveal_condition: 'Strategic Gambit',
    description:
      'Control left and right flanks in enemy territory to score up to 2VP per turning point.',
    additional_rules: [
      "Divide the killzone into two flanks (left and right) by drawing a line from the centre of each player's killzone edge.",
      "An operative contests a flank while both wholly within it and wholly within their opponent's territory.",
      'Friendly operatives control a flank if the total APL stat of those contesting it is greater than that of enemy operatives.',
    ],
    victory_points: [
      'At the end of each turning point after the first: Score 1VP for each flank friendly operatives control.',
      'In the fourth turning point: Score 2VP for a controlled flank if friendly operatives also controlled it at the end of the third turning point.',
      'Maximum 2VP per turning point.',
    ],
  },
  {
    id: 'scout-enemy-movement',
    name: 'Scout Enemy Movement',
    archetype: 'Recon',
    reveal_condition:
      'First time a friendly operative performs the Scout action.',
    description:
      'Monitor enemy operatives using the Scout action to score 1VP per monitored enemy visible to friendlies.',
    mission_actions: [
      {
        name: 'Scout',
        ap_cost: 1,
        description:
          'Select one ready enemy operative visible to and more than 6" from the active operative. Target is monitored until the Ready step of the next Strategy phase.',
        restrictions:
          'Cannot perform with an Engage order, during the first turning point, or while within control range of an enemy operative.',
      },
    ],
    victory_points: [
      'At the end of each turning point after the first: Score 1VP for each monitored enemy operative visible to friendly operatives.',
      'Maximum 2VP per turning point.',
    ],
  },
  {
    id: 'retrieval',
    name: 'Retrieval',
    archetype: 'Recon',
    reveal_condition: 'First time you score VP from this Tac Op.',
    description:
      'Search objective markers to collect Retrieval mission markers and score VP.',
    mission_actions: [
      {
        name: 'Retrieve',
        ap_cost: 1,
        description:
          'If the active operative controls an objective marker not yet searched by friendly operatives, the active operative now carries a Retrieval mission marker.',
        restrictions:
          'Cannot perform during the first turning point, while within control range of an enemy operative, or if already carrying a Retrieval mission marker.',
      },
    ],
    victory_points: [
      'Score 1VP the first time each objective marker is searched by friendly operatives.',
      'At the end of the battle: Score 1VP for each Retrieval mission marker friendly operatives are carrying.',
    ],
  },
  // ── Infiltration ──────────────────────────────────────────────────────
  {
    id: 'track-enemy',
    name: 'Track Enemy',
    archetype: 'Infiltration',
    reveal_condition: 'First time you score VP from this Tac Op.',
    description:
      'Track hidden enemy operatives with Concealed friendlies to score up to 2VP per turning point.',
    additional_rules: [
      'An enemy operative is tracked if it is a valid target for a friendly operative within 6" that has a Conceal order.',
      'The tracking friendly operative must not be a valid target for the tracked enemy and cannot be within enemy control range.',
    ],
    victory_points: [
      'At the end of each turning point after the first: Score 1VP if one enemy operative is tracked (2VP if turning point 4).',
      'Score 2VP if two or more enemy operatives are being tracked.',
      'Maximum 2VP per turning point.',
    ],
  },
  {
    id: 'steal-intelligence',
    name: 'Steal Intelligence',
    archetype: 'Infiltration',
    reveal_condition: 'The first time an enemy operative is incapacitated.',
    description:
      'Collect Intelligence markers from incapacitated enemies and carry them to score VP.',
    additional_rules: [
      'When an enemy operative is incapacitated, place an Intelligence marker within its control range before it is removed.',
      'Friendly operatives can carry up to two Intelligence markers (one ignores the condition of the Pick Up action).',
    ],
    victory_points: [
      'At the end of each turning point after the first: Score 1VP if friendly operatives are carrying any Intelligence markers.',
      'At the end of the battle: Score 1VP for each Intelligence marker friendly operatives are carrying.',
    ],
  },
  {
    id: 'plant-devices',
    name: 'Plant Devices',
    archetype: 'Infiltration',
    reveal_condition:
      'First time a friendly operative performs the Plant Device action.',
    description:
      'Plant Device tokens on objective markers, including enemy-contested ones, to score VP.',
    mission_actions: [
      {
        name: 'Plant Device',
        ap_cost: 1,
        description:
          'One objective marker the active operative controls gains a friendly Device token.',
        restrictions:
          'Cannot perform during the first turning point, while within control range of an enemy operative, or if that marker already has your Device token.',
      },
    ],
    victory_points: [
      "At the end of each turning point after the first: Score 1VP if your opponent's objective marker has your Device token.",
      'Score 1VP for each other objective marker the enemy contests that has your Device token.',
      'Maximum 2VP per turning point.',
    ],
  },
  // ── Security ──────────────────────────────────────────────────────────
  {
    id: 'plant-banner',
    name: 'Plant Banner',
    archetype: 'Security',
    reveal_condition: 'When you perform the Plant Banner action.',
    description:
      'Plant your Banner in enemy territory and hold it to score up to 2VP per turning point.',
    mission_actions: [
      {
        name: 'Plant Banner',
        ap_cost: 1,
        description:
          "Place a Banner marker within the active operative's control range, wholly within the opponent's territory and more than 5\" from a neutral killzone edge.",
        restrictions:
          'Cannot perform during the first turning point, while within control range of an enemy operative, or if a friendly operative has already performed this action this battle.',
      },
    ],
    victory_points: [
      "At the end of each turning point after the first: Score 1VP if the Banner is in the opponent's territory and controlled by friendly operatives.",
      'Score 2VP instead if the above is true and no enemy operatives contest the Banner.',
      'The Banner must be in the killzone (not carried) to score.',
    ],
  },
  {
    id: 'martyrs',
    name: 'Martyrs',
    archetype: 'Security',
    reveal_condition:
      'First time a friendly operative is incapacitated while contesting an objective marker.',
    description:
      'Sacrifice operatives on objectives to generate Martyr tokens worth VP when removed.',
    additional_rules: [
      'When a friendly operative is incapacitated while contesting an objective marker, add a Martyr token to that marker.',
      'Tokens are only generated the first time each specific operative is incapacitated.',
    ],
    victory_points: [
      'At the end of each turning point after the first: Remove Martyr tokens from objective markers friendly operatives contest; score 1VP per token removed.',
      'Score 2VP per token instead if friendly operatives also control that marker.',
      'Maximum 2VP per turning point.',
    ],
  },
  {
    id: 'envoy',
    name: 'Envoy',
    archetype: 'Security',
    reveal_condition: 'First time you select an envoy.',
    description:
      'Designate an envoy each turning point to score VP for reaching enemy territory unharmed.',
    additional_rules: [
      'Strategic Gambit (TP 2+): Select one friendly operative to be the envoy (cannot be the same operative twice or an operative ignored for kill op scoring).',
      'Envoy status lasts until the Ready step of the next Strategy phase.',
    ],
    victory_points: [
      'At the end of each turning point after the first: Score 1VP if the envoy is in enemy territory and not within enemy control range.',
      'Score 2VP instead if the above is true AND the envoy has not lost any wounds during that turning point.',
    ],
  },
  // ── Seek & Destroy ────────────────────────────────────────────────────
  {
    id: 'sweep-and-clear',
    name: 'Sweep & Clear',
    archetype: 'Seek & Destroy',
    reveal_condition:
      'First enemy incapacitated on an objective marker OR first time a friendly operative performs the Clear action.',
    description:
      'Incapacitate enemies on objectives and Clear markers to score up to 2VP per turning point.',
    mission_actions: [
      {
        name: 'Clear',
        ap_cost: 1,
        description:
          'One objective marker the active operative controls is cleared for this turning point.',
        restrictions:
          'Cannot perform during the first turning point or while within control range of an enemy operative.',
      },
    ],
    additional_rules: [
      'When an enemy operative is incapacitated while contesting an objective marker, add a Swept token to that marker until the Ready step of the next Strategy phase.',
    ],
    victory_points: [
      'At the end of each turning point after the first: Score 1VP if friendly operatives control an objective marker with your Swept token.',
      'Score 2VP instead if the above is true AND the marker is also cleared.',
      'Maximum 2VP per turning point.',
    ],
  },
  {
    id: 'route',
    name: 'Route',
    archetype: 'Seek & Destroy',
    reveal_condition: 'First time you score VP from this Tac Op.',
    description:
      "Incapacitate enemies near the opponent's drop zone to score VP, with a bonus for high-Wounds targets.",
    victory_points: [
      'Whenever a friendly operative incapacitates an enemy: Score 1VP if the friendly operative is within 6" of the opponent\'s drop zone.',
      'Score 2VP instead if the above is true AND the incapacitated operative had a Wounds stat of 12 or more.',
      'Maximum 2VP per turning point.',
    ],
  },
  {
    id: 'dominate',
    name: 'Dominate',
    archetype: 'Seek & Destroy',
    reveal_condition:
      'First time an enemy operative is incapacitated by a friendly operative.',
    description:
      'Earn Dominate tokens for each kill; cash them in at the end of TPs 3 and 4 for up to 3VP.',
    additional_rules: [
      'Friendly operatives gain 1 Dominate token each time they incapacitate an enemy operative.',
    ],
    victory_points: [
      'At the end of turning points 3 and 4: Score 1VP for each Dominate token removed from friendly operatives that are not incapacitated.',
      'Maximum 3VP per turning point.',
    ],
  },
  {
    id: 'custom',
    name: 'Custom / Other',
    description: '',
  },
];
