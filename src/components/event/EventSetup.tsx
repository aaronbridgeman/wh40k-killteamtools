/**
 * EventSetup — first-run event configuration screen.
 *
 * Shown when QuickPlayEventState.setupComplete is false.
 * Collects an optional event name and starts the event.
 */

import { useState } from 'react';
import './EventSetup.css';

interface EventSetupProps {
  /** Called when the player is ready to begin the event */
  onSetupComplete: (eventName: string) => void;
}

/**
 * First-run setup form for the Quick Play Event.
 * Allows the player to name the event before starting.
 */
export function EventSetup({ onSetupComplete }: EventSetupProps) {
  const [eventName, setEventName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetupComplete(eventName.trim());
  };

  return (
    <div className="event-setup">
      <div className="setup-icon" aria-hidden="true">
        ☠️
      </div>
      <h3 className="setup-title">Grandfather Nurgle Awaits</h3>
      <p className="setup-description">
        Prepare for 3 games of blessed pestilence. Optionally name your event,
        then begin the hunt.
      </p>

      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="setup-field">
          <label htmlFor="event-name-input" className="setup-label">
            Event Name (optional)
          </label>
          <input
            id="event-name-input"
            type="text"
            className="setup-input"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g. Nurgle's Harvest GT"
            maxLength={60}
          />
        </div>

        <button type="submit" className="setup-submit">
          Begin the Hunt 🦠
        </button>
      </form>
    </div>
  );
}
