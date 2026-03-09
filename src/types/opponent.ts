/**
 * Type definitions for opponent kill teams and matchup strategy tips
 */

/** Tier rating for a kill team in competitive play */
export type KillTeamTier = 'S' | 'A' | 'B' | 'C';

/** Category used to look up matchup tips */
export type TipsCategory =
  | 'elite_marines_and_chaos'
  | 'horde_teams'
  | 'shooty_teams_with_good_range'
  | 'melee_heavy_teams'
  | 'elite_shooting_teams'
  | 'sneaky_and_infiltration_teams';

/**
 * Reference data for an opponent kill team
 */
export interface OpponentKillTeam {
  /** Unique identifier (slug) */
  id: string;
  /** Display name */
  name: string;
  /** Faction the kill team belongs to */
  faction: string;
  /** Standard operative count for this kill team, or null if variable/unknown */
  model_count: number | null;
  /** Playstyle archetype */
  archetype: string;
  /** Competitive tier rating, or null if unrated */
  tier: KillTeamTier | null;
  /** Tips category used to look up matchup advice */
  tips_category: TipsCategory;
  /** Opponent-specific tips for Plague Marines players */
  specific_tips: string[];
}

/**
 * A single strategy tip with supporting detail
 */
export interface StrategyTip {
  /** Short tip headline */
  tip: string;
  /** Extended explanation */
  detail: string;
}

/**
 * Matchup tips for Plague Marines vs a given tips category
 */
export type MatchupTipsByCategory = Record<TipsCategory, StrategyTip[]>;

/**
 * Full matchup tips data structure for the Plague Marines faction
 */
export interface PlagueMarinesMatchupTips {
  /** General tips applicable in every game */
  team_wide_tips: StrategyTip[];
  /** Tips keyed by opponent archetype category */
  matchup_tips: MatchupTipsByCategory;
  /** Tips for specific operative roles */
  operative_role_tips: Record<string, StrategyTip[]>;
}
