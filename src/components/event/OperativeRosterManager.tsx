/**
 * OperativeRosterManager — displays all 7 Plague Marines operatives
 * and allows the player to remove exactly one non-leader for the game.
 *
 * Reuses the existing OperativeCard component for each operative's display.
 * When Blight Grenades or Krak Grenades are selected, injects a modified
 * grenade weapon (ballisticSkill 3+ instead of 4+) into the Bombardier's
 * OperativeCard (Grenadier ability — unlimited use, improved hit stat).
 *
 * When Plague Rounds are selected, the Boltgun and Bolt pistol weapon
 * profiles are augmented with the Poison and Severe special rules.
 *
 * In play phase (onRosterChange omitted), shows a pill selector so the
 * player can view a single operative's card at a time.
 */

import { useMemo, useState } from 'react';
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
  /**
   * Called when the player removes or restores an operative.
   * Optional — omit when roster changes are disabled (e.g. during the play phase).
   */
  onRosterChange?: (removedOperativeId: string | null) => void;
  /** IDs of operatives currently marked as Incapacitated. Defaults to []. */
  incapacitatedOperativeIds?: string[];
  /** Called when an operative's incapacitated status is toggled. Defaults to no-op. */
  onIncapacitatedChange?: (incapacitatedOperativeIds: string[]) => void;
  /** IDs of operatives currently marked as Injured. Defaults to []. */
  injuredOperativeIds?: string[];
  /** Called when an operative's injured status is toggled. Defaults to no-op. */
  onInjuredChange?: (injuredOperativeIds: string[]) => void;
}

/** Shared profile type used for weapon profile extraction. */
interface WeaponProfileData {
  attacks?: number;
  ballisticSkill?: number;
  damage?: number;
  criticalDamage?: number;
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
    grenadeEquipment as unknown as { weaponProfile?: WeaponProfileData }
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
        ballisticSkill: Math.max(1, (baseProfile?.ballisticSkill ?? 4) - 1),
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
 * Builds a synthetic Weapon object for the Bombardier's Krak Grenades
 * with the Hit stat improved by 1 (4+ → 3+) per the Grenadier ability.
 * Uses do not count toward any use limit.
 */
function buildKrakGrenadierWeapon(
  universalWeaponProfile: WeaponProfileData | undefined
): Weapon {
  return {
    id: QUICK_PLAY_DEFAULTS.KRAK_GRENADIER_WEAPON_ID,
    name: 'Krak Grenades (Grenadier)',
    type: 'ranged',
    description:
      'Grenadier: +1 Hit stat (4+ → 3+). Uses do not count towards any use limit.',
    profiles: [
      {
        attacks: universalWeaponProfile?.attacks ?? 4,
        ballisticSkill: Math.max(
          1,
          (universalWeaponProfile?.ballisticSkill ?? 4) - 1
        ),
        damage: universalWeaponProfile?.damage ?? 4,
        criticalDamage: universalWeaponProfile?.criticalDamage ?? 5,
        specialRules: [
          {
            name: 'Piercing',
            value: 1,
            description:
              'The target cannot retain any normal saves as successful defence dice.',
          },
          {
            name: 'Saturate',
            description: 'Re-roll attack dice results of 1.',
          },
        ],
      },
    ],
  };
}

/**
 * Shows all 7 operatives with remove/restore controls.
 * The Leader (Champion) cannot be removed.
 * Only one non-leader may be removed per game.
 *
 * In play phase (onRosterChange not provided), shows pill buttons so the
 * player can select one operative and see only that card.
 */
export function OperativeRosterManager({
  faction,
  removedOperativeId,
  selectedEquipmentIds,
  onRosterChange,
  incapacitatedOperativeIds = [],
  onIncapacitatedChange = () => {},
  injuredOperativeIds = [],
  onInjuredChange = () => {},
}: OperativeRosterManagerProps) {
  const isPlayPhase = !onRosterChange;

  // Play-phase: which operative's card is focused (null = show all).
  // Defaults to the Leader (Champion) so only one card is shown on load.
  const [focusedOperativeId, setFocusedOperativeId] = useState<string | null>(
    () => faction.operatives.find((op) => op.type === 'Leader')?.id ?? null
  );

  const blightGrenadesSelected = selectedEquipmentIds.includes(
    QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID
  );
  const krakGrenadesSelected = selectedEquipmentIds.includes(
    QUICK_PLAY_DEFAULTS.KRAK_GRENADES_ID
  );

  // Build the grenadier weapon(s) for the Bombardier
  const grenadierWeapon = useMemo(
    () => (blightGrenadesSelected ? buildGrenadierWeapon(faction) : null),
    [blightGrenadesSelected, faction]
  );

  const krakGrenadierWeapon = useMemo(() => {
    if (!krakGrenadesSelected) return null;
    // Krak profile comes from universal equipment data (passed via faction or universal list)
    // We use the defaults from the universal.json krak-grenades entry
    const profile: WeaponProfileData = {
      attacks: 4,
      ballisticSkill: 4,
      damage: 4,
      criticalDamage: 5,
    };
    return buildKrakGrenadierWeapon(profile);
  }, [krakGrenadesSelected]);

  const plagueRoundsSelected = selectedEquipmentIds.includes(
    QUICK_PLAY_DEFAULTS.PLAGUE_ROUNDS_ID
  );

  // When Plague Rounds are selected, augment Boltgun and Bolt pistol profiles
  // with the Poison and Severe weapon rules.
  const plagueRoundsWeapons = useMemo(() => {
    if (!plagueRoundsSelected) return null;
    const poisonRule = {
      name: 'Poison',
      description: 'Subtract 1 from the Defence characteristic of the target.',
    };
    const severeRule = {
      name: 'Severe',
      description: 'Dice results of 4+ that hit are critical hits.',
    };
    return faction.weapons.map((weapon) => {
      const lowerName = weapon.name.toLowerCase();
      if (lowerName !== 'boltgun' && lowerName !== 'bolt pistol') return weapon;
      return {
        ...weapon,
        profiles: weapon.profiles.map((profile) => {
          const existingNames = profile.specialRules.map((r) => r.name);
          const extraRules = [
            ...(existingNames.includes('Poison') ? [] : [poisonRule]),
            ...(existingNames.includes('Severe') ? [] : [severeRule]),
          ];
          return {
            ...profile,
            specialRules: [...profile.specialRules, ...extraRules],
          };
        }),
      };
    });
  }, [plagueRoundsSelected, faction.weapons]);

  const augmentedWeapons = useMemo(() => {
    // Start with plague rounds augmentations (if active), otherwise base weapons
    let weapons: Weapon[] = plagueRoundsWeapons ?? faction.weapons;
    if (grenadierWeapon) weapons = [...weapons, grenadierWeapon];
    if (krakGrenadierWeapon) weapons = [...weapons, krakGrenadierWeapon];
    return weapons;
  }, [
    faction.weapons,
    plagueRoundsWeapons,
    grenadierWeapon,
    krakGrenadierWeapon,
  ]);

  const bombardierWeaponIds = useMemo(() => {
    if (!blightGrenadesSelected && !krakGrenadesSelected) return undefined;
    const extras: string[] = [];
    if (blightGrenadesSelected)
      extras.push(QUICK_PLAY_DEFAULTS.GRENADIER_WEAPON_ID);
    if (krakGrenadesSelected)
      extras.push(QUICK_PLAY_DEFAULTS.KRAK_GRENADIER_WEAPON_ID);
    const bombardier = faction.operatives.find(
      (op) => op.id === QUICK_PLAY_DEFAULTS.BOMBARDIER_ID
    );
    if (!bombardier) return extras;
    const loadoutNames: string[] =
      (bombardier as Operative & { fixed_loadout?: string[] }).fixed_loadout ??
      [];
    const baseIds = faction.weapons
      .filter((w) => loadoutNames.includes(w.name))
      .map((w) => w.id);
    return [...baseIds, ...extras];
  }, [blightGrenadesSelected, krakGrenadesSelected, faction]);

  const handleToggle = (operative: Operative) => {
    if (operative.type === 'Leader') return;
    if (!onRosterChange) return;

    if (removedOperativeId === operative.id) {
      onRosterChange(null);
    } else if (removedOperativeId === null) {
      onRosterChange(operative.id);
    }
  };

  const handleIncapacitatedToggle = (operativeId: string) => {
    const isIncapacitated = incapacitatedOperativeIds.includes(operativeId);
    const updated = isIncapacitated
      ? incapacitatedOperativeIds.filter((id) => id !== operativeId)
      : [...incapacitatedOperativeIds, operativeId];
    onIncapacitatedChange(updated);
  };

  const handleInjuredToggle = (operativeId: string) => {
    const isInjured = injuredOperativeIds.includes(operativeId);
    const updated = isInjured
      ? injuredOperativeIds.filter((id) => id !== operativeId)
      : [...injuredOperativeIds, operativeId];
    onInjuredChange(updated);
  };

  const handleFocusPill = (operativeId: string) => {
    setFocusedOperativeId((prev) =>
      prev === operativeId ? null : operativeId
    );
  };

  const activeCount = faction.operatives.length - (removedOperativeId ? 1 : 0);

  // Operatives to render cards for (all, or just the focused one in play phase)
  const visibleOperatives =
    isPlayPhase && focusedOperativeId
      ? faction.operatives.filter((op) => op.id === focusedOperativeId)
      : faction.operatives;

  return (
    <div className="roster-manager">
      {/* Setup-phase intro */}
      {!isPlayPhase && (
        <p className="roster-intro">
          Select one non-leader operative to remove from this game. The
          remaining <strong>{activeCount}</strong> operatives will field this
          game.
        </p>
      )}

      {/* Play-phase: operative pill selector */}
      {isPlayPhase && (
        <div
          className="play-operative-pills"
          role="group"
          aria-label="Select operative to view"
        >
          <p className="play-pills-hint">
            Tap an operative to view their card:
          </p>
          <div className="operative-pills-row">
            {faction.operatives.map((operative) => {
              const isRemoved = operative.id === removedOperativeId;
              const isIncapacitated = incapacitatedOperativeIds.includes(
                operative.id
              );
              const isFocused = focusedOperativeId === operative.id;

              let pillClass = 'play-operative-pill';
              if (isRemoved) pillClass += ' removed';
              else if (isIncapacitated) pillClass += ' incapacitated';
              else if (isFocused) pillClass += ' focused';
              else pillClass += ' active';

              return (
                <button
                  key={operative.id}
                  type="button"
                  className={pillClass}
                  onClick={() => handleFocusPill(operative.id)}
                  aria-pressed={isFocused}
                  aria-label={
                    isRemoved
                      ? `${operative.name} — removed`
                      : isIncapacitated
                        ? `${operative.name} — incapacitated`
                        : isFocused
                          ? `Hide ${operative.name}'s card`
                          : `Show ${operative.name}'s card`
                  }
                >
                  {isFocused && (
                    <span className="pill-cross" aria-hidden="true">
                      ✕{' '}
                    </span>
                  )}
                  {operative.name}
                  {isRemoved && (
                    <span className="pill-removed" aria-hidden="true">
                      {' '}
                      ✕
                    </span>
                  )}
                  {isIncapacitated && !isRemoved && (
                    <span className="pill-incap" aria-hidden="true">
                      {' '}
                      💀
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {focusedOperativeId && (
            <p className="play-pills-selected-note">
              Showing:{' '}
              <strong>
                {
                  faction.operatives.find((o) => o.id === focusedOperativeId)
                    ?.name
                }
              </strong>{' '}
              — tap again to show all.
            </p>
          )}
        </div>
      )}

      {visibleOperatives.map((operative) => {
        const isLeader = operative.type === 'Leader';
        const isRemoved = operative.id === removedOperativeId;
        const isIncapacitated = incapacitatedOperativeIds.includes(
          operative.id
        );
        const isBombardier = operative.id === QUICK_PLAY_DEFAULTS.BOMBARDIER_ID;
        const anotherRemoved =
          !isRemoved && removedOperativeId !== null && !isLeader;

        const hasGrenadeAugment =
          isBombardier && (blightGrenadesSelected || krakGrenadesSelected);
        // Always pass augmentedWeapons so Plague Rounds augmentations apply to
        // all operatives; for the Bombardier with grenades, also add grenade IDs.
        const weaponsForCard = augmentedWeapons;
        const selectedWeaponIdsForCard = hasGrenadeAugment
          ? bombardierWeaponIds
          : undefined;

        return (
          <div
            key={operative.id}
            className={`operative-slot ${isRemoved ? 'removed' : ''} ${isIncapacitated ? 'incapacitated' : ''}`}
          >
            <OperativeCard
              operative={operative}
              weapons={weaponsForCard}
              selectedWeaponIds={selectedWeaponIdsForCard}
              abilities={faction.abilities}
              uniqueActions={faction.unique_actions}
            />

            <div className="operative-slot-footer">
              {/* Status toggles — only for active (non-removed) operatives in play phase */}
              <div className="footer-left">
                {!isRemoved && (
                  <button
                    type="button"
                    className={`incapacitated-toggle-button ${isIncapacitated ? 'active' : ''}`}
                    onClick={() => handleIncapacitatedToggle(operative.id)}
                    aria-pressed={isIncapacitated}
                    aria-label={`Toggle incapacitated: ${operative.name}`}
                  >
                    {isIncapacitated ? '💀 Incapacitated' : '✅ Active'}
                  </button>
                )}
                {!isRemoved && isPlayPhase && (
                  <button
                    type="button"
                    className={`injured-toggle-button ${injuredOperativeIds.includes(operative.id) ? 'active' : ''}`}
                    onClick={() => handleInjuredToggle(operative.id)}
                    aria-pressed={injuredOperativeIds.includes(operative.id)}
                    aria-label={`Toggle injured: ${operative.name}`}
                  >
                    {injuredOperativeIds.includes(operative.id)
                      ? '🩹 Injured'
                      : '💪 Healthy'}
                  </button>
                )}
              </div>
              {/* Remove / Restore controls (setup phase only) */}
              {!isPlayPhase && (
                <div className="footer-right">
                  {isLeader ? (
                    <span className="leader-badge">
                      👑 Leader — cannot be removed
                    </span>
                  ) : (
                    <>
                      {isRemoved && (
                        <span className="removed-label">REMOVED</span>
                      )}
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
              )}
              {/* Incapacitate info in play phase (no remove controls) */}
              {isPlayPhase && isRemoved && (
                <div className="footer-right">
                  <span className="removed-label">REMOVED</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!isPlayPhase && (
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
      )}
    </div>
  );
}
