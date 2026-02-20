/**
 * Component for displaying the selected team
 */

import { SelectedOperative, Faction } from '@/types';
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
  const totalCost = selectedOperatives.reduce(
    (sum, selected) => sum + selected.operative.cost,
    0
  );

  const maxOperatives = faction.restrictions.maxOperatives;
  const minOperatives = faction.restrictions.minOperatives;

  const isValidCount =
    (!minOperatives || selectedOperatives.length >= minOperatives) &&
    (!maxOperatives || selectedOperatives.length <= maxOperatives);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2>Your Team: {faction.name}</h2>
          <div className={styles.stats}>
            <span
              className={`${styles.operativeCount} ${!isValidCount ? styles.invalid : ''}`}
            >
              Operatives: {selectedOperatives.length}
              {maxOperatives && ` / ${maxOperatives}`}
            </span>
            <span className={styles.teamCost}>Total Cost: {totalCost}</span>
          </div>
        </div>
        <button onClick={onClearTeam} className={styles.clearButton}>
          Clear Team
        </button>
      </div>

      {!isValidCount && (
        <div className={styles.warning}>
          {minOperatives && selectedOperatives.length < minOperatives && (
            <p>⚠️ Team needs at least {minOperatives} operatives</p>
          )}
          {maxOperatives && selectedOperatives.length > maxOperatives && (
            <p>⚠️ Team exceeds maximum of {maxOperatives} operatives</p>
          )}
        </div>
      )}

      {faction.restrictions.fireTeamRules &&
        faction.restrictions.fireTeamRules.length > 0 && (
          <div className={styles.restrictions}>
            <h3>Team Restrictions</h3>
            <ul>
              {faction.restrictions.fireTeamRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
