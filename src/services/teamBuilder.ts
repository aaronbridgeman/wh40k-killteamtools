/**
 * Service for team building logic (future iterations)
 */

import { Operative, Faction } from '@/types';

/**
 * Validate team composition against faction restrictions
 */
export function validateTeamComposition(
  faction: Faction,
  selectedOperatives: Operative[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check max operatives
  if (
    faction.restrictions.maxOperatives &&
    selectedOperatives.length > faction.restrictions.maxOperatives
  ) {
    errors.push(
      `Too many operatives. Maximum is ${faction.restrictions.maxOperatives}`
    );
  }

  // Check min operatives
  if (
    faction.restrictions.minOperatives &&
    selectedOperatives.length < faction.restrictions.minOperatives
  ) {
    errors.push(
      `Not enough operatives. Minimum is ${faction.restrictions.minOperatives}`
    );
  }

  // Additional validation can be added here

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate total team cost
 */
export function calculateTeamCost(operatives: Operative[]): number {
  return operatives.reduce((total, op) => total + (op.cost || 0), 0);
}

/**
 * Check if an operative can be added to the team
 */
export function canAddOperative(
  faction: Faction,
  currentTeam: Operative[],
  operative: Operative
): boolean {
  const newTeam = [...currentTeam, operative];
  const validation = validateTeamComposition(faction, newTeam);
  return validation.valid;
}
