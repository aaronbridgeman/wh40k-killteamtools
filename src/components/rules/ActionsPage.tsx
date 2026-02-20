/**
 * Actions Reference Page Component
 * Displays all actions with their associated AP costs
 */

import { getActionRules, extractAPCost } from '@/services/rulesDataService';
import styles from './ActionsPage.module.css';

export function ActionsPage() {
  const actions = getActionRules();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Actions Reference</h2>
        <p className={styles.subtitle}>
          All actions available to operatives with their AP costs
        </p>
      </div>

      <div className={styles.rulesGrid}>
        {actions.map((action) => {
          const apCost = extractAPCost(action.name);
          const actionName = action.name.replace(/\s*\(\d+AP\)/, '');

          return (
            <div key={action.name} className={styles.ruleCard}>
              <div className={styles.ruleHeader}>
                <h3 className={styles.ruleName}>{actionName}</h3>
                {apCost && <span className={styles.apCost}>{apCost}</span>}
              </div>
              <p className={styles.ruleDescription}>{action.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
