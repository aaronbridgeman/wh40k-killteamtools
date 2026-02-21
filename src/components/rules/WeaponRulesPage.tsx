/**
 * Weapon Rules Reference Page Component
 * Displays all weapon rules for quick reference
 */

import { getAllWeaponRules } from '@/services/ruleExpander';
import styles from './WeaponRulesPage.module.css';

export function WeaponRulesPage() {
  const weaponRules = getAllWeaponRules();
  const rulesArray = Object.values(weaponRules);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Weapon Rules Reference</h2>
        <p className={styles.subtitle}>
          Complete list of all weapon special rules
        </p>
      </div>

      <div className={styles.rulesGrid}>
        {rulesArray.map((rule) => (
          <div key={rule.name} className={styles.ruleCard}>
            <h3 className={styles.ruleName}>{rule.name}</h3>
            <p className={styles.ruleDescription}>{rule.description}</p>
            <p className={styles.ruleSource}>Source: {rule.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
