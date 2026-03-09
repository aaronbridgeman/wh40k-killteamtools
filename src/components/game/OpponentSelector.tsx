import { useEffect, useState } from 'react';
import { loadOpponentKillTeams } from '@/services/dataLoader';
import { OpponentKillTeam } from '@/types/opponent';
import styles from './OpponentSelector.module.css';

interface OpponentSelectorProps {
  /** Currently selected opponent team ID */
  selectedOpponentId: string | null | undefined;
  /** Callback when selection changes */
  onOpponentSelect: (opponentId: string | null) => void;
}

/**
 * Dropdown selector for choosing an opponent kill team from the reference list.
 * Shown during game setup when a team uses Plague Marines so matchup tips
 * can be displayed during the game.
 */
export function OpponentSelector({
  selectedOpponentId,
  onOpponentSelect,
}: OpponentSelectorProps) {
  const [opponents, setOpponents] = useState<OpponentKillTeam[]>([]);

  useEffect(() => {
    loadOpponentKillTeams().then(setOpponents).catch(console.error);
  }, []);

  const selected = opponents.find((o) => o.id === selectedOpponentId) ?? null;

  return (
    <div className={styles.opponentSelector}>
      <label htmlFor="opponent-select" className={styles.label}>
        Opponent Kill Team
      </label>
      <select
        id="opponent-select"
        className={styles.select}
        value={selectedOpponentId ?? ''}
        onChange={(e) => onOpponentSelect(e.target.value || null)}
      >
        <option value="">— Select opponent (optional) —</option>
        {opponents.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name} ({team.faction}) — {team.model_count} models — Tier{' '}
            {team.tier}
          </option>
        ))}
      </select>
      {selected && (
        <p className={styles.hint}>
          {selected.model_count} operative
          {selected.model_count !== 1 ? 's' : ''} ·{' '}
          {selected.archetype.replace(/_/g, ' ')} · Tier {selected.tier}
        </p>
      )}
    </div>
  );
}
