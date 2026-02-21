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

  // Check leader count
  const leaderCount = selectedOperatives.filter((op) =>
    op.type.toLowerCase().includes('leader')
  ).length;

  if (faction.restrictions.composition?.selection_limits?.leader_count) {
    const requiredLeaders =
      faction.restrictions.composition.selection_limits.leader_count;
    if (leaderCount !== requiredLeaders) {
      errors.push(`Team must have exactly ${requiredLeaders} leader operative`);
    }
  }

  // Check for duplicate unique operatives (except those allowed)
  const operativeCounts = new Map<string, number>();
  selectedOperatives.forEach((op) => {
    operativeCounts.set(op.id, (operativeCounts.get(op.id) || 0) + 1);
  });

  // Find operatives that can be taken multiple times
  const allowedDuplicateKeywords =
    faction.restrictions.composition?.selection_limits?.exception
      ?.toLowerCase()
      .split(',')
      .map((k) => k.trim()) || [];

  operativeCounts.forEach((count, operativeId) => {
    if (count > 1) {
      const operative = selectedOperatives.find((op) => op.id === operativeId);
      if (operative) {
        // Check if this operative is allowed to be taken multiple times
        const hasAllowedKeyword = operative.keywords?.some((keyword) =>
          allowedDuplicateKeywords.some((allowed) =>
            keyword.toLowerCase().includes(allowed)
          )
        );

        if (!hasAllowedKeyword) {
          errors.push(
            `Cannot have multiple ${operative.name} operatives. Each unique operative can only be taken once.`
          );
        }
      }
    }
  });

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
 * This performs pre-add validation to prevent invalid selections
 */
export function canAddOperative(
  faction: Faction,
  currentTeam: Operative[],
  operative: Operative
): { canAdd: boolean; reason?: string } {
  // Check if team is already at max capacity
  if (
    faction.restrictions.maxOperatives &&
    currentTeam.length >= faction.restrictions.maxOperatives
  ) {
    return {
      canAdd: false,
      reason: `Team is at maximum capacity (${faction.restrictions.maxOperatives} operatives)`,
    };
  }

  // Check leader constraint
  const isLeader = operative.type.toLowerCase().includes('leader');
  const currentLeaderCount = currentTeam.filter((op) =>
    op.type.toLowerCase().includes('leader')
  ).length;

  if (
    isLeader &&
    faction.restrictions.composition?.selection_limits?.leader_count
  ) {
    const maxLeaders =
      faction.restrictions.composition.selection_limits.leader_count;
    if (currentLeaderCount >= maxLeaders) {
      return {
        canAdd: false,
        reason: `Can only have ${maxLeaders} leader operative in team`,
      };
    }
  }

  // Check if this exact operative is already in the team
  const existingCount = currentTeam.filter(
    (op) => op.id === operative.id
  ).length;

  if (existingCount > 0) {
    // Check if this operative can be taken multiple times
    const allowedDuplicateKeywords =
      faction.restrictions.composition?.selection_limits?.exception
        ?.toLowerCase()
        .split(',')
        .map((k) => k.trim()) || [];

    const hasAllowedKeyword = operative.keywords?.some((keyword) =>
      allowedDuplicateKeywords.some((allowed) =>
        keyword.toLowerCase().includes(allowed)
      )
    );

    if (!hasAllowedKeyword) {
      return {
        canAdd: false,
        reason: `${operative.name} is already in the team. Each unique operative can only be taken once.`,
      };
    }
  }

  return { canAdd: true };
}
