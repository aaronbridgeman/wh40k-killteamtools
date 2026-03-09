/**
 * EventEquipmentTracker — equipment selection and usage tracking per game.
 *
 * Renders the Plague Marines faction equipment items (sourced from the
 * loaded faction data) together with any universal equipment. Blight Grenade
 * uses are tracked with a simple counter.
 *
 * Kill Team rules allow a maximum of 4 equipment items per kill team across
 * faction and universal equipment combined. This limit is enforced here.
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
      // Enforce 4-item maximum across faction and universal equipment
      if (
        selectedEquipmentIds.length >=
        QUICK_PLAY_DEFAULTS.MAX_EQUIPMENT_SELECTIONS
      ) {
        return;
      }
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
    // Disable selection of additional items once the limit is reached
    const isDisabled =
      !isSelected &&
      selectedEquipmentIds.length >=
        QUICK_PLAY_DEFAULTS.MAX_EQUIPMENT_SELECTIONS;

    return (
      <div key={item.id}>
        <label
          className={`equipment-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
          htmlFor={checkboxId}
        >
          <input
            type="checkbox"
            id={checkboxId}
            className="equipment-checkbox"
            checked={isSelected}
            onChange={() => handleToggle(item)}
            disabled={isDisabled}
            aria-label={`Select ${item.name}`}
            aria-disabled={isDisabled}
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
              with +1 Hit stat (4+ → 3+) and the Toxic rule.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="equipment-tracker">
      {/* 4-item limit warning */}
      {selectedEquipmentIds.length >=
        QUICK_PLAY_DEFAULTS.MAX_EQUIPMENT_SELECTIONS && (
        <p className="equipment-limit-warning" role="status" aria-live="polite">
          ⚠️ Maximum {QUICK_PLAY_DEFAULTS.MAX_EQUIPMENT_SELECTIONS} equipment
          items selected. Deselect an item to choose a different one.
        </p>
      )}

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

      {selectedEquipmentIds.includes(QUICK_PLAY_DEFAULTS.KRAK_GRENADES_ID) && (
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--nurgle-text-muted)',
            fontStyle: 'italic',
            marginTop: '0.5rem',
          }}
        >
          Bombardier&apos;s operative card now shows Krak Grenades with 3+ Hit
          stat (Grenadier ability — unlimited use).
        </p>
      )}
    </div>
  );
}
