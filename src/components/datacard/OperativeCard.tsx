/**
 * Operative datacard component
 */

import { Operative, Weapon } from '@/types';
import { RuleTooltip } from '@/components/rules/RuleTooltip';
import styles from './OperativeCard.module.css';

interface OperativeCardProps {
  operative: Operative;
  weapons: Weapon[];
}

export function OperativeCard({ operative, weapons }: OperativeCardProps) {
  const { stats } = operative;

  // Get weapons for this operative
  const operativeWeapons = weapons.filter((weapon) =>
    operative.weapons?.includes(weapon.id)
  );

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
        <div className={styles.stat} data-stat="GA">
          <span className={styles.statLabel}>👥 GA</span>
          <span className={styles.statValue}>{stats.groupActivation}</span>
        </div>
        <div className={styles.stat} data-stat="DF">
          <span className={styles.statLabel}>🛡️ DF</span>
          <span className={styles.statValue}>{stats.defense}</span>
        </div>
        <div className={styles.stat} data-stat="SV">
          <span className={styles.statLabel}>💾 SV</span>
          <span className={styles.statValue}>{stats.save}+</span>
        </div>
        <div className={styles.stat} data-stat="W">
          <span className={styles.statLabel}>❤️ W</span>
          <span className={styles.statValue}>{stats.wounds}</span>
        </div>
      </div>

      {operativeWeapons.length > 0 && (
        <div className={styles.weapons}>
          <h4 className={styles.weaponsTitle}>Weapons</h4>
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
