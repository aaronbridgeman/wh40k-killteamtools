/**
 * Core type definitions for abilities
 */

export type AbilityType = 'action' | 'passive' | 'unique';

export interface Ability {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Ability type */
  type: AbilityType;
  /** Action Point cost if applicable (e.g., "1AP", "2AP") */
  cost?: string;
  /** Full ability description */
  description: string;
  /** Usage restrictions */
  restrictions?: string[];
}
