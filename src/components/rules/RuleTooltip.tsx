/**
 * Rule expansion tooltip component
 */

import { useState } from 'react';
import { expandWeaponRule } from '@/services/ruleExpander';
import styles from './RuleTooltip.module.css';

interface RuleTooltipProps {
  ruleName: string;
  value?: number | string;
}

export function RuleTooltip({ ruleName, value }: RuleTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const expansion = expandWeaponRule(ruleName, value);

  if (!expansion) {
    return <span className={styles.unknownRule}>{ruleName}</span>;
  }

  const displayText = value !== undefined ? `${ruleName} ${value}` : ruleName;

  return (
    <span
      className={styles.container}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <span className={styles.ruleName}>{displayText}</span>
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTitle}>{expansion.name}</div>
          <div className={styles.tooltipDescription}>
            {expansion.description}
          </div>
        </div>
      )}
    </span>
  );
}
