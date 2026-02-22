/**
 * Utility functions for calculating injured status
 */

/**
 * Determines if an operative should be injured based on their current and max wounds.
 * An operative is injured when current wounds are fewer than half of starting wounds.
 *
 * @param currentWounds - Current wounds remaining
 * @param maxWounds - Maximum/starting wounds
 * @returns true if the operative should be injured
 */
export function shouldBeInjured(
  currentWounds: number,
  maxWounds: number
): boolean {
  return currentWounds < maxWounds / 2;
}

/**
 * Calculates the modified movement stat for an injured operative.
 * Injured operatives have 2" subtracted from their movement.
 *
 * @param baseMovement - Base movement stat
 * @param isInjured - Whether the operative is injured
 * @returns Modified movement stat (minimum 0)
 */
export function getModifiedMovement(
  baseMovement: number,
  isInjured: boolean
): number {
  if (!isInjured) return baseMovement;
  return Math.max(0, baseMovement - 2);
}

/**
 * Calculates the modified hit stat (BS/WS) for an injured operative.
 * Injured operatives have their hit stat worsened by 1 (e.g., 3+ becomes 4+).
 *
 * @param baseHit - Base hit stat (e.g., 3 for 3+)
 * @param isInjured - Whether the operative is injured
 * @returns Modified hit stat (maximum 6)
 */
export function getModifiedHitStat(
  baseHit: number,
  isInjured: boolean
): number {
  if (!isInjured) return baseHit;
  return Math.min(6, baseHit + 1);
}
