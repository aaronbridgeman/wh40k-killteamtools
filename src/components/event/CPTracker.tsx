/**
 * CPTracker — Command Point display and adjustment.
 *
 * Reuses GAME_DEFAULTS.MIN_COMMAND_POINTS and MAX_COMMAND_POINTS
 * from constants.ts to keep bounds consistent with the rest of the app.
 */

import { GAME_DEFAULTS } from '@/constants';
import './CPTracker.css';

interface CPTrackerProps {
  /** Current command point total */
  commandPoints: number;
  /** Called when the CP total changes */
  onChange: (commandPoints: number) => void;
}

/**
 * Simple CP counter with increment/decrement buttons.
 * Clamps values between GAME_DEFAULTS.MIN_COMMAND_POINTS and MAX_COMMAND_POINTS.
 */
export function CPTracker({ commandPoints, onChange }: CPTrackerProps) {
  const handleDecrement = () => {
    onChange(Math.max(GAME_DEFAULTS.MIN_COMMAND_POINTS, commandPoints - 1));
  };

  const handleIncrement = () => {
    onChange(Math.min(GAME_DEFAULTS.MAX_COMMAND_POINTS, commandPoints + 1));
  };

  return (
    <div className="cp-tracker">
      <span className="cp-label">⚡ Command Points</span>
      <div className="cp-controls">
        <button
          className="cp-button"
          onClick={handleDecrement}
          disabled={commandPoints <= GAME_DEFAULTS.MIN_COMMAND_POINTS}
          aria-label="Decrease command points"
        >
          −
        </button>
        <span
          className="cp-value"
          aria-label={`${commandPoints} command points`}
          aria-live="polite"
        >
          {commandPoints}
        </span>
        <button
          className="cp-button"
          onClick={handleIncrement}
          disabled={commandPoints >= GAME_DEFAULTS.MAX_COMMAND_POINTS}
          aria-label="Increase command points"
        >
          +
        </button>
      </div>
    </div>
  );
}
