/**
 * Component for selecting weapon loadout for an operative
 */

import { useState, useEffect } from 'react';
import { Operative } from '@/types';
import {
  resolveWeaponLoadout,
  getDefaultWeaponSelection,
  WeaponSlot,
} from '@/services/weaponResolver';
import styles from './WeaponLoadoutSelector.module.css';

interface WeaponLoadoutSelectorProps {
  operative: Operative;
  initialSelection?: string[];
  onConfirm: (selectedWeapons: string[]) => void;
  onCancel: () => void;
}

export function WeaponLoadoutSelector({
  operative,
  initialSelection,
  onConfirm,
  onCancel,
}: WeaponLoadoutSelectorProps) {
  const loadout = resolveWeaponLoadout(operative);
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>(
    initialSelection || getDefaultWeaponSelection(operative)
  );
  const [useAlternativeLoadout, setUseAlternativeLoadout] = useState(false);

  // Initialize with alternative loadout if it matches initial selection
  useEffect(() => {
    if (initialSelection && loadout.alternativeLoadouts) {
      for (const alt of loadout.alternativeLoadouts) {
        const altWeapons = [...loadout.fixedWeapons, ...alt.fixed];
        if (
          initialSelection.length === altWeapons.length &&
          initialSelection.every((w) => altWeapons.includes(w))
        ) {
          setUseAlternativeLoadout(true);
          break;
        }
      }
    }
  }, [initialSelection, loadout]);

  const handleSlotChange = (slotId: string, weaponName: string) => {
    // Find the slot
    const slot = loadout.slots.find((s) => s.slotId === slotId);
    if (!slot) return;

    // Remove any previous selection from this slot
    const newSelection = selectedWeapons.filter(
      (w) => !slot.options.includes(w)
    );

    // Add the new selection
    newSelection.push(weaponName);
    setSelectedWeapons(newSelection);
  };

  const handleAlternativeLoadoutToggle = (useAlt: boolean) => {
    setUseAlternativeLoadout(useAlt);
    if (useAlt && loadout.alternativeLoadouts?.[0]) {
      // Set to alternative loadout (using first one for now)
      setSelectedWeapons([
        ...loadout.fixedWeapons,
        ...loadout.alternativeLoadouts[0].fixed,
      ]);
    } else {
      // Reset to default standard loadout
      setSelectedWeapons(getDefaultWeaponSelection(operative));
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedWeapons);
  };

  const getSelectedWeaponForSlot = (slot: WeaponSlot): string => {
    const selected = selectedWeapons.find((w) => slot.options.includes(w));
    return selected || slot.defaultSelection || slot.options[0];
  };

  // If operative has no weapon options, just show a simple message
  if (loadout.slots.length === 0 && !loadout.alternativeLoadouts) {
    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.header}>
            <h3>
              {operative.name} - {operative.type}
            </h3>
            <button
              className={styles.closeButton}
              onClick={onCancel}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.fixedLoadout}>
              <h4>Fixed Loadout</h4>
              {loadout.fixedWeapons.length > 0 ? (
                <ul className={styles.weaponList}>
                  {loadout.fixedWeapons.map((weapon) => (
                    <li key={weapon} className={styles.weaponItem}>
                      {weapon}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noWeapons}>No weapons specified</p>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button className={styles.confirmButton} onClick={handleConfirm}>
              Add Operative
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h3>
            {operative.name} - {operative.type}
          </h3>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {/* Alternative loadout toggle */}
          {loadout.alternativeLoadouts &&
            loadout.alternativeLoadouts.length > 0 && (
              <div className={styles.loadoutToggle}>
                <label className={styles.toggleLabel}>
                  <input
                    type="radio"
                    name="loadout-type"
                    checked={!useAlternativeLoadout}
                    onChange={() => handleAlternativeLoadoutToggle(false)}
                  />
                  <span>Standard Loadout</span>
                </label>
                <label className={styles.toggleLabel}>
                  <input
                    type="radio"
                    name="loadout-type"
                    checked={useAlternativeLoadout}
                    onChange={() => handleAlternativeLoadoutToggle(true)}
                  />
                  <span>Alternative Loadout</span>
                </label>
              </div>
            )}

          {/* Show alternative loadout weapons if selected */}
          {useAlternativeLoadout && loadout.alternativeLoadouts?.[0] && (
            <div className={styles.alternativeLoadout}>
              <h4>Alternative Loadout</h4>
              <ul className={styles.weaponList}>
                {loadout.alternativeLoadouts[0].fixed.map((weapon) => (
                  <li key={weapon} className={styles.weaponItem}>
                    {weapon}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Show standard loadout options if not using alternative */}
          {!useAlternativeLoadout && (
            <>
              {/* Fixed weapons */}
              {loadout.fixedWeapons.length > 0 && (
                <div className={styles.fixedWeapons}>
                  <h4>Fixed Weapons</h4>
                  <ul className={styles.weaponList}>
                    {loadout.fixedWeapons.map((weapon) => (
                      <li key={weapon} className={styles.weaponItem}>
                        {weapon}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weapon slots */}
              {loadout.slots.length > 0 && (
                <div className={styles.weaponSlots}>
                  <h4>Choose Weapons</h4>
                  {loadout.slots.map((slot) => (
                    <div key={slot.slotId} className={styles.slot}>
                      <label className={styles.slotLabel}>{slot.label}</label>
                      <div className={styles.slotOptions}>
                        {slot.options.map((weapon) => (
                          <label key={weapon} className={styles.optionLabel}>
                            <input
                              type="radio"
                              name={slot.slotId}
                              value={weapon}
                              checked={
                                getSelectedWeaponForSlot(slot) === weapon
                              }
                              onChange={() =>
                                handleSlotChange(slot.slotId, weapon)
                              }
                            />
                            <span>{weapon}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Summary of selection */}
          <div className={styles.summary}>
            <h4>Selected Weapons</h4>
            <ul className={styles.weaponList}>
              {selectedWeapons.map((weapon) => (
                <li key={weapon} className={styles.weaponItem}>
                  {weapon}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Add Operative
          </button>
        </div>
      </div>
    </div>
  );
}
