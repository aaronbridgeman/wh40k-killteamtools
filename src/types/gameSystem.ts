/**
 * Type definitions for supported tabletop game systems.
 */

export type GameSystemStatus = 'active' | 'scaffolded';

export interface GameSystemReferenceSource {
  /** Unique identifier for the source item */
  id: string;
  /** Human-readable source name */
  name: string;
  /** Short note about what this source contains */
  description: string;
  /** Repository path where this source lives */
  path: string;
}

export interface GameSystemConfig {
  /** Unique game-system identifier */
  id: string;
  /** Display name shown in the UI */
  name: string;
  /** Short description for UI and docs */
  description: string;
  /** Current integration state in this app */
  status: GameSystemStatus;
  /** Config/reference-data sources for this game system */
  referenceSources: GameSystemReferenceSource[];
}
