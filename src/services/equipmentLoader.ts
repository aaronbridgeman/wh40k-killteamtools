/**
 * Service for loading and managing equipment data
 */

import { Equipment } from '@/types';
import universalEquipmentData from '@/data/equipment/universal.json';

/**
 * Load universal equipment
 */
export function loadUniversalEquipment(): Equipment[] {
  return universalEquipmentData as Equipment[];
}

/**
 * Get all equipment for a faction (universal + faction-specific)
 */
export function getAllEquipmentForFaction(
  universalEquipment: Equipment[],
  factionEquipment?: Equipment[]
): Equipment[] {
  return [...universalEquipment, ...(factionEquipment || [])];
}

/**
 * Filter equipment by keywords (for faction-specific equipment)
 */
export function filterEquipmentByKeywords(
  equipment: Equipment[],
  keywords: string[]
): Equipment[] {
  return equipment.filter((eq) => {
    // If equipment has no keyword restrictions, include it
    if (!eq.restrictedToKeywords || eq.restrictedToKeywords.length === 0) {
      return true;
    }
    // Check if any of the operative's keywords match the equipment requirements
    return eq.restrictedToKeywords.some((requiredKeyword) =>
      keywords.includes(requiredKeyword)
    );
  });
}

/**
 * Validate equipment data structure
 */
export function validateEquipment(equipment: unknown): equipment is Equipment {
  if (!equipment || typeof equipment !== 'object') {
    return false;
  }

  const eq = equipment as Partial<Equipment>;

  return !!(
    eq.id &&
    eq.name &&
    eq.category &&
    eq.description &&
    (eq.category === 'universal' || eq.category === 'faction')
  );
}
