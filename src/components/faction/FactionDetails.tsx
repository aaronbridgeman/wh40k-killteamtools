/**
 * Faction details display component
 */

import { Faction } from '@/types';
import styles from './FactionDetails.module.css';

interface FactionDetailsProps {
  faction: Faction;
}

export function FactionDetails({ faction }: FactionDetailsProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{faction.name}</h2>
      <p className={styles.description}>{faction.description}</p>

      {faction.rules.length > 0 && (
        <div className={styles.rulesSection}>
          <h3 className={styles.sectionTitle}>Faction Rules</h3>
          {faction.rules.map((rule) => (
            <div key={rule.id} className={styles.rule}>
              <h4 className={styles.ruleName}>
                {rule.name}
                <span className={styles.ruleType}>({rule.type})</span>
              </h4>
              <p className={styles.ruleDescription}>{rule.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className={styles.metadata}>
        <p>
          <strong>Source:</strong> {faction.metadata.source}
        </p>
        <p>
          <strong>Version:</strong> {faction.metadata.version}
        </p>
      </div>
    </div>
  );
}
