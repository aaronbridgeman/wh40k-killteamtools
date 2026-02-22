/**
 * Equipment card component for displaying individual equipment
 */

import { Equipment } from '@/types';
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
          <h5 className={styles.weaponTitle}>Weapon Profile</h5>
          <div className={styles.weaponStats}>
            {equipment.range && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Range:</span>
                <span className={styles.statValue}>{equipment.range}</span>
              </div>
            )}
            <div className={styles.stat}>
              <span className={styles.statLabel}>Attacks:</span>
              <span className={styles.statValue}>
                {equipment.weaponProfile.attacks}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Hit:</span>
              <span className={styles.statValue}>
                {equipment.weaponProfile.ballisticSkill}+
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Damage:</span>
              <span className={styles.statValue}>
                {equipment.weaponProfile.damage}/
                {equipment.weaponProfile.criticalDamage}
              </span>
            </div>
          </div>
          {equipment.weaponProfile.specialRules &&
            equipment.weaponProfile.specialRules.length > 0 && (
              <div className={styles.specialRules}>
                <span className={styles.rulesLabel}>Special Rules:</span>
                <ul className={styles.rulesList}>
                  {equipment.weaponProfile.specialRules.map((rule, index) => (
                    <li key={index} className={styles.ruleItem}>
                      <strong>
                        {rule.name}
                        {rule.value ? ` ${rule.value}` : ''}:
                      </strong>{' '}
                      {rule.description}
                    </li>
                  ))}
                </ul>
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
