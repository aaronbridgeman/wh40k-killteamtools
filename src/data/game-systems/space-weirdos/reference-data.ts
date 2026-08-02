/**
 * Scaffold reference dataset for Space Weirdos.
 * Expand this as official app support is implemented.
 */
export interface SpaceWeirdosReferenceData {
  factions: Array<{ id: string; name: string }>;
  weaponTraits: Array<{ id: string; name: string; description: string }>;
  scenarios: Array<{ id: string; name: string }>;
}

export const spaceWeirdosReferenceData: SpaceWeirdosReferenceData = {
  factions: [],
  weaponTraits: [],
  scenarios: [],
};
