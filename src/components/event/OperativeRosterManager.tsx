/**
 * OperativeRosterManager — displays all 7 Plague Marines operatives
 * and allows the player to remove exactly one non-leader for the game.
 *
 * Reuses the existing OperativeCard component for each operative's display.
 * When Blight Grenades are selected, injects a modified grenade weapon
 * (ballisticSkill 3+ instead of 4+) into the Bombardier's OperativeCard.
 */

import { useMemo } from 'react';
import { Faction, Weapon, Operative } from '@/types';
import { OperativeCard } from '@/components/datacard/OperativeCard';
import { QUICK_PLAY_DEFAULTS } from '@/constants';
import './OperativeRosterManager.css';

interface OperativeRosterManagerProps {
  /** Loaded Plague Marines faction data */
  faction: Faction;
  /** ID of the currently removed operative, or null */
  removedOperativeId: string | null;
  /** Currently selected equipment IDs — used to determine Bombardier grenade augmentation */
  selectedEquipmentIds: string[];
  /** Called when the player removes or restores an operative */
  onRosterChange: (removedOperativeId: string | null) => void;
}

/**
 * Builds a synthetic Weapon object for the Bombardier's Blight Grenades
 * with the Hit stat improved by 1 (4+ → 3+) per the Grenadier ability.
 *
 * This weapon is injected into the weapons array passed to OperativeCard
 * so the card renders the grenade profile with the correct stats.
 */
function buildGrenadierWeapon(faction: Faction): Weapon {
  // Find the Blight Grenades equipment to extract its weapon profile
  const grenadeEquipment = faction.equipment?.find(
    (e) => e.id === QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID
  );

  // Use the equipment's weapon profile if available, else sensible defaults
  const baseProfile = (
    grenadeEquipment as unknown as {
      weaponProfile?: {
        attacks?: number;
        ballisticSkill?: number;
        damage?: number;
        criticalDamage?: number;
      };
    }
  )?.weaponProfile;

  return {
    id: QUICK_PLAY_DEFAULTS.GRENADIER_WEAPON_ID,
    name: 'Blight Grenades (Grenadier)',
    type: 'ranged',
    description:
      'Grenadier: +1 Hit stat (4+ → 3+). Uses do not count towards the 2-use battle limit. Gains Toxic rule.',
    profiles: [
      {
        attacks: baseProfile?.attacks ?? 4,
        ballisticSkill: Math.max(1, (baseProfile?.ballisticSkill ?? 4) - 1), // Improved by 1
        damage: baseProfile?.damage ?? 2,
        criticalDamage: baseProfile?.criticalDamage ?? 4,
        specialRules: [
          {
            name: 'Blast',
            value: '2"',
            description: 'Hit additional operatives within 2" of the target.',
          },
          {
            name: 'Saturate',
            description: 'Re-roll attack dice results of 1.',
          },
          {
            name: 'Severe',
            description: 'Dice results of 4+ that hit are critical hits.',
          },
          {
            name: 'Poison',
            description:
              'Subtract 1 from the Defence characteristic of the target.',
          },
          {
            name: 'Toxic',
            description:
              'Grenadier ability: Blight Grenades gain Toxic when used by the Bombardier.',
          },
        ],
      },
    ],
  };
}

/**
 * Returns the weapon IDs for the Bombardier including the grenadier weapon.
 * Used as selectedWeaponIds so OperativeCard shows exactly these weapons.
 */
function getBombardierWeaponIds(faction: Faction): string[] {
  // Bombardier fixed_loadout: ['Boltgun', 'Fists']
  const bombardier = faction.operatives.find(
    (op) => op.id === QUICK_PLAY_DEFAULTS.BOMBARDIER_ID
  );
  if (!bombardier) return [QUICK_PLAY_DEFAULTS.GRENADIER_WEAPON_ID];

  const loadoutNames: string[] =
    (bombardier as Operative & { fixed_loadout?: string[] }).fixed_loadout ??
    [];
  const weaponIds = faction.weapons
    .filter((w) => loadoutNames.includes(w.name))
    .map((w) => w.id);
  return [...weaponIds, QUICK_PLAY_DEFAULTS.GRENADIER_WEAPON_ID];
}

/**
 * Shows all 7 operatives with remove/restore controls.
 * The Leader (Champion) cannot be removed.
 * Only one non-leader may be removed per game.
 */
export function OperativeRosterManager({
  faction,
  removedOperativeId,
  selectedEquipmentIds,
  onRosterChange,
}: OperativeRosterManagerProps) {
  const blightGrenadesSelected = selectedEquipmentIds.includes(
    QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID
  );

  // Build the grenadier weapon and augmented weapon list once when grenades are selected
  const grenadierWeapon = useMemo(
    () => (blightGrenadesSelected ? buildGrenadierWeapon(faction) : null),
    [blightGrenadesSelected, faction]
  );

  const augmentedWeapons = useMemo(
    () =>
      grenadierWeapon ? [...faction.weapons, grenadierWeapon] : faction.weapons,
    [faction.weapons, grenadierWeapon]
  );

  const bombardierWeaponIds = useMemo(
    () =>
      blightGrenadesSelected ? getBombardierWeaponIds(faction) : undefined,
    [blightGrenadesSelected, faction]
  );

  const handleToggle = (operative: Operative) => {
    if (operative.type === 'Leader') return; // Cannot remove the Leader

    if (removedOperativeId === operative.id) {
      // Restore this operative
      onRosterChange(null);
    } else if (removedOperativeId === null) {
      // Remove this operative (only one removal allowed)
      onRosterChange(operative.id);
    }
    // If a different operative is already removed, do nothing (handled by disabled state)
  };

  const activeCount = faction.operatives.length - (removedOperativeId ? 1 : 0);

  return (
    <div className="roster-manager">
      <p className="roster-intro">
        Select one non-leader operative to remove from this game. The remaining{' '}
        <strong>{activeCount}</strong> operatives will field this game.
      </p>

      {faction.operatives.map((operative) => {
        const isLeader = operative.type === 'Leader';
        const isRemoved = operative.id === removedOperativeId;
        const isBombardier = operative.id === QUICK_PLAY_DEFAULTS.BOMBARDIER_ID;
        const anotherRemoved =
          !isRemoved && removedOperativeId !== null && !isLeader;

        // For the Bombardier with grenades selected, use the augmented weapons list
        const weaponsForCard = isBombardier
          ? augmentedWeapons
          : faction.weapons;
        const selectedWeaponIdsForCard =
          isBombardier && blightGrenadesSelected
            ? bombardierWeaponIds
            : undefined;

        return (
          <div
            key={operative.id}
            className={`operative-slot ${isRemoved ? 'removed' : ''}`}
          >
            <OperativeCard
              operative={operative}
              weapons={weaponsForCard}
              selectedWeaponIds={selectedWeaponIdsForCard}
              abilities={faction.abilities}
              uniqueActions={faction.unique_actions}
            />

            <div className="operative-slot-footer">
              {isLeader ? (
                <span className="leader-badge">
                  👑 Leader — cannot be removed
                </span>
              ) : (
                <>
                  {isRemoved && <span className="removed-label">REMOVED</span>}
                  <button
                    className={`roster-toggle-button ${isRemoved ? 'restore' : 'remove'}`}
                    onClick={() => handleToggle(operative)}
                    disabled={anotherRemoved}
                    aria-label={
                      isRemoved
                        ? `Restore ${operative.name} to the roster`
                        : `Remove ${operative.name} from this game`
                    }
                    title={
                      anotherRemoved
                        ? 'Another operative is already removed'
                        : undefined
                    }
                  >
                    {isRemoved ? '↩ Restore' : '✕ Remove from Game'}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}

      <p className="roster-summary">
        Active operatives: <strong>{activeCount}</strong> /{' '}
        {faction.operatives.length} (Nurgle&apos;s 7)
        {removedOperativeId && (
          <>
            {' '}
            — Removed:{' '}
            <strong>
              {
                faction.operatives.find((o) => o.id === removedOperativeId)
                  ?.name
              }
            </strong>
          </>
        )}
      </p>
    </div>
  );
}
