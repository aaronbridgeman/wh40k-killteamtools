/**
 * MissionSelect — dropdown selector for Kill Team Critical Ops and Tac Ops.
 *
 * Shows a <select> with predefined operation names. If the current value does
 * not match any predefined option, a "Custom / Other" text input is revealed
 * so the player can type a custom operation name.
 *
 * When a predefined option is selected its description is shown below the
 * dropdown as a play-time reminder of the scoring criteria. For entries with
 * rich data (mission_actions, victory_points, additional_rules, reveal_condition)
 * the full reference detail is displayed so players can consult it during play.
 *
 * When options include an `archetype` field the dropdown groups them with
 * HTML <optgroup> elements for easier navigation.
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
 * Groups named (non-custom) options by their `archetype` field.
 * Returns a list of [archetypeName, entries] pairs in insertion order.
 * Entries without an archetype are grouped under the empty-string key.
 */
function groupByArchetype(
  options: MissionEntry[]
): Array<[string, MissionEntry[]]> {
  const named = options.filter((o) => o.id !== 'custom');
  const map = new Map<string, MissionEntry[]>();
  for (const o of named) {
    const key = o.archetype ?? '';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(o);
  }
  return Array.from(map.entries());
}

/**
 * Dropdown + optional custom text input for mission selection.
 * Rich details (mission actions, VP, additional rules, reveal condition) are
 * shown inline when a structured entry is selected. Options are grouped by
 * archetype when the entries include that field.
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

  const hasRichDetail =
    selectedOption &&
    (selectedOption.mission_actions?.length ||
      selectedOption.victory_points?.length ||
      (Array.isArray(selectedOption.additional_rules)
        ? selectedOption.additional_rules.length > 0
        : Boolean(selectedOption.additional_rules)) ||
      Boolean(selectedOption.reveal_condition));

  // Determine whether to use <optgroup> grouping
  const archetypeGroups = groupByArchetype(options);
  const useGroups =
    archetypeGroups.length > 1 || archetypeGroups[0]?.[0] !== '';

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
        {useGroups
          ? archetypeGroups.map(([archetype, ops]) => (
              <optgroup key={archetype || '__ungrouped'} label={archetype}>
                {ops.map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </optgroup>
            ))
          : options
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

      {/* Rich detail panel */}
      {hasRichDetail && selectedOption && (
        <div className="mission-select-detail" aria-live="polite">
          {/* Brief description summary */}
          {selectedOption.description && (
            <p className="mission-select-description">
              📋 {selectedOption.description}
            </p>
          )}

          {/* Reveal condition */}
          {selectedOption.reveal_condition && (
            <div className="mission-select-section">
              <h4 className="mission-select-section-title">👁 Reveal</h4>
              <p className="mission-select-rule-text">
                {selectedOption.reveal_condition}
              </p>
            </div>
          )}

          {/* Additional setup / special rules */}
          {(Array.isArray(selectedOption.additional_rules)
            ? selectedOption.additional_rules.length > 0
            : Boolean(selectedOption.additional_rules)) && (
            <div className="mission-select-section">
              <h4 className="mission-select-section-title">📜 Special Rules</h4>
              {Array.isArray(selectedOption.additional_rules) ? (
                <ul className="mission-select-list">
                  {selectedOption.additional_rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              ) : (
                <p className="mission-select-rule-text">
                  {selectedOption.additional_rules}
                </p>
              )}
            </div>
          )}

          {/* Mission actions */}
          {selectedOption.mission_actions &&
            selectedOption.mission_actions.length > 0 && (
              <div className="mission-select-section">
                <h4 className="mission-select-section-title">
                  ⚡ Mission Actions
                </h4>
                {selectedOption.mission_actions.map((action) => (
                  <div key={action.name} className="mission-select-action">
                    <div className="mission-select-action-header">
                      <span className="mission-select-action-name">
                        {action.name}
                      </span>
                      <span className="mission-select-action-ap">
                        {action.ap_cost}AP
                      </span>
                    </div>
                    <p className="mission-select-action-desc">
                      {action.description}
                    </p>
                    {action.restrictions && (
                      <p className="mission-select-action-restrictions">
                        ⚠️ {action.restrictions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

          {/* Victory points */}
          {selectedOption.victory_points &&
            selectedOption.victory_points.length > 0 && (
              <div className="mission-select-section">
                <h4 className="mission-select-section-title">
                  🏆 Victory Points
                </h4>
                <ul className="mission-select-list">
                  {selectedOption.victory_points.map((vp, i) => (
                    <li key={i}>{vp}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Simple description for entries without rich detail */}
      {!hasRichDetail && selectedOption?.description && (
        <p className="mission-select-description" aria-live="polite">
          📋 {selectedOption.description}
        </p>
      )}
    </div>
  );
}
