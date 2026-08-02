import { GameSystemConfig } from '@/types';
import styles from './ScaffoldSystemView.module.css';

interface ScaffoldSystemViewProps {
  gameSystem: GameSystemConfig;
}

export function ScaffoldSystemView({ gameSystem }: ScaffoldSystemViewProps) {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{gameSystem.name} (Scaffold Ready)</h2>
      <p className={styles.description}>{gameSystem.description}</p>
      <p className={styles.description}>
        This system is now selectable in the UI and has dedicated config and
        reference-data scaffold files ready for content.
      </p>
      <ul className={styles.sourceList}>
        {gameSystem.referenceSources.map((source) => (
          <li key={source.id}>
            <strong>{source.name}:</strong> {source.description}
            <span className={styles.sourcePath}>({source.path})</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
