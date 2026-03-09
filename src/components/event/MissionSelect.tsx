/**
 * MissionSelect — dropdown selector for Kill Team Critical Ops and Tac Ops.
 *
 * Shows a <select> with predefined operation names. If the current value does
 * not match any predefined option, a "Custom / Other" text input is revealed
 * so the player can type a custom operation name.
 *
 * When a predefined option is selected its description is shown below the
 * dropdown as a play-time reminder of the scoring criteria.
 */

import { useId } from 'react';
import { MissionEntry } from '@/data/missions/missions';
import './MissionSelect.css';

const CUSTOM_VALUE = '__custom__';

interface MissionSelectProps {
  /** Label text shown above the dropdown */
  label: string;
  /** The list of predefined missions (CRIT_OPS or TAC_OPS) */
  options: MissionEntry[];
  /**
   * The current value — either a predefined mission name, an empty string
   * (nothing selected), or a free-text custom name.
   */
  value: string;
  /** Called with the new value whenever the player changes the selection */
  onChange: (value: string) => void;
  /** Placeholder text for the custom free-text input */
  placeholder?: string;
}

/** Returns true when `value` is non-empty and does not match any predefined name. */
function isCustomValue(value: string, options: MissionEntry[]): boolean {
  if (!value) return false;
  return !options.some((o) => o.name === value && o.id !== 'custom');
}

/**
 * Dropdown + optional custom text input for mission selection.
 * The description for a selected predefined mission is shown inline.
 */
export function MissionSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Enter custom name…',
}: MissionSelectProps) {
  const baseId = useId();
  const selectId = `${baseId}-select`;
  const customInputId = `${baseId}-custom`;

  const showCustomInput = isCustomValue(value, options);
  const selectValue = showCustomInput ? CUSTOM_VALUE : value;

  const selectedOption = options.find(
    (o) => o.name === value && o.id !== 'custom'
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosen = e.target.value;
    if (chosen === CUSTOM_VALUE || chosen === '') {
      // Switch to custom input — clear the stored value so the text field is
      // shown empty and the player can type a new name.
      onChange('');
    } else {
      onChange(chosen);
    }
  };

  return (
    <div className="mission-select">
      <label className="mission-select-label" htmlFor={selectId}>
        {label}
      </label>

      <select
        id={selectId}
        className="mission-select-dropdown"
        value={selectValue}
        onChange={handleSelectChange}
        aria-label={label}
      >
        <option value="">— Select {label} —</option>
        {options
          .filter((o) => o.id !== 'custom')
          .map((o) => (
            <option key={o.id} value={o.name}>
              {o.name}
            </option>
          ))}
        <option value={CUSTOM_VALUE}>Custom / Other…</option>
      </select>

      {/* Free-text input shown when the current value is not in the list */}
      {showCustomInput && (
        <input
          id={customInputId}
          type="text"
          className="mission-select-custom-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={80}
          aria-label={`Custom ${label} name`}
        />
      )}

      {/* Description reminder for the selected predefined mission */}
      {selectedOption?.description && (
        <p className="mission-select-description" aria-live="polite">
          📋 {selectedOption.description}
        </p>
      )}
    </div>
  );
}
