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

      {faction.ploys && faction.ploys.length > 0 && (
        <div className={styles.ploysSection}>
          {faction.ploys.some((ploy) => ploy.type === 'strategy') && (
            <>
              <h3 className={styles.sectionTitle}>Strategic Ploys</h3>
              <div className={styles.ploysGrid}>
                {faction.ploys
                  .filter((ploy) => ploy.type === 'strategy')
                  .map((ploy) => (
                    <div key={ploy.id} className={styles.ploy}>
                      <div className={styles.ployHeader}>
                        <h4 className={styles.ployName}>{ploy.name}</h4>
                        <span className={styles.ployCost}>{ploy.cost} CP</span>
                      </div>
                      <p className={styles.ployDescription}>
                        {ploy.description}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          )}

          {faction.ploys.some((ploy) => ploy.type === 'firefight') && (
            <>
              <h3 className={styles.sectionTitle}>Firefight Ploys</h3>
              <div className={styles.ploysGrid}>
                {faction.ploys
                  .filter((ploy) => ploy.type === 'firefight')
                  .map((ploy) => (
                    <div key={ploy.id} className={styles.ploy}>
                      <div className={styles.ployHeader}>
                        <h4 className={styles.ployName}>{ploy.name}</h4>
                        <span className={styles.ployCost}>{ploy.cost} CP</span>
                      </div>
                      <p className={styles.ployDescription}>
                        {ploy.description}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          )}
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
