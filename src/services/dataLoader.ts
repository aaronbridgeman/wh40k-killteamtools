/**
 * Service for loading and validating faction data
 */

import { Faction } from '@/types';

/**
 * Available faction IDs
 */
export const AVAILABLE_FACTIONS = [
  'angels-of-death',
  'plague-marines',
] as const;

export type FactionId = (typeof AVAILABLE_FACTIONS)[number];

/**
 * Load faction data by ID
 */
export async function loadFaction(factionId: FactionId): Promise<Faction> {
  try {
    const factionModule = await import(
      `@/data/factions/${factionId}/faction.json`
    );
    return factionModule.default as Faction;
  } catch (error) {
    throw new Error(`Failed to load faction: ${factionId}`, { cause: error });
  }
}

/**
 * Load all available factions
 */
export async function loadAllFactions(): Promise<Faction[]> {
  const factions = await Promise.all(
    AVAILABLE_FACTIONS.map((id) => loadFaction(id))
  );
  return factions;
}

/**
 * Get list of available faction IDs and names
 */
export async function getFactionList(): Promise<
  Array<{ id: FactionId; name: string }>
> {
  const factions = await loadAllFactions();
  return factions.map((f) => ({ id: f.id as FactionId, name: f.name }));
}

/**
 * Validate faction data structure
 */
export function validateFaction(faction: unknown): faction is Faction {
  if (!faction || typeof faction !== 'object') {
    return false;
  }

  const f = faction as Partial<Faction>;

  return !!(
    f.id &&
    f.name &&
    f.description &&
    Array.isArray(f.rules) &&
    Array.isArray(f.operatives) &&
    Array.isArray(f.weapons) &&
    Array.isArray(f.abilities) &&
    f.restrictions &&
    f.metadata
  );
}
