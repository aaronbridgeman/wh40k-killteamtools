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

import { useState } from 'react';
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
  /** Remaining uses per quantity-limited equipment item, keyed by equipment ID */
  equipmentUsesRemaining: Record<string, number>;
  /**
   * Called when equipment selection or grenade usage changes.
   * @param selectedEquipmentIds - Updated list of selected equipment IDs
   * @param blightGrenadeUsesRemaining - Updated grenade use count
   * @param equipmentUsesRemaining - Updated uses remaining for all quantity-limited items
   */
  onChange: (
    selectedEquipmentIds: string[],
    blightGrenadeUsesRemaining: number,
    equipmentUsesRemaining: Record<string, number>
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
  equipmentUsesRemaining,
  onChange,
}: EventEquipmentTrackerProps) {
  const factionEquipment: Equipment[] = faction.equipment ?? [];
  const grenadeSelected = selectedEquipmentIds.includes(
    QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID
  );

  const atMaxSelection =
    selectedEquipmentIds.length >= QUICK_PLAY_DEFAULTS.MAX_EQUIPMENT_SELECTIONS;

  // When at the equipment limit, auto-collapse to show only selected items.
  // The player can manually expand to swap items.
  const [expanded, setExpanded] = useState(!atMaxSelection);

  const handleToggle = (item: Equipment) => {
    const isSelected = selectedEquipmentIds.includes(item.id);
    let updated: string[];
    let grenadeUses = blightGrenadeUsesRemaining;
    let updatedEquipmentUses = { ...equipmentUsesRemaining };

    if (isSelected) {
      // Deselect
      updated = selectedEquipmentIds.filter((id) => id !== item.id);
      // Reset grenade uses when deselecting
      if (item.id === QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID) {
        grenadeUses = QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES;
      }
      // Reset uses for quantity-limited items on deselect
      if (item.quantity && item.quantity > 1) {
        updatedEquipmentUses = { ...updatedEquipmentUses, [item.id]: item.quantity };
      }
    } else {
      // Enforce 4-item maximum across faction and universal equipment
      if (
        selectedEquipmentIds.length >=
        QUICK_PLAY_DEFAULTS.MAX_EQUIPMENT_SELECTIONS
      ) {
        return;
      }
      // Select — initialize uses for quantity-limited items
      updated = [...selectedEquipmentIds, item.id];
      if (item.quantity && item.quantity > 1 && !(item.id in updatedEquipmentUses)) {
        updatedEquipmentUses = { ...updatedEquipmentUses, [item.id]: item.quantity };
      }
    }

    // Auto-collapse when reaching max; auto-expand when below max
    const newCount = updated.length;
    if (newCount >= QUICK_PLAY_DEFAULTS.MAX_EQUIPMENT_SELECTIONS) {
      setExpanded(false);
    } else {
      setExpanded(true);
    }

    onChange(updated, grenadeUses, updatedEquipmentUses);
  };

  /** Renders a single equipment item row with checkbox */
  const renderEquipmentItem = (item: Equipment) => {
    const isSelected = selectedEquipmentIds.includes(item.id);
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
      </div>
    );
  };

  return (
    <div className="equipment-tracker">
      {/* Collapsed view: show only selected items with an expand button */}
      {atMaxSelection && !expanded ? (
        <>
          <div className="equipment-collapsed-header">
            <span
              className="equipment-limit-badge"
              role="status"
              aria-live="polite"
            >
              ✅ {QUICK_PLAY_DEFAULTS.MAX_EQUIPMENT_SELECTIONS} items selected
            </span>
            <button
              type="button"
              className="equipment-change-btn"
              onClick={() => setExpanded(true)}
              aria-label="Change equipment selection"
            >
              Change
            </button>
          </div>
          {/* Show only selected items so player can deselect */}
          {[...factionEquipment, ...universalEquipment]
            .filter((item) => selectedEquipmentIds.includes(item.id))
            .map(renderEquipmentItem)}
        </>
      ) : (
        <>
          {/* 4-item limit warning when expanded */}
          {atMaxSelection && (
            <div className="equipment-collapsed-header">
              <p
                className="equipment-limit-warning"
                role="status"
                aria-live="polite"
              >
                ⚠️ Maximum {QUICK_PLAY_DEFAULTS.MAX_EQUIPMENT_SELECTIONS}{' '}
                equipment items selected. Deselect an item to choose a different
                one.
              </p>
              <button
                type="button"
                className="equipment-change-btn"
                onClick={() => setExpanded(false)}
                aria-label="Collapse equipment list"
              >
                Collapse
              </button>
            </div>
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
        </>
      )}

      {grenadeSelected && (
        <p className="equipment-hint">
          Bombardier&apos;s operative card now shows Blight Grenades with 3+ Hit
          stat. Scroll up to the roster to see the updated card.
        </p>
      )}

      {selectedEquipmentIds.includes(QUICK_PLAY_DEFAULTS.KRAK_GRENADES_ID) && (
        <p className="equipment-hint">
          Bombardier&apos;s operative card now shows Krak Grenades with 3+ Hit
          stat (Grenadier ability — unlimited use).
        </p>
      )}
    </div>
  );
}
