/**
 * Component for selecting operatives and their weapon loadouts
 */

import { Operative, Weapon, SelectedOperative } from '@/types';
import styles from './OperativeSelector.module.css';

interface OperativeSelectorProps {
  operatives: Operative[];
  weapons: Weapon[];
  selectedOperatives: SelectedOperative[];
  onAddOperative: (operative: Operative, weaponIds: string[]) => void;
  onRemoveOperative: (selectionId: string) => void;
  maxOperatives?: number;
}

export function OperativeSelector({
  operatives,
  weapons,
  selectedOperatives,
  onAddOperative,
  onRemoveOperative,
  maxOperatives,
}: OperativeSelectorProps) {
  const canAddMore =
    !maxOperatives || selectedOperatives.length < maxOperatives;

  const handleAddOperative = (operative: Operative) => {
    // Default to all available weapons for the operative
    onAddOperative(operative, operative.weapons || []);
  };

  const getWeaponName = (weaponId: string): string => {
    const weapon = weapons.find((w) => w.id === weaponId);
    return weapon?.name || weaponId;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Select Operatives</h3>
        <span className={styles.count}>
          {selectedOperatives.length}
          {maxOperatives ? ` / ${maxOperatives}` : ''}
        </span>
      </div>

      <div className={styles.availableOperatives}>
        <h4>Available Operatives</h4>
        <div className={styles.operativesList}>
          {operatives.map((operative) => (
            <div key={operative.id} className={styles.operativeItem}>
              <div className={styles.operativeInfo}>
                <strong>{operative.name}</strong>
                <span className={styles.operativeType}>{operative.type}</span>
              </div>
              <button
                onClick={() => handleAddOperative(operative)}
                disabled={!canAddMore}
                className={styles.addButton}
                aria-label={`Add ${operative.name}`}
              >
                Add
              </button>
            </div>
          ))}
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
    </div>
  );
}
