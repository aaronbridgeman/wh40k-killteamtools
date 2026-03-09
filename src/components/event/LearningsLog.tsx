/**
 * LearningsLog — read-only view of all submitted learning entries.
 *
 * Displays each submitted note with its metadata (opposition team,
 * crit op, tac op, map) and timestamp. Supports deleting individual
 * entries and clearing the entire log.
 *
 * @see QUICK_PLAY_EVENT_SPEC.md
 */

import { useCallback } from 'react';
import { LearningEntry } from '@/types/event';
import './LearningsLog.css';

interface LearningsLogProps {
  /** All submitted learning entries */
  entries: LearningEntry[];
  /** Called when an entry is deleted */
  onDelete: (id: string) => void;
  /** Called when the entire log is cleared */
  onClearAll: () => void;
  /** Called to navigate back to the event view */
  onBack: () => void;
}

/** Formats an ISO timestamp to a human-readable string */
function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Unknown date';
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown date';
  }
}

/**
 * Read-only log of all submitted learning entries, with delete controls.
 */
export function LearningsLog({
  entries,
  onDelete,
  onClearAll,
  onBack,
}: LearningsLogProps) {
  const handleClearAll = useCallback(() => {
    if (window.confirm('Clear all learnings? This cannot be undone.')) {
      onClearAll();
    }
  }, [onClearAll]);

  return (
    <div className="learnings-log">
      <div className="log-header">
        <button
          type="button"
          className="log-back-button"
          onClick={onBack}
          aria-label="Back to event"
        >
          ← Back
        </button>
        <h2 className="log-title">📖 Learnings Log</h2>
        {entries.length > 0 && (
          <button
            type="button"
            className="log-clear-button"
            onClick={handleClearAll}
            aria-label="Clear all learnings"
          >
            Clear All
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="log-empty">
          No learnings recorded yet. Submit notes from the game view.
        </p>
      ) : (
        <ol className="log-entries" aria-label="Learning entries">
          {[...entries].reverse().map((entry) => (
            <li key={entry.id} className="log-entry">
              <div className="log-entry-header">
                <span className="log-entry-time">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <button
                  type="button"
                  className="log-delete-button"
                  onClick={() => onDelete(entry.id)}
                  aria-label={`Delete entry: ${entry.text.slice(0, 40)}`}
                >
                  ✕
                </button>
              </div>
              <p className="log-entry-text">{entry.text}</p>
              {(entry.oppositionTeam ||
                entry.critOp ||
                entry.tacOp ||
                entry.map) && (
                <div className="log-entry-meta">
                  {entry.oppositionTeam && (
                    <span className="meta-tag">vs. {entry.oppositionTeam}</span>
                  )}
                  {entry.critOp && (
                    <span className="meta-tag">Crit: {entry.critOp}</span>
                  )}
                  {entry.tacOp && (
                    <span className="meta-tag">Tac: {entry.tacOp}</span>
                  )}
                  {entry.map && (
                    <span className="meta-tag">Map: {entry.map}</span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
