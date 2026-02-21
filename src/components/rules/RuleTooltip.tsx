/**
 * Rule expansion tooltip component with keyboard accessibility
 */

import { useState, useRef, useEffect } from 'react';
import { expandWeaponRule } from '@/services/ruleExpander';
import styles from './RuleTooltip.module.css';

interface RuleTooltipProps {
  ruleName: string;
  value?: number | string;
}

export function RuleTooltip({ ruleName, value }: RuleTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const expansion = expandWeaponRule(ruleName, value);

  // Close tooltip on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showTooltip) {
        setShowTooltip(false);
        buttonRef.current?.focus();
      }
    };

    if (showTooltip) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showTooltip]);

  if (!expansion) {
    return <span className={styles.unknownRule}>{ruleName}</span>;
  }

  const displayText = value !== undefined ? `${ruleName} ${value}` : ruleName;
  const tooltipId = `tooltip-${ruleName.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <span className={styles.container}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.ruleButton}
        aria-describedby={showTooltip ? tooltipId : undefined}
        aria-expanded={showTooltip}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={(e) => {
          // Only hide if focus is leaving the container
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setShowTooltip(false);
          }
        }}
      >
        <span className={styles.ruleName}>{displayText}</span>
      </button>
      {showTooltip && (
        <div id={tooltipId} role="tooltip" className={styles.tooltip}>
          <div className={styles.tooltipTitle}>{expansion.name}</div>
          <div className={styles.tooltipDescription}>
            {expansion.description}
          </div>
        </div>
      )}
    </span>
  );
}
