/**
 * Component for selecting Chapter Tactics for Angels of Death
 */

import { ChapterTactics } from '@/types';
import styles from './ChapterTacticsSelector.module.css';

interface ChapterTacticsSelectorProps {
  chapterTactics: ChapterTactics;
  primaryTactic: string;
  secondaryTactic: string;
  onPrimaryChange: (tacticId: string) => void;
  onSecondaryChange: (tacticId: string) => void;
}

export function ChapterTacticsSelector({
  chapterTactics,
  primaryTactic,
  secondaryTactic,
  onPrimaryChange,
  onSecondaryChange,
}: ChapterTacticsSelectorProps) {
  const selectedTactics = [primaryTactic, secondaryTactic].filter(
    (id) => id !== ''
  );
  const unselectedTactics = chapterTactics.tactics.filter(
    (t) => !selectedTactics.includes(t.id)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Chapter Tactics</h3>
        <p className={styles.description}>{chapterTactics.description}</p>
      </div>

      <div className={styles.selections}>
        <div className={styles.selectionGroup}>
          <label htmlFor="primary-tactic" className={styles.label}>
            Primary Tactic
          </label>
          <select
            id="primary-tactic"
            className={styles.select}
            value={primaryTactic || ''}
            onChange={(e) => onPrimaryChange(e.target.value)}
          >
            <option value="">Select Primary Tactic...</option>
            {chapterTactics.tactics.map((tactic) => (
              <option
                key={tactic.id}
                value={tactic.id}
                disabled={tactic.id === secondaryTactic}
              >
                {tactic.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectionGroup}>
          <label htmlFor="secondary-tactic" className={styles.label}>
            Secondary Tactic
          </label>
          <select
            id="secondary-tactic"
            className={styles.select}
            value={secondaryTactic || ''}
            onChange={(e) => onSecondaryChange(e.target.value)}
          >
            <option value="">Select Secondary Tactic...</option>
            {chapterTactics.tactics.map((tactic) => (
              <option
                key={tactic.id}
                value={tactic.id}
                disabled={tactic.id === primaryTactic}
              >
                {tactic.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTactics.length > 0 && (
        <div className={styles.selectedTactics}>
          <h4 className={styles.selectedTitle}>Selected Tactics</h4>
          {chapterTactics.tactics
            .filter((t) => selectedTactics.includes(t.id))
            .map((tactic) => {
              const isPrimary = tactic.id === primaryTactic;
              return (
                <div key={tactic.id} className={styles.tacticCard}>
                  <div className={styles.tacticHeader}>
                    <h5 className={styles.tacticName}>{tactic.name}</h5>
                    <span
                      className={`${styles.tacticType} ${isPrimary ? styles.primary : styles.secondary}`}
                    >
                      {isPrimary ? 'Primary' : 'Secondary'}
                    </span>
                  </div>
                  <p className={styles.tacticEffect}>
                    <strong>Effect:</strong> {tactic.effect}
                  </p>
                  {tactic.description && (
                    <p className={styles.tacticDescription}>
                      {tactic.description}
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {unselectedTactics.length > 0 && selectedTactics.length > 0 && (
        <details className={styles.otherTactics}>
          <summary className={styles.otherTacticsTitle}>
            Other Available Tactics ({unselectedTactics.length})
          </summary>
          <div className={styles.tacticsList}>
            {unselectedTactics.map((tactic) => (
              <div key={tactic.id} className={styles.minimizedTactic}>
                <h6 className={styles.minimizedTacticName}>{tactic.name}</h6>
                <p className={styles.minimizedTacticEffect}>{tactic.effect}</p>
                {tactic.description && (
                  <p className={styles.minimizedTacticDescription}>
                    {tactic.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
