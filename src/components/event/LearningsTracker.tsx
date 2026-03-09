/**
 * LearningsTracker — form for submitting learning entries to the log.
 *
 * Supports optional metadata (opposition team, crit op, tac op, map).
 * On submit, the entry is added to the log and the form is cleared.
 * A "View Log" button navigates to the LearningsLog page.
 *
 * @see QUICK_PLAY_EVENT_SPEC.md
 */

import { useState, useCallback, useEffect } from 'react';
import { LearningEntry } from '@/types/event';
import './LearningsTracker.css';

/** Common Kill Team faction suggestions for the opposition team datalist */
const FACTION_SUGGESTIONS = [
  'Angels of Death',
  'Plague Marines',
  'Grey Knights',
  'Thousand Sons',
  'Harlequins',
  'Orks',
  'Tau Pathfinders',
  'Tyranid Warriors',
  'Necron Hierotek Circle',
  'Custodians',
  'Imperial Guard',
  'Chaos Cultists',
];

/** Common Kill Team Critical Operations */
const CRIT_OP_SUGGESTIONS = [
  'Engage on All Fronts',
  'Behind Enemy Lines',
  'No Prisoners',
  'Seize Ground',
  'Scramble',
];

/** Common Kill Team Tactical Objectives */
const TAC_OP_SUGGESTIONS = [
  'Sweep and Clear',
  'Assassinate',
  'Secure',
  'Defend',
  'Recover',
  'Capture',
];

/** Common Kill Team Maps / Killzones */
const MAP_SUGGESTIONS = [
  'Gallowfall',
  'Into the Dark',
  'Ravaged Star',
  'Bheta-Decima',
  'Open Killzone',
];

interface LearningsTrackerProps {
  /** Current list of submitted learning entries */
  entries: LearningEntry[];
  /** Called when a new entry is submitted */
  onSubmit: (entry: LearningEntry) => void;
  /** Called to navigate to the full log view */
  onViewLog: () => void;
  /** Pre-populate opposition field from game setup */
  defaultOpposition?: string;
  /** Pre-populate crit op field from game setup */
  defaultCritOp?: string;
  /** Pre-populate tac op field from game setup */
  defaultTacOp?: string;
}

/**
 * Form for capturing a short learning note with optional metadata.
 * Submitted entries are added to the persistent log and the form is cleared.
 * The defaultOpposition/defaultCritOp/defaultTacOp props are kept in sync
 * with the active game so switching games updates the pre-populated fields.
 */
export function LearningsTracker({
  entries,
  onSubmit,
  onViewLog,
  defaultOpposition = '',
  defaultCritOp = '',
  defaultTacOp = '',
}: LearningsTrackerProps) {
  const [text, setText] = useState('');
  const [oppositionTeam, setOppositionTeam] = useState(defaultOpposition);
  const [critOp, setCritOp] = useState(defaultCritOp);
  const [tacOp, setTacOp] = useState(defaultTacOp);

  // Keep pre-populated fields in sync when the active game changes
  useEffect(() => {
    setOppositionTeam(defaultOpposition);
  }, [defaultOpposition]);

  useEffect(() => {
    setCritOp(defaultCritOp);
  }, [defaultCritOp]);

  useEffect(() => {
    setTacOp(defaultTacOp);
  }, [defaultTacOp]);
  const [map, setMap] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) return;

      const entry: LearningEntry = {
        id: crypto.randomUUID(),
        text: trimmed,
        timestamp: new Date().toISOString(),
        ...(oppositionTeam.trim() && { oppositionTeam: oppositionTeam.trim() }),
        ...(critOp.trim() && { critOp: critOp.trim() }),
        ...(tacOp.trim() && { tacOp: tacOp.trim() }),
        ...(map.trim() && { map: map.trim() }),
      };

      onSubmit(entry);

      // Clear the form on submission
      setText('');
      setOppositionTeam('');
      setCritOp('');
      setTacOp('');
      setMap('');
    },
    [text, oppositionTeam, critOp, tacOp, map, onSubmit]
  );

  return (
    <div className="learnings-tracker">
      <div className="learnings-header">
        <h3 className="learnings-title">📖 Learnings &amp; Notes</h3>
        <button
          type="button"
          className="view-log-button"
          onClick={onViewLog}
          aria-label={`View learnings log (${entries.length} entries)`}
        >
          View Log ({entries.length})
        </button>
      </div>
      <p className="learnings-subtitle">
        Submit short notes as you go — they&apos;re saved to the log.
      </p>

      <form className="learnings-form" onSubmit={handleSubmit} noValidate>
        <textarea
          className="learnings-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you learn? Tactics, observations…"
          aria-label="Learning note text"
          rows={3}
        />

        {/* Optional metadata fields */}
        <div className="learnings-meta">
          <div className="meta-field">
            <label className="meta-label" htmlFor="meta-opposition">
              vs. Team
            </label>
            <input
              id="meta-opposition"
              className="meta-input"
              type="text"
              value={oppositionTeam}
              onChange={(e) => setOppositionTeam(e.target.value)}
              placeholder="e.g. Orks"
              list="faction-suggestions"
              aria-label="Opposition team"
            />
            <datalist id="faction-suggestions">
              {FACTION_SUGGESTIONS.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>

          <div className="meta-field">
            <label className="meta-label" htmlFor="meta-crit-op">
              Crit Op
            </label>
            <input
              id="meta-crit-op"
              className="meta-input"
              type="text"
              value={critOp}
              onChange={(e) => setCritOp(e.target.value)}
              placeholder="e.g. No Prisoners"
              list="crit-op-suggestions"
              aria-label="Critical Operation"
            />
            <datalist id="crit-op-suggestions">
              {CRIT_OP_SUGGESTIONS.map((op) => (
                <option key={op} value={op} />
              ))}
            </datalist>
          </div>

          <div className="meta-field">
            <label className="meta-label" htmlFor="meta-tac-op">
              Tac Op
            </label>
            <input
              id="meta-tac-op"
              className="meta-input"
              type="text"
              value={tacOp}
              onChange={(e) => setTacOp(e.target.value)}
              placeholder="e.g. Assassinate"
              list="tac-op-suggestions"
              aria-label="Tactical Objective"
            />
            <datalist id="tac-op-suggestions">
              {TAC_OP_SUGGESTIONS.map((op) => (
                <option key={op} value={op} />
              ))}
            </datalist>
          </div>

          <div className="meta-field">
            <label className="meta-label" htmlFor="meta-map">
              Map
            </label>
            <input
              id="meta-map"
              className="meta-input"
              type="text"
              value={map}
              onChange={(e) => setMap(e.target.value)}
              placeholder="e.g. Gallowfall"
              list="map-suggestions"
              aria-label="Map or killzone"
            />
            <datalist id="map-suggestions">
              {MAP_SUGGESTIONS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
        </div>

        <button
          type="submit"
          className="submit-learning-button"
          disabled={!text.trim()}
          aria-label="Submit learning note to log"
        >
          ✓ Submit Note
        </button>
      </form>
    </div>
  );
}
