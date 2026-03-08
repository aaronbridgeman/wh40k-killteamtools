/**
 * LearningsTracker — free-text notes and learnings field.
 *
 * Positioned at the very bottom of the Quick Play Event view.
 * Content is shared across all 3 games and persisted in
 * QuickPlayEventState.learnings.
 */

import './LearningsTracker.css';

interface LearningsTrackerProps {
  /** Current notes value */
  value: string;
  /** Called whenever the notes content changes */
  onChange: (value: string) => void;
}

/**
 * Free-text area for recording learnings, tactics, and observations
 * during or after the event.
 */
export function LearningsTracker({ value, onChange }: LearningsTrackerProps) {
  return (
    <div className="learnings-tracker">
      <h3 className="learnings-title">📖 Learnings & Notes</h3>
      <p className="learnings-subtitle">
        Shared across all 3 games — persisted automatically.
      </p>
      <textarea
        className="learnings-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Record tactics, observations, learnings from each game…"
        aria-label="Event learnings and notes"
      />
    </div>
  );
}
