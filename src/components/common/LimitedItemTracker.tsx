/**
 * Component for tracking and displaying limited use items (weapons, equipment)
 */

import { useState } from 'react';
import styles from './LimitedItemTracker.module.css';

interface LimitedItemTrackerProps {
  /** Display name of the item */
  name: string;
  /** Maximum number of uses */
  maxUses: number;
  /** Current uses remaining */
  usesRemaining: number;
  /** Callback when item is used */
  onUse: () => void;
  /** Content to display when item is not collapsed */
  children: React.ReactNode;
}

export function LimitedItemTracker({
  name,
  maxUses,
  usesRemaining,
  onUse,
  children,
}: LimitedItemTrackerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isExpended = usesRemaining <= 0;

  const handleToggleCollapse = () => {
    if (isExpended) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleUse = () => {
    if (usesRemaining > 0) {
      onUse();
      // Auto-collapse when expended
      if (usesRemaining - 1 <= 0) {
        setIsCollapsed(true);
      }
    }
  };

  return (
    <div
      className={`${styles.limitedItemContainer} ${isExpended ? styles.expended : ''}`}
    >
      <div
        className={`${styles.limitedItemHeader} ${isExpended && isCollapsed ? styles.collapsed : ''}`}
        onClick={handleToggleCollapse}
      >
        <div className={styles.limitedItemTitle}>
          {isExpended && isCollapsed && (
            <span className={styles.collapseIcon}>▶</span>
          )}
          {isExpended && !isCollapsed && (
            <span className={styles.collapseIcon}>▼</span>
          )}
          <span className={styles.limitedItemName}>{name}</span>
          <span
            className={`${styles.limitedBadge} ${isExpended ? styles.expended : ''}`}
          >
            {isExpended ? '❌ EXPENDED' : `⚠️ Limited ${maxUses}`}
          </span>
        </div>
        <div className={styles.limitedItemControls}>
          <span className={styles.usageDisplay}>
            {usesRemaining}/{maxUses} uses
          </span>
          <button
            className={styles.useButton}
            onClick={(e) => {
              e.stopPropagation();
              handleUse();
            }}
            disabled={isExpended}
            aria-label={`Use ${name}`}
          >
            {isExpended ? 'Used' : 'Use'}
          </button>
        </div>
      </div>
      {(!isExpended || !isCollapsed) && (
        <div
          className={`${styles.limitedItemContent} ${isExpended && isCollapsed ? styles.hidden : ''}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
