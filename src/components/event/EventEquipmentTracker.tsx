/**
 * EventEquipmentTracker — equipment selection and usage tracking per game.
 *
 * Renders the three Plague Marines faction equipment items (sourced from the
 * loaded faction data). Blight Grenade uses are tracked with a simple
 * counter; the LimitedItemTracker component is not used here because the
 * tracker integrates tightly with equipment selection state and uses a
 * custom inline display that better suits the event app's compact layout.
 *
 * @see QUICK_PLAY_EVENT_SPEC.md — Equipment Selection & Tracking
 */

import { Faction, Equipment } from '@/types';
import { QUICK_PLAY_DEFAULTS } from '@/constants';
import './EventEquipmentTracker.css';

interface EventEquipmentTrackerProps {
  /** Loaded Plague Marines faction data (provides faction equipment list) */
  faction: Faction;
  /** Universal (generic) equipment items available to any faction */
  universalEquipment: Equipment[];
  /** IDs of currently selected equipment items */
  selectedEquipmentIds: string[];
  /** Remaining Blight Grenade uses for this game */
  blightGrenadeUsesRemaining: number;
  /**
   * Called when equipment selection or grenade usage changes.
   * @param selectedEquipmentIds - Updated list of selected equipment IDs
   * @param blightGrenadeUsesRemaining - Updated grenade use count
   */
  onChange: (
    selectedEquipmentIds: string[],
    blightGrenadeUsesRemaining: number
  ) => void;
}

/**
 * Renders faction equipment items with toggle selection.
 * Tracks Blight Grenade uses inline.
 */
export function EventEquipmentTracker({
  faction,
  universalEquipment,
  selectedEquipmentIds,
  blightGrenadeUsesRemaining,
  onChange,
}: EventEquipmentTrackerProps) {
  const factionEquipment: Equipment[] = faction.equipment ?? [];
  const grenadeSelected = selectedEquipmentIds.includes(
    QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID
  );

  const handleToggle = (item: Equipment) => {
    const isSelected = selectedEquipmentIds.includes(item.id);
    let updated: string[];
    let grenadeUses = blightGrenadeUsesRemaining;

    if (isSelected) {
      // Deselect
      updated = selectedEquipmentIds.filter((id) => id !== item.id);
      // Reset grenade uses when deselecting
      if (item.id === QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID) {
        grenadeUses = QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES;
      }
    } else {
      // Select
      updated = [...selectedEquipmentIds, item.id];
    }

    onChange(updated, grenadeUses);
  };

  const handleUseGrenade = () => {
    if (blightGrenadeUsesRemaining > 0) {
      onChange(selectedEquipmentIds, blightGrenadeUsesRemaining - 1);
    }
  };

  /** Renders a single equipment item row with checkbox and optional grenade tracker */
  const renderEquipmentItem = (item: Equipment) => {
    const isSelected = selectedEquipmentIds.includes(item.id);
    const isGrenades = item.id === QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID;
    const checkboxId = `equip-${item.id}`;

    return (
      <div key={item.id}>
        <label
          className={`equipment-item ${isSelected ? 'selected' : ''}`}
          htmlFor={checkboxId}
        >
          <input
            type="checkbox"
            id={checkboxId}
            className="equipment-checkbox"
            checked={isSelected}
            onChange={() => handleToggle(item)}
            aria-label={`Select ${item.name}`}
          />
          <div className="equipment-info">
            <p className={`equipment-name ${isSelected ? 'selected' : ''}`}>
              {item.name}
            </p>
            <p className="equipment-description">{item.description}</p>
          </div>
        </label>

        {/* Blight Grenade usage tracker (shown when grenades are selected) */}
        {isGrenades && isSelected && (
          <div className="grenade-tracker">
            <p className="grenade-tracker-title">💥 Blight Grenade Uses</p>
            <div className="grenade-uses">
              <span className="uses-label">Remaining:</span>
              <span
                className={`uses-count ${blightGrenadeUsesRemaining === 0 ? 'expended' : ''}`}
                aria-label={`${blightGrenadeUsesRemaining} of ${QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES} grenade uses remaining`}
              >
                {blightGrenadeUsesRemaining} /{' '}
                {QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES}
              </span>
              <button
                className="use-grenade-button"
                onClick={handleUseGrenade}
                disabled={blightGrenadeUsesRemaining === 0}
                aria-label="Use one Blight Grenade (counts against battle limit)"
              >
                Use Grenade
              </button>
            </div>
            <p className="grenade-note">
              ℹ️ The Bombardier&apos;s grenades do not count towards this limit
              (Grenadier ability). His grenades are shown on his operative card
              with +1 Hit stat (4+ → 3+).
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="equipment-tracker">
      {/* Faction-specific equipment */}
      {factionEquipment.length > 0 && (
        <div className="equipment-group">
          <p className="equipment-group-label">☠️ Faction Equipment</p>
          {factionEquipment.map(renderEquipmentItem)}
        </div>
      )}

      {/* Universal (generic) equipment */}
      {universalEquipment.length > 0 && (
        <div className="equipment-group">
          <p className="equipment-group-label">🎒 Generic Equipment</p>
          {universalEquipment.map(renderEquipmentItem)}
        </div>
      )}

      {factionEquipment.length === 0 && universalEquipment.length === 0 && (
        <p style={{ color: 'var(--nurgle-text-muted)' }}>
          No equipment available.
        </p>
      )}

      {grenadeSelected && (
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--nurgle-text-muted)',
            fontStyle: 'italic',
            marginTop: '0.5rem',
          }}
        >
          Bombardier&apos;s operative card now shows Blight Grenades with 3+ Hit
          stat. Scroll up to the roster to see the updated card.
        </p>
      )}
    </div>
  );
}
