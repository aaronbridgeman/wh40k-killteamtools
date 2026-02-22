/**
 * Component for selecting equipment
 */

import { useState } from 'react';
import { Equipment } from '@/types';
import { EquipmentCard } from './EquipmentCard';
import styles from './EquipmentSelector.module.css';

interface EquipmentSelectorProps {
  universalEquipment: Equipment[];
  factionEquipment: Equipment[];
  selectedEquipment: Equipment[];
  onEquipmentChange: (equipment: Equipment[]) => void;
  maxEquipment?: number;
}

export function EquipmentSelector({
  universalEquipment,
  factionEquipment,
  selectedEquipment,
  onEquipmentChange,
  maxEquipment = 4,
}: EquipmentSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllEquipment, setShowAllEquipment] = useState(true);

  const handleEquipmentSelect = (equipment: Equipment) => {
    const isSelected = selectedEquipment.some((e) => e.id === equipment.id);

    if (isSelected) {
      // Remove equipment
      onEquipmentChange(selectedEquipment.filter((e) => e.id !== equipment.id));
    } else {
      // Add equipment if under limit
      if (selectedEquipment.length < maxEquipment) {
        onEquipmentChange([...selectedEquipment, equipment]);
      }
    }
  };

  const handleClearAll = () => {
    onEquipmentChange([]);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.sectionHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
        <h3 className={styles.sectionTitle}>
          Equipment Selection ({selectedEquipment.length}/{maxEquipment})
        </h3>
      </button>

      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.controls}>
            <label className={styles.filterLabel}>
              <input
                type="checkbox"
                checked={showAllEquipment}
                onChange={(e) => setShowAllEquipment(e.target.checked)}
                className={styles.checkbox}
              />
              Show all equipment
            </label>
            {selectedEquipment.length > 0 && (
              <button
                onClick={handleClearAll}
                className={styles.clearButton}
              >
                Clear All
              </button>
            )}
          </div>

          {selectedEquipment.length >= maxEquipment && (
            <div className={styles.limitWarning}>
              Maximum equipment limit reached ({maxEquipment}). Deselect equipment to choose different options.
            </div>
          )}

          <div className={styles.equipmentInfo}>
            <p className={styles.infoText}>
              Generally, a player selects up to {maxEquipment} equipment options in total for their kill team.
              Universal equipment is available to all factions, while faction-specific equipment
              requires matching keywords.
            </p>
          </div>

          <div className={styles.equipmentSection}>
            <h4 className={styles.categoryTitle}>Universal Equipment</h4>
            <div className={styles.equipmentGrid}>
              {universalEquipment.filter((eq) => 
                showAllEquipment || selectedEquipment.some((e) => e.id === eq.id)
              ).map((equipment) => (
                <EquipmentCard
                  key={equipment.id}
                  equipment={equipment}
                  isSelected={selectedEquipment.some((e) => e.id === equipment.id)}
                  onSelect={handleEquipmentSelect}
                  showSelection={true}
                />
              ))}
            </div>
          </div>

          {factionEquipment.length > 0 && (
            <div className={styles.equipmentSection}>
              <h4 className={styles.categoryTitle}>Faction-Specific Equipment</h4>
              <div className={styles.equipmentGrid}>
                {factionEquipment.filter((eq) => 
                  showAllEquipment || selectedEquipment.some((e) => e.id === eq.id)
                ).map((equipment) => (
                  <EquipmentCard
                    key={equipment.id}
                    equipment={equipment}
                    isSelected={selectedEquipment.some((e) => e.id === equipment.id)}
                    onSelect={handleEquipmentSelect}
                    showSelection={true}
                  />
                ))}
              </div>
            </div>
          )}

          {!showAllEquipment && selectedEquipment.length === 0 && (
            <div className={styles.emptyState}>
              <p>No equipment selected. Check &quot;Show all equipment&quot; to browse available options.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
