/**
 * Component for displaying the selected team
 */

import { useState } from 'react';
import { SelectedOperative, Faction } from '@/types';
import { validateTeamComposition } from '@/services/teamBuilder';
import { OperativeCard } from '../datacard/OperativeCard';
import styles from './SelectedTeamView.module.css';

interface SelectedTeamViewProps {
  selectedOperatives: SelectedOperative[];
  faction: Faction;
  onClearTeam: () => void;
}

export function SelectedTeamView({
  selectedOperatives,
  faction,
  onClearTeam,
}: SelectedTeamViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRestrictionsExpanded, setIsRestrictionsExpanded] = useState(true);

  const totalCost = selectedOperatives.reduce(
    (sum, selected) => sum + (selected.operative.cost || 0),
    0
  );

  const currentTeam = selectedOperatives.map((s) => s.operative);
  const validation = validateTeamComposition(faction, currentTeam);
  const maxOperatives = faction.restrictions.maxOperatives;

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <button
          className={styles.headerButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
          <div className={styles.headerContent}>
            <h2 className={styles.headerTitle}>Your Team: {faction.name}</h2>
            <div className={styles.stats}>
              <span
                className={`${styles.operativeCount} ${!validation.valid ? styles.invalid : ''}`}
              >
                Operatives: {selectedOperatives.length}
                {maxOperatives && ` / ${maxOperatives}`}
              </span>
              <span className={styles.teamCost}>Total Cost: {totalCost}</span>
            </div>
          </div>
        </button>
        <button onClick={onClearTeam} className={styles.clearButton}>
          Clear Team
        </button>
      </div>

      {isExpanded && (
        <>
          {!validation.valid && validation.errors.length > 0 && (
            <div className={styles.warning}>
              {validation.errors.map((error, index) => (
                <p key={index}>⚠️ {error}</p>
              ))}
            </div>
          )}

          {faction.restrictions.fireTeamRules &&
            faction.restrictions.fireTeamRules.length > 0 && (
              <div className={styles.restrictionsWrapper}>
                <button
                  className={styles.restrictionsHeaderButton}
                  onClick={() =>
                    setIsRestrictionsExpanded(!isRestrictionsExpanded)
                  }
                  aria-expanded={isRestrictionsExpanded}
                >
                  <span className={styles.expandIcon}>
                    {isRestrictionsExpanded ? '▼' : '▶'}
                  </span>
                  <h3 className={styles.restrictionsTitle}>
                    Team Restrictions
                  </h3>
                </button>
                {isRestrictionsExpanded && (
                  <ul className={styles.restrictionsList}>
                    {faction.restrictions.fireTeamRules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          {selectedOperatives.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No operatives selected yet.</p>
              <p>Use the operative selector to build your team.</p>
            </div>
          ) : (
            <div className={styles.operativesGrid}>
              {selectedOperatives.map((selected) => (
                <OperativeCard
                  key={selected.selectionId}
                  operative={selected.operative}
                  weapons={faction.weapons}
                  abilities={faction.abilities}
                  uniqueActions={faction.unique_actions}
                  selectedWeaponIds={selected.selectedWeaponIds}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
