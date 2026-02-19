/**
 * Faction selector component
 */

import { useEffect, useState } from 'react';
import { getFactionList, FactionId } from '@/services/dataLoader';
import styles from './FactionSelector.module.css';

interface FactionSelectorProps {
  selectedFactionId?: FactionId;
  onFactionSelect: (factionId: FactionId) => void;
}

export function FactionSelector({
  selectedFactionId,
  onFactionSelect,
}: FactionSelectorProps) {
  const [factions, setFactions] = useState<
    Array<{ id: FactionId; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFactionList()
      .then(setFactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading factions...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error loading factions: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <label htmlFor="faction-select" className={styles.label}>
        Select Faction:
      </label>
      <select
        id="faction-select"
        className={styles.select}
        value={selectedFactionId || ''}
        onChange={(e) => onFactionSelect(e.target.value as FactionId)}
      >
        <option value="">-- Choose a faction --</option>
        {factions.map((faction) => (
          <option key={faction.id} value={faction.id}>
            {faction.name}
          </option>
        ))}
      </select>
    </div>
  );
}
