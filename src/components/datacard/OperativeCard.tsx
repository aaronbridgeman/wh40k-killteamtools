/**
 * Operative datacard component
 */

import { Operative } from '@/types';
import styles from './OperativeCard.module.css';

interface OperativeCardProps {
  operative: Operative;
}

export function OperativeCard({ operative }: OperativeCardProps) {
  const { stats } = operative;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{operative.name}</h3>
        <span className={styles.type}>{operative.type}</span>
      </div>

      {operative.description && (
        <p className={styles.description}>{operative.description}</p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>M</span>
          <span className={styles.statValue}>{stats.movement}&quot;</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>APL</span>
          <span className={styles.statValue}>{stats.actionPointLimit}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>GA</span>
          <span className={styles.statValue}>{stats.groupActivation}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>DF</span>
          <span className={styles.statValue}>{stats.defense}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>SV</span>
          <span className={styles.statValue}>{stats.save}+</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>W</span>
          <span className={styles.statValue}>{stats.wounds}</span>
        </div>
      </div>

      {operative.keywords.length > 0 && (
        <div className={styles.keywords}>
          <span className={styles.keywordsLabel}>Keywords:</span>
          {operative.keywords.map((keyword, idx) => (
            <span key={idx} className={styles.keyword}>
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
