/**
 * Modal component for selecting a chapter tactic
 */

import { useEffect, useRef } from 'react';
import { ChapterTactic } from '@/types';
import styles from './ChapterTacticModal.module.css';

interface ChapterTacticModalProps {
  isOpen: boolean;
  tactics: ChapterTactic[];
  selectedTacticId: string;
  disabledTacticId: string;
  onSelect: (tacticId: string) => void;
  onClose: () => void;
  title: string;
}

export function ChapterTacticModal({
  isOpen,
  tactics,
  selectedTacticId,
  disabledTacticId,
  onSelect,
  onClose,
  title,
}: ChapterTacticModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (tacticId: string) => {
    onSelect(tacticId);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.header}>
          <h3 id="modal-title" className={styles.title}>{title}</h3>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className={styles.content}>
          {tactics.map((tactic) => {
            const isSelected = tactic.id === selectedTacticId;
            const isDisabled = tactic.id === disabledTacticId;

            return (
              <button
                key={tactic.id}
                className={`${styles.tacticCard} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                onClick={() => !isDisabled && handleSelect(tactic.id)}
                disabled={isDisabled}
              >
                <div className={styles.tacticHeader}>
                  <h4 className={styles.tacticName}>{tactic.name}</h4>
                  {isSelected && (
                    <span className={styles.selectedBadge}>Selected</span>
                  )}
                  {isDisabled && (
                    <span className={styles.disabledBadge}>Unavailable</span>
                  )}
                </div>
                <p className={styles.tacticEffect}>
                  <strong>Effect:</strong> {tactic.effect}
                </p>
                {tactic.description && (
                  <p className={styles.tacticDescription}>{tactic.description}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
