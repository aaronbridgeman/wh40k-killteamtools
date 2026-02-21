/**
 * Rule expansion tooltip component with keyboard accessibility
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { expandWeaponRule } from '@/services/ruleExpander';
import styles from './RuleTooltip.module.css';

interface RuleTooltipProps {
  ruleName: string;
  value?: number | string;
}

export function RuleTooltip({ ruleName, value }: RuleTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const expansion = expandWeaponRule(ruleName, value);

  // Position tooltip near the click
  const positionTooltip = useCallback(() => {
    if (!buttonRef.current || !tooltipRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Try to position above the button
    let top = buttonRect.top - tooltipRect.height - 8;
    let left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;

    // If tooltip goes off top, position below
    if (top < 8) {
      top = buttonRect.bottom + 8;
    }

    // If tooltip goes off right, align to right edge
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }

    // If tooltip goes off left, align to left edge
    if (left < 8) {
      left = 8;
    }

    // On mobile, use fixed bottom positioning
    if (viewportWidth <= 768) {
      setTooltipPosition(null); // Use CSS positioning
    } else {
      setTooltipPosition({ top, left });
    }
  }, []);

  // Position on mount and when shown
  useEffect(() => {
    if (showTooltip) {
      // Small delay to ensure tooltip is rendered
      setTimeout(positionTooltip, 10);
    }
  }, [showTooltip, positionTooltip]);

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTooltip(!showTooltip);
  };

  return (
    <span className={styles.container}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.ruleButton}
        aria-describedby={showTooltip ? tooltipId : undefined}
        aria-expanded={showTooltip}
        onClick={handleClick}
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
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={styles.tooltip}
          style={
            tooltipPosition
              ? { position: 'fixed', ...tooltipPosition }
              : undefined
          }
        >
          <div className={styles.tooltipTitle}>{expansion.name}</div>
          <div className={styles.tooltipDescription}>
            {expansion.description}
          </div>
        </div>
      )}
    </span>
  );
}
