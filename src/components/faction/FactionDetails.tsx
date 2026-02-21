/**
 * Faction details display component
 */

import { useState } from 'react';
import { Faction } from '@/types';
import styles from './FactionDetails.module.css';

interface FactionDetailsProps {
  faction: Faction;
}

export function FactionDetails({ faction }: FactionDetailsProps) {
  const [rulesExpanded, setRulesExpanded] = useState(true);
  const [strategicPloysExpanded, setStrategicPloysExpanded] = useState(true);
  const [firefightPloysExpanded, setFirefightPloysExpanded] = useState(true);

  const hasStrategicPloys = faction.ploys?.some(
    (ploy) => ploy.type === 'strategy'
  );
  const hasFirefightPloys = faction.ploys?.some(
    (ploy) => ploy.type === 'firefight'
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{faction.name}</h2>
      <p className={styles.description}>{faction.description}</p>

      {faction.rules.length > 0 && (
        <div className={styles.collapsibleSection}>
          <button
            className={styles.sectionHeader}
            onClick={() => setRulesExpanded(!rulesExpanded)}
            aria-expanded={rulesExpanded}
          >
            <span className={styles.expandIcon}>
              {rulesExpanded ? '▼' : '▶'}
            </span>
            <h3 className={styles.sectionTitle}>Faction Rules</h3>
          </button>
          {rulesExpanded && (
            <div className={styles.sectionContent}>
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
        </div>
      )}

      {faction.ploys && faction.ploys.length > 0 && (
        <>
          {hasStrategicPloys && (
            <div className={styles.collapsibleSection}>
              <button
                className={styles.sectionHeader}
                onClick={() =>
                  setStrategicPloysExpanded(!strategicPloysExpanded)
                }
                aria-expanded={strategicPloysExpanded}
              >
                <span className={styles.expandIcon}>
                  {strategicPloysExpanded ? '▼' : '▶'}
                </span>
                <h3 className={styles.sectionTitle}>Strategic Ploys</h3>
              </button>
              {strategicPloysExpanded && (
                <div className={styles.sectionContent}>
                  <div className={styles.ploysGrid}>
                    {faction.ploys
                      .filter((ploy) => ploy.type === 'strategy')
                      .map((ploy) => (
                        <div key={ploy.id} className={styles.ploy}>
                          <div className={styles.ployHeader}>
                            <h4 className={styles.ployName}>{ploy.name}</h4>
                            <span className={styles.ployCost}>
                              {ploy.cost} CP
                            </span>
                          </div>
                          <p className={styles.ployDescription}>
                            {ploy.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasFirefightPloys && (
            <div className={styles.collapsibleSection}>
              <button
                className={styles.sectionHeader}
                onClick={() =>
                  setFirefightPloysExpanded(!firefightPloysExpanded)
                }
                aria-expanded={firefightPloysExpanded}
              >
                <span className={styles.expandIcon}>
                  {firefightPloysExpanded ? '▼' : '▶'}
                </span>
                <h3 className={styles.sectionTitle}>Firefight Ploys</h3>
              </button>
              {firefightPloysExpanded && (
                <div className={styles.sectionContent}>
                  <div className={styles.ploysGrid}>
                    {faction.ploys
                      .filter((ploy) => ploy.type === 'firefight')
                      .map((ploy) => (
                        <div key={ploy.id} className={styles.ploy}>
                          <div className={styles.ployHeader}>
                            <h4 className={styles.ployName}>{ploy.name}</h4>
                            <span className={styles.ployCost}>
                              {ploy.cost} CP
                            </span>
                          </div>
                          <p className={styles.ployDescription}>
                            {ploy.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
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
