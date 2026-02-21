/**
 * Operative datacard component
 */

import { Operative, Weapon, UniqueAction, Ability } from '@/types';
import { RuleTooltip } from '@/components/rules/RuleTooltip';
import { getAllAvailableWeaponNames } from '@/services/weaponResolver';
import styles from './OperativeCard.module.css';

interface OperativeCardProps {
  operative: Operative;
  weapons: Weapon[];
  /** Optional: show only these specific weapons (for equipped loadout) */
  selectedWeaponIds?: string[];
  /** Available abilities for this faction */
  abilities?: Ability[];
  /** Available unique actions for this faction */
  uniqueActions?: UniqueAction[];
}

export function OperativeCard({
  operative,
  weapons,
  selectedWeaponIds,
  abilities = [],
  uniqueActions = [],
}: OperativeCardProps) {
  const { stats } = operative;

  // Get weapons for this operative
  // If selectedWeaponIds is provided, show only those (equipped loadout)
  // Otherwise, show all available weapons for this operative
  let operativeWeapons: Weapon[];
  if (selectedWeaponIds !== undefined) {
    // Filter by weapon IDs
    operativeWeapons = weapons.filter((weapon) =>
      selectedWeaponIds.includes(weapon.id)
    );
  } else {
    // Show all available weapons when no specific loadout is selected
    // getAllAvailableWeaponNames returns weapon names (or IDs for legacy format)
    const weaponNamesOrIds = getAllAvailableWeaponNames(operative);

    // Try filtering by name first (new format), then by ID (legacy format)
    operativeWeapons = weapons.filter(
      (weapon) =>
        weaponNamesOrIds.includes(weapon.name) ||
        weaponNamesOrIds.includes(weapon.id)
    );
  }

  // Check if we're showing a specific loadout
  const isEquippedLoadout =
    selectedWeaponIds !== undefined && selectedWeaponIds.length > 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{operative.name}</h3>
        <span className={styles.type}>{operative.type}</span>
      </div>

      {operative.description && (
        <p className={styles.description}>{operative.description}</p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat} data-stat="M">
          <span className={styles.statLabel}>🏃 M</span>
          <span className={styles.statValue}>{stats.movement}&quot;</span>
        </div>
        <div className={styles.stat} data-stat="APL">
          <span className={styles.statLabel}>⚡ APL</span>
          <span className={styles.statValue}>{stats.actionPointLimit}</span>
        </div>
        <div className={styles.stat} data-stat="SV">
          <span className={styles.statLabel}>🛡️ SV</span>
          <span className={styles.statValue}>{stats.save}+</span>
        </div>
        <div className={styles.stat} data-stat="W">
          <span className={styles.statLabel}>❤️ W</span>
          <span className={styles.statValue}>{stats.wounds}</span>
        </div>
      </div>

      {operativeWeapons.length > 0 && (
        <div className={styles.weapons}>
          <h4 className={styles.weaponsTitle}>
            {isEquippedLoadout ? '⚔️ Equipped Loadout' : 'Weapons'}
          </h4>
          {operativeWeapons.map((weapon) => (
            <div key={weapon.id} className={styles.weapon}>
              <div className={styles.weaponHeader}>
                <span className={styles.weaponName}>{weapon.name}</span>
                <span className={styles.weaponType}>
                  {weapon.type === 'ranged' ? '🎯 Ranged' : '⚔️ Melee'}
                </span>
              </div>
              {weapon.profiles.map((profile, idx) => (
                <div
                  key={`${weapon.id}-profile-${profile.name || idx}`}
                  className={styles.weaponProfile}
                >
                  {profile.name && (
                    <div className={styles.profileName}>{profile.name}</div>
                  )}
                  <div className={styles.profileStats}>
                    <div className={styles.profileStat}>
                      <span className={styles.profileStatLabel}>A</span>
                      <span className={styles.profileStatValue}>
                        {profile.attacks}
                      </span>
                    </div>
                    {profile.ballisticSkill !== undefined && (
                      <div className={styles.profileStat}>
                        <span className={styles.profileStatLabel}>BS</span>
                        <span className={styles.profileStatValue}>
                          {profile.ballisticSkill}+
                        </span>
                      </div>
                    )}
                    {profile.weaponSkill !== undefined && (
                      <div className={styles.profileStat}>
                        <span className={styles.profileStatLabel}>WS</span>
                        <span className={styles.profileStatValue}>
                          {profile.weaponSkill}+
                        </span>
                      </div>
                    )}
                    <div className={styles.profileStat}>
                      <span className={styles.profileStatLabel}>D</span>
                      <span className={styles.profileStatValue}>
                        {profile.damage}
                      </span>
                    </div>
                    <div className={styles.profileStat}>
                      <span className={styles.profileStatLabel}>Crit</span>
                      <span className={styles.profileStatValue}>
                        {profile.criticalDamage}
                      </span>
                    </div>
                  </div>
                  {profile.specialRules.length > 0 && (
                    <div className={styles.specialRules}>
                      <span className={styles.specialRulesLabel}>Rules:</span>
                      {profile.specialRules.map((rule) => (
                        <RuleTooltip
                          key={`${weapon.id}-${rule.name}-${rule.value || ''}`}
                          ruleName={rule.name}
                          value={rule.value}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {operative.abilities && operative.abilities.length > 0 && (
        <div className={styles.abilities}>
          <h4 className={styles.abilitiesTitle}>✨ Abilities</h4>
          <div className={styles.abilityList}>
            {operative.abilities.map((abilityName, idx) => {
              // Try to find the full ability details by name
              const abilityDetails = abilities.find(
                (a) => a.name === abilityName || a.id === abilityName
              );
              
              if (!abilityDetails) {
                // Fallback: display ability name only if not found
                return (
                  <div key={idx} className={styles.ability}>
                    {abilityName}
                  </div>
                );
              }
              
              return (
                <div key={abilityDetails.id} className={styles.ability}>
                  <div className={styles.abilityHeader}>
                    <span className={styles.abilityName}>
                      {abilityDetails.name}
                    </span>
                  </div>
                  <div className={styles.abilityDescription}>
                    {abilityDetails.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {operative.unique_actions && operative.unique_actions.length > 0 && (
        <div className={styles.uniqueActions}>
          <h4 className={styles.uniqueActionsTitle}>⚡ Unique Actions</h4>
          <div className={styles.actionList}>
            {operative.unique_actions.map((actionId) => {
              const action = uniqueActions.find((a) => a.id === actionId);
              if (!action) {
                // Fallback for legacy string format or missing action
                return (
                  <div key={actionId} className={styles.action}>
                    {actionId}
                  </div>
                );
              }
              return (
                <div key={action.id} className={styles.action}>
                  <div className={styles.actionHeader}>
                    <span className={styles.actionName}>{action.name}</span>
                    <span className={styles.actionCost}>{action.cost}</span>
                  </div>
                  <div className={styles.actionDescription}>
                    {action.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {operative.keywords && operative.keywords.length > 0 && (
        <div className={styles.keywords}>
          <span className={styles.keywordsLabel}>Keywords:</span>
          {operative.keywords.map((keyword, idx) => (
            <span key={idx} className={styles.keyword}>
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
