/**
 * Component for selecting operatives and their weapon loadouts
 */

import { useState } from 'react';
import { Operative, Weapon, SelectedOperative, Faction } from '@/types';
import { canAddOperative } from '@/services/teamBuilder';
import { WeaponLoadoutSelector } from './WeaponLoadoutSelector';
import styles from './OperativeSelector.module.css';

interface OperativeSelectorProps {
  operatives: Operative[];
  weapons: Weapon[];
  selectedOperatives: SelectedOperative[];
  onAddOperative: (operative: Operative, weaponIds: string[]) => void;
  onRemoveOperative: (selectionId: string) => void;
  faction: Faction;
}

export function OperativeSelector({
  operatives,
  weapons,
  selectedOperatives,
  onAddOperative,
  onRemoveOperative,
  faction,
}: OperativeSelectorProps) {
  const [selectingOperative, setSelectingOperative] =
    useState<Operative | null>(null);
  const [editingSelection, setEditingSelection] =
    useState<SelectedOperative | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddOperative = (operative: Operative) => {
    setSelectingOperative(operative);
  };

  const getAddButtonState = (
    operative: Operative
  ): { disabled: boolean; title?: string } => {
    const currentTeam = selectedOperatives.map((s) => s.operative);
    const result = canAddOperative(faction, currentTeam, operative);

    return {
      disabled: !result.canAdd,
      title: result.reason,
    };
  };

  const handleConfirmWeapons = (weaponNames: string[]) => {
    // Convert weapon names to IDs
    const weaponIds = weaponNames
      .map((name) => {
        const weapon = weapons.find((w) => w.name === name);
        return weapon?.id;
      })
      .filter((id): id is string => id !== undefined);

    if (selectingOperative) {
      onAddOperative(selectingOperative, weaponIds);
      setSelectingOperative(null);
    } else if (editingSelection) {
      // For editing, we'd need a new callback - for now just close
      setEditingSelection(null);
    }
  };

  const handleCancelWeaponSelection = () => {
    setSelectingOperative(null);
    setEditingSelection(null);
  };

  const getWeaponName = (weaponId: string): string => {
    const weapon = weapons.find((w) => w.id === weaponId);
    return weapon?.name || weaponId;
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.headerButton}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
        <h3 className={styles.headerTitle}>Select Operatives</h3>
        <span className={styles.count}>
          {selectedOperatives.length}
          {faction.restrictions.maxOperatives
            ? ` / ${faction.restrictions.maxOperatives}`
            : ''}
        </span>
      </button>

      {isExpanded && (
        <>
          <div className={styles.availableOperatives}>
            <h4>Available Operatives</h4>
            <div className={styles.operativesList}>
              {operatives.map((operative) => {
                const buttonState = getAddButtonState(operative);
                return (
                  <div key={operative.id} className={styles.operativeItem}>
                    <div className={styles.operativeInfo}>
                      <strong>{operative.name}</strong>
                      <span className={styles.operativeType}>{operative.type}</span>
                    </div>
                    <button
                      onClick={() => handleAddOperative(operative)}
                      disabled={buttonState.disabled}
                      title={buttonState.title}
                      className={styles.addButton}
                      aria-label={`Add ${operative.name}`}
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.selectedOperatives}>
            <h4>Selected Operatives</h4>
            {selectedOperatives.length === 0 ? (
              <p className={styles.emptyMessage}>No operatives selected yet</p>
            ) : (
              <div className={styles.selectedList}>
                {selectedOperatives.map((selected) => (
                  <div key={selected.selectionId} className={styles.selectedItem}>
                    <div className={styles.selectedInfo}>
                      <strong>{selected.operative.name}</strong>
                      <div className={styles.weapons}>
                        {selected.selectedWeaponIds.map((weaponId) => (
                          <span key={weaponId} className={styles.weaponBadge}>
                            {getWeaponName(weaponId)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveOperative(selected.selectionId)}
                      className={styles.removeButton}
                      aria-label={`Remove ${selected.operative.name}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Weapon selection modal */}
      {selectingOperative && (
        <WeaponLoadoutSelector
          operative={selectingOperative}
          onConfirm={handleConfirmWeapons}
          onCancel={handleCancelWeaponSelection}
        />
      )}

      {editingSelection && (
        <WeaponLoadoutSelector
          operative={editingSelection.operative}
          initialSelection={editingSelection.selectedWeaponIds}
          onConfirm={handleConfirmWeapons}
          onCancel={handleCancelWeaponSelection}
        />
      )}
    </div>
  );
}
