/**
 * Component for selecting Chapter Tactics for Angels of Death
 */

import { useState } from 'react';
import { ChapterTactics } from '@/types';
import { ChapterTacticModal } from './ChapterTacticModal';
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
  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [isSecondaryModalOpen, setIsSecondaryModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedTactics = [primaryTactic, secondaryTactic].filter(
    (id) => id !== ''
  );
  const unselectedTactics = chapterTactics.tactics.filter(
    (t) => !selectedTactics.includes(t.id)
  );

  const getPrimaryTacticName = () => {
    const tactic = chapterTactics.tactics.find((t) => t.id === primaryTactic);
    return tactic ? tactic.name : 'Select Primary Tactic...';
  };

  const getSecondaryTacticName = () => {
    const tactic = chapterTactics.tactics.find((t) => t.id === secondaryTactic);
    return tactic ? tactic.name : 'Select Secondary Tactic...';
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.headerButton}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
        <h3 className={styles.headerTitle}>Chapter Tactics</h3>
      </button>

      {isExpanded && (
        <>
          <p className={styles.description}>{chapterTactics.description}</p>

          <div className={styles.selections}>
            <div className={styles.selectionGroup}>
              <label className={styles.label}>Primary Tactic</label>
              <button
                className={`${styles.selectButton} ${primaryTactic ? styles.hasSelection : ''}`}
                onClick={() => setIsPrimaryModalOpen(true)}
              >
                {getPrimaryTacticName()}
              </button>
            </div>

            <div className={styles.selectionGroup}>
              <label className={styles.label}>Secondary Tactic</label>
              <button
                className={`${styles.selectButton} ${secondaryTactic ? styles.hasSelection : ''}`}
                onClick={() => setIsSecondaryModalOpen(true)}
              >
                {getSecondaryTacticName()}
              </button>
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
                    <h6 className={styles.minimizedTacticName}>
                      {tactic.name}
                    </h6>
                    <p className={styles.minimizedTacticEffect}>
                      {tactic.effect}
                    </p>
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
        </>
      )}

      <ChapterTacticModal
        isOpen={isPrimaryModalOpen}
        tactics={chapterTactics.tactics}
        selectedTacticId={primaryTactic}
        disabledTacticId={secondaryTactic}
        onSelect={onPrimaryChange}
        onClose={() => setIsPrimaryModalOpen(false)}
        title="Select Primary Chapter Tactic"
      />

      <ChapterTacticModal
        isOpen={isSecondaryModalOpen}
        tactics={chapterTactics.tactics}
        selectedTacticId={secondaryTactic}
        disabledTacticId={primaryTactic}
        onSelect={onSecondaryChange}
        onClose={() => setIsSecondaryModalOpen(false)}
        title="Select Secondary Chapter Tactic"
      />
    </div>
  );
}
