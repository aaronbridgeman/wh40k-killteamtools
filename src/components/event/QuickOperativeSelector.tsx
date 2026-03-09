/**
 * QuickOperativeSelector — compact pill-style operative name selector.
 *
 * Shown during game setup so the player can quickly deselect one non-leader
 * operative without needing to scroll through full datacards. Each operative
 * is a button pill; clicking an active one removes it from the game;
 * clicking the removed one restores it.
 */

import { Faction, Operative } from '@/types';
import './QuickOperativeSelector.css';

interface QuickOperativeSelectorProps {
  /** Loaded Plague Marines faction data */
  faction: Faction;
  /** ID of the currently removed operative, or null */
  removedOperativeId: string | null;
  /** Called when the player removes or restores an operative */
  onRosterChange: (removedOperativeId: string | null) => void;
}

/**
 * Renders a row of operative name pills. Exactly one non-leader operative
 * may be deselected (removed) per game. The leader cannot be removed.
 */
export function QuickOperativeSelector({
  faction,
  removedOperativeId,
  onRosterChange,
}: QuickOperativeSelectorProps) {
  const handleClick = (operative: Operative) => {
    if (operative.type === 'Leader') return;

    if (removedOperativeId === operative.id) {
      // Restore
      onRosterChange(null);
    } else if (removedOperativeId === null) {
      // Remove
      onRosterChange(operative.id);
    }
    // If a different operative is already removed, do nothing
  };

  const activeCount = faction.operatives.length - (removedOperativeId ? 1 : 0);

  return (
    <div className="quick-operative-selector">
      <p className="quick-roster-hint">
        Tap a non-leader operative to remove them from this game (one only).
        Active: <strong>{activeCount}</strong> / {faction.operatives.length}
      </p>
      <div
        className="operative-pills"
        role="group"
        aria-label="Operative roster"
      >
        {faction.operatives.map((operative) => {
          const isLeader = operative.type === 'Leader';
          const isRemoved = operative.id === removedOperativeId;
          const anotherRemoved =
            !isRemoved && removedOperativeId !== null && !isLeader;

          let pillClass = 'operative-pill';
          if (isLeader) pillClass += ' leader';
          else if (isRemoved) pillClass += ' removed';
          else if (anotherRemoved) pillClass += ' blocked';
          else pillClass += ' active';

          return (
            <button
              key={operative.id}
              type="button"
              className={pillClass}
              onClick={() => handleClick(operative)}
              disabled={anotherRemoved}
              aria-pressed={!isLeader && !isRemoved}
              aria-label={
                isLeader
                  ? `${operative.name} — leader, cannot be removed`
                  : isRemoved
                    ? `Restore ${operative.name} to roster`
                    : `Remove ${operative.name} from this game`
              }
              title={
                anotherRemoved
                  ? 'Another operative is already removed'
                  : undefined
              }
            >
              {isRemoved && (
                <span className="pill-cross" aria-hidden="true">
                  ✕{' '}
                </span>
              )}
              {operative.name}
              {isLeader && (
                <span className="pill-crown" aria-hidden="true">
                  {' '}
                  👑
                </span>
              )}
            </button>
          );
        })}
      </div>
      {removedOperativeId && (
        <p className="quick-removed-note">
          Removed:{' '}
          <strong>
            {faction.operatives.find((o) => o.id === removedOperativeId)?.name}
          </strong>{' '}
          — tap again to restore.
        </p>
      )}
    </div>
  );
}
