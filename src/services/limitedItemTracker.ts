/**
 * Service for managing limited item usage tracking
 */

import { LimitedItemUsage } from '@/types/game';
import { WeaponProfile } from '@/types/weapon';

/**
 * Check if a weapon profile has a Limited rule
 */
export function hasLimitedRule(profile: WeaponProfile): boolean {
  return profile.specialRules.some(
    (rule) => rule.name === 'Limited' || rule.name.startsWith('Limited')
  );
}

/**
 * Extract the limited value from a weapon profile
 */
export function getLimitedValue(profile: WeaponProfile): number | null {
  const limitedRule = profile.specialRules.find(
    (rule) => rule.name === 'Limited' || rule.name.startsWith('Limited')
  );

  if (!limitedRule) {
    return null;
  }

  // If value is a number, use it
  if (typeof limitedRule.value === 'number') {
    return limitedRule.value;
  }

  // If value is a string, try to parse it
  if (typeof limitedRule.value === 'string') {
    const parsed = parseInt(limitedRule.value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  // Default to 1 if no value specified
  return 1;
}

/**
 * Create an item key for tracking
 */
export function createItemKey(
  selectionId: string,
  weaponId: string,
  profileIndex?: number
): string {
  if (profileIndex !== undefined) {
    return `${selectionId}:${weaponId}:${profileIndex}`;
  }
  return `${selectionId}:${weaponId}`;
}

/**
 * Get or initialize limited item usage
 */
export function getOrInitializeLimitedItem(
  existingItems: LimitedItemUsage[],
  itemKey: string,
  maxUses: number
): LimitedItemUsage {
  const existing = existingItems.find((item) => item.itemKey === itemKey);
  if (existing) {
    return existing;
  }

  return {
    itemKey,
    maxUses,
    usesRemaining: maxUses,
  };
}

/**
 * Update limited item usage by using one charge
 */
export function decrementLimitedItemUse(
  existingItems: LimitedItemUsage[],
  itemKey: string
): LimitedItemUsage[] {
  return existingItems.map((item) => {
    if (item.itemKey === itemKey && item.usesRemaining > 0) {
      return {
        ...item,
        usesRemaining: item.usesRemaining - 1,
      };
    }
    return item;
  });
}

/**
 * Reset all limited items to full uses
 */
export function resetAllLimitedItems(
  items: LimitedItemUsage[]
): LimitedItemUsage[] {
  return items.map((item) => ({
    ...item,
    usesRemaining: item.maxUses,
  }));
}
