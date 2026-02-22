/**
 * Equipment card component for displaying individual equipment
 */

import { Equipment } from '@/types';
import { RuleTooltip } from '@/components/rules/RuleTooltip';
import styles from './EquipmentCard.module.css';

interface EquipmentCardProps {
  equipment: Equipment;
  isSelected?: boolean;
  onSelect?: (equipment: Equipment) => void;
  showSelection?: boolean;
}

export function EquipmentCard({
  equipment,
  isSelected = false,
  onSelect,
  showSelection = false,
}: EquipmentCardProps) {
  const handleClick = () => {
    if (showSelection && onSelect) {
      onSelect(equipment);
    }
  };

  return (
    <div
      className={`${styles.equipmentCard} ${isSelected ? styles.selected : ''} ${showSelection ? styles.selectable : ''}`}
      onClick={handleClick}
      role={showSelection ? 'button' : undefined}
      tabIndex={showSelection ? 0 : undefined}
    >
      <div className={styles.header}>
        <h4 className={styles.name}>{equipment.name}</h4>
        <div className={styles.badges}>
          {equipment.quantity && equipment.quantity > 1 && (
            <span className={styles.quantityBadge}>{equipment.quantity}x</span>
          )}
          {equipment.category === 'faction' && (
            <span className={styles.factionBadge}>Faction</span>
          )}
        </div>
      </div>

      <p className={styles.description}>{equipment.description}</p>

      {equipment.usageLimit && (
        <div className={styles.usageLimit}>
          <span className={styles.limitLabel}>Usage:</span>{' '}
          {equipment.usageLimit}
        </div>
      )}

      {equipment.restrictedToKeywords &&
        equipment.restrictedToKeywords.length > 0 && (
          <div className={styles.keywords}>
            <span className={styles.keywordLabel}>Requires:</span>{' '}
            {equipment.restrictedToKeywords.join(', ')}
          </div>
        )}

      {/* Display weapon profile if equipment has attack actions */}
      {equipment.weaponProfile && (
        <div className={styles.weaponProfile}>
          <div className={styles.weaponHeader}>
            <h5 className={styles.weaponTitle}>⚔️ Weapon Profile</h5>
            {equipment.weaponType && (
              <span className={styles.weaponType}>
                {equipment.weaponType === 'ranged' ? '🎯 Ranged' : '⚔️ Melee'}
              </span>
            )}
          </div>
          <div className={styles.profileStats}>
            {equipment.range && (
              <div className={styles.profileStat} data-stat="Range">
                <span className={styles.profileStatLabel}>📏 Range</span>
                <span className={styles.profileStatValue}>
                  {equipment.range}
                </span>
              </div>
            )}
            <div className={styles.profileStat} data-stat="A">
              <span className={styles.profileStatLabel}>⚔️ A</span>
              <span className={styles.profileStatValue}>
                {equipment.weaponProfile.attacks}
              </span>
            </div>
            {equipment.weaponProfile.ballisticSkill !== undefined && (
              <div className={styles.profileStat} data-stat="BS">
                <span className={styles.profileStatLabel}>🎯 BS</span>
                <span className={styles.profileStatValue}>
                  {equipment.weaponProfile.ballisticSkill}+
                </span>
              </div>
            )}
            {equipment.weaponProfile.weaponSkill !== undefined && (
              <div className={styles.profileStat} data-stat="WS">
                <span className={styles.profileStatLabel}>🗡️ WS</span>
                <span className={styles.profileStatValue}>
                  {equipment.weaponProfile.weaponSkill}+
                </span>
              </div>
            )}
            <div className={styles.profileStat} data-stat="D">
              <span className={styles.profileStatLabel}>💥 D</span>
              <span className={styles.profileStatValue}>
                {equipment.weaponProfile.damage}
              </span>
            </div>
            <div className={styles.profileStat} data-stat="Crit">
              <span className={styles.profileStatLabel}>💀 Crit</span>
              <span className={styles.profileStatValue}>
                {equipment.weaponProfile.criticalDamage}
              </span>
            </div>
          </div>
          {equipment.weaponProfile.specialRules &&
            equipment.weaponProfile.specialRules.length > 0 && (
              <div className={styles.specialRules}>
                <span className={styles.specialRulesLabel}>Rules:</span>
                {equipment.weaponProfile.specialRules.map((rule, index) => (
                  <RuleTooltip
                    key={`${equipment.id}-${rule.name}-${rule.value || index}`}
                    ruleName={rule.name}
                    value={rule.value}
                  />
                ))}
              </div>
            )}
        </div>
      )}

      {/* Display effects */}
      {equipment.effects && equipment.effects.length > 0 && (
        <div className={styles.effects}>
          {equipment.effects.map((effect, index) => (
            <div key={index} className={styles.effect}>
              <span className={styles.effectType}>{effect.type}:</span>{' '}
              {effect.description}
              {effect.weaponRules && effect.weaponRules.length > 0 && (
                <ul className={styles.effectRules}>
                  {effect.weaponRules.map((rule, ruleIndex) => (
                    <li key={ruleIndex}>
                      <strong>{rule.name}:</strong> {rule.description}
                    </li>
                  ))}
                </ul>
              )}
              {effect.affectedWeapons && effect.affectedWeapons.length > 0 && (
                <div className={styles.affectedWeapons}>
                  Affects: {effect.affectedWeapons.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
