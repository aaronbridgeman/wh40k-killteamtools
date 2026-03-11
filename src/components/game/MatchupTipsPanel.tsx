import { useEffect, useState } from 'react';
import {
  loadOpponentKillTeams,
  loadPlagueMarinesMatchupTips,
} from '@/services/dataLoader';
import {
  OpponentKillTeam,
  PlagueMarinesMatchupTips,
  StrategyTip,
} from '@/types/opponent';
import styles from './MatchupTipsPanel.module.css';

interface MatchupTipsPanelProps {
  /** ID of the selected opponent kill team */
  opponentTeamId: string | null | undefined;
}

/**
 * Displays Plague Marines strategy tips relevant to the current game.
 * Shows general team-wide tips and, when an opponent is selected,
 * matchup-specific advice and opponent-specific tips.
 */
export function MatchupTipsPanel({ opponentTeamId }: MatchupTipsPanelProps) {
  const [opponents, setOpponents] = useState<OpponentKillTeam[]>([]);
  const [tips, setTips] = useState<PlagueMarinesMatchupTips | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    loadOpponentKillTeams().then(setOpponents).catch(console.error);
    loadPlagueMarinesMatchupTips().then(setTips).catch(console.error);
  }, []);

  const opponent = opponents.find((o) => o.id === opponentTeamId) ?? null;
  const matchupTips: StrategyTip[] =
    opponent && tips ? (tips.matchup_tips[opponent.tips_category] ?? []) : [];

  if (!tips) return null;

  return (
    <section
      className={styles.panel}
      aria-label="Plague Marines Strategy Advisor"
    >
      <button
        className={styles.header}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span>⚕ Plague Marines Strategy Advisor</span>
        <span className={styles.toggle}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className={styles.body}>
          {/* Opponent-specific tips */}
          {opponent && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                vs {opponent.name}
                <span className={styles.badge}>
                  {opponent.tier !== null ? `Tier ${opponent.tier}` : 'Unrated'} ·{' '}
                  {opponent.model_count !== null
                    ? `${opponent.model_count} models`
                    : 'variable size'}
                </span>
              </h4>

              {opponent.specific_tips.length > 0 && (
                <>
                  <p className={styles.subTitle}>Specific advice:</p>
                  <ul className={styles.tipList}>
                    {opponent.specific_tips.map((tip, i) => (
                      <li key={i} className={styles.tipItem}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {opponent.key_threat && (
                <p className={styles.keyThreat}>
                  <span className={styles.keyThreatLabel}>⚠ Key Threat:</span>{' '}
                  {opponent.key_threat}
                </p>
              )}

              {matchupTips.length > 0 && (
                <>
                  <p className={styles.subTitle}>
                    General advice vs {opponent.archetype.replace(/_/g, ' ')}:
                  </p>
                  <ul className={styles.tipList}>
                    {matchupTips.map((t, i) => (
                      <li key={i} className={styles.tipItem}>
                        <strong>{t.tip}:</strong> {t.detail}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Team-wide tips */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>General Tips</h4>
            <ul className={styles.tipList}>
              {tips.team_wide_tips.map((t, i) => (
                <li key={i} className={styles.tipItem}>
                  <strong>{t.tip}:</strong> {t.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
