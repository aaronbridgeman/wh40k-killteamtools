/**
 * Service for resolving weapon options from operative configurations
 */

import { Operative } from '@/types';

export interface WeaponSlot {
  slotId: string;
  label: string;
  options: string[];
  defaultSelection?: string;
}

export interface WeaponLoadout {
  slots: WeaponSlot[];
  fixedWeapons: string[];
  alternativeLoadouts?: Array<{ fixed: string[] }>;
}

/**
 * Extract weapon slots from weapon_options
 */
export function resolveWeaponLoadout(operative: Operative): WeaponLoadout {
  const loadout: WeaponLoadout = {
    slots: [],
    fixedWeapons: [],
  };

  // Handle legacy weapons array (backward compatibility)
  if (operative.weapons && operative.weapons.length > 0) {
    loadout.fixedWeapons = [...operative.weapons];
    return loadout;
  }

  // Handle fixed_loadout
  if (operative.fixed_loadout && operative.fixed_loadout.length > 0) {
    loadout.fixedWeapons = [...operative.fixed_loadout];
    return loadout;
  }

  // Handle weapon_options
  if (!operative.weapon_options) {
    return loadout;
  }

  const options = operative.weapon_options;

  // Process standard_loadout_groups
  if (options.standard_loadout_groups) {
    for (const group of options.standard_loadout_groups) {
      for (const [key, value] of Object.entries(group)) {
        if (Array.isArray(value) && value.length > 0) {
          loadout.slots.push({
            slotId: key,
            label: formatSlotLabel(key),
            options: value,
            defaultSelection: value[0],
          });
        } else if (typeof value === 'string') {
          // Single fixed weapon in the group
          loadout.fixedWeapons.push(value);
        }
      }
    }
  }

  // Process direct slot definitions (e.g., slot_1_pistol: [...])
  for (const [key, value] of Object.entries(options)) {
    // Skip known structural properties
    if (
      key === 'standard_loadout_groups' ||
      key === 'alternative_loadouts' ||
      key === 'fixed_secondary' ||
      key === 'ammo_profiles' ||
      key === 'firing_profiles'
    ) {
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      // Check if it's a weapon array or special profiles
      if (typeof value[0] === 'string') {
        const weaponArray = value as string[];
        // Single-option arrays are treated as fixed weapons
        if (weaponArray.length === 1) {
          loadout.fixedWeapons.push(weaponArray[0]);
        } else {
          loadout.slots.push({
            slotId: key,
            label: formatSlotLabel(key),
            options: weaponArray,
            defaultSelection: weaponArray[0],
          });
        }
      }
    } else if (typeof value === 'string') {
      // Single fixed weapon
      loadout.fixedWeapons.push(value);
    }
  }

  // Process fixed_secondary
  if (options.fixed_secondary) {
    loadout.fixedWeapons.push(options.fixed_secondary);
  }

  // Store alternative loadouts if they exist
  if (options.alternative_loadouts) {
    loadout.alternativeLoadouts = options.alternative_loadouts;
  }

  return loadout;
}

/**
 * Format slot key into a readable label
 * e.g., "slot_1_pistol" -> "Pistol"
 * e.g., "slot_2_melee" -> "Melee"
 */
function formatSlotLabel(slotKey: string): string {
  // Remove "slot_X_" prefix if present
  const withoutSlot = slotKey.replace(/^slot_\d+_/, '');

  // Handle special cases
  const specialLabels: Record<string, string> = {
    pistol: 'Pistol',
    melee: 'Melee Weapon',
    rifle: 'Rifle',
    heavy: 'Heavy Weapon',
    special: 'Special Weapon',
    ammo_profiles: 'Ammunition Type',
    firing_profiles: 'Firing Mode',
  };

  if (specialLabels[withoutSlot]) {
    return specialLabels[withoutSlot];
  }

  // Capitalize first letter and replace underscores with spaces
  return withoutSlot
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get default weapon selections for an operative
 */
export function getDefaultWeaponSelection(operative: Operative): string[] {
  const loadout = resolveWeaponLoadout(operative);
  const weapons: string[] = [...loadout.fixedWeapons];

  // Add default from each slot
  for (const slot of loadout.slots) {
    if (slot.defaultSelection) {
      weapons.push(slot.defaultSelection);
    }
  }

  return weapons;
}

/**
 * Validate that selected weapons are valid for the operative
 */
export function validateWeaponSelection(
  operative: Operative,
  selectedWeapons: string[]
): boolean {
  const loadout = resolveWeaponLoadout(operative);

  // If no weapon options, any selection is invalid
  if (loadout.slots.length === 0 && loadout.fixedWeapons.length === 0) {
    return selectedWeapons.length === 0;
  }

  // All fixed weapons must be present
  for (const fixed of loadout.fixedWeapons) {
    if (!selectedWeapons.includes(fixed)) {
      return false;
    }
  }

  // For each slot, exactly one option must be selected
  for (const slot of loadout.slots) {
    const selectedFromSlot = selectedWeapons.filter((w) =>
      slot.options.includes(w)
    );
    if (selectedFromSlot.length !== 1) {
      return false;
    }
  }

  return true;
}
