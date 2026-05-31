import { useMemo } from 'react';
import type { SoloTeam, SoloListOperative, TransferHint, TransferDirection } from '../SoloJointOpsView';

/**
 * TeamOperativeTransfer - UI for transferring operatives between available and selected lists.
 * @param team The team being edited
 * @param sourceOperatives All operatives available for selection
 * @param selectedOperatives Operatives currently selected
 * @param transferHint Optional transfer animation hint
 * @param onMoveOperative Callback for moving an operative
 */
export function TeamOperativeTransfer({
  team,
  sourceOperatives,
  selectedOperatives,
  transferHint,
  onMoveOperative,
}: {
  team: SoloTeam | null;
  sourceOperatives: SoloListOperative[];
  selectedOperatives: SoloListOperative[];
  transferHint: TransferHint | null;
  onMoveOperative: (operativeId: string, direction: TransferDirection) => void;
}) {
  const selectedIds = useMemo(
    () => new Set(selectedOperatives.map((operative) => operative.id)),
    [selectedOperatives]
  );

  const unselectedOperatives = useMemo(
    () =>
      sourceOperatives.filter((operative) => !selectedIds.has(operative.id)),
    [selectedIds, sourceOperatives]
  );

  const getTransferClassName = (
    operativeId: string,
    expectedDirection: TransferDirection
  ) => {
    if (!transferHint) return '';
    const hasHint =
      transferHint.teamId === team?.id &&
      transferHint.operativeId === operativeId &&
      transferHint.direction === expectedDirection;
    if (!hasHint) return '';
    return expectedDirection === 'to-selected'
      ? 'transfer-in-right'
      : 'transfer-in-left';
  };

  return (
    <div className="team-transfer">
      <div className="team-transfer-grid">
        <section className="team-transfer-column">
          <h5>Available Operatives</h5>
          <ul
            className="team-transfer-list"
            aria-label={`${team?.name ?? 'Team'} available operatives`}
          >
            {unselectedOperatives.length === 0 ? (
              <li className="team-transfer-empty">No available operatives.</li>
            ) : (
              unselectedOperatives.map((operative) => (
                <li
                  key={operative.id}
                  className={getTransferClassName(
                    operative.id,
                    'to-unselected'
                  )}
                >
                  <button
                    type="button"
                    className="team-transfer-item"
                    onClick={() => onMoveOperative(operative.id, 'to-selected')}
                  >
                    <span>{operative.name}</span>
                    <span className="team-transfer-action">Add</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="team-transfer-divider" aria-hidden="true">
          ⇄
        </div>

        <section className="team-transfer-column">
          <h5>Selected Operatives</h5>
          <ul
            className="team-transfer-list team-transfer-list-selected"
            aria-label={`${team?.name ?? 'Team'} selected operatives`}
          >
            {selectedOperatives.length === 0 ? (
              <li className="team-transfer-empty">No selected operatives.</li>
            ) : (
              selectedOperatives.map((operative) => (
                <li
                  key={operative.id}
                  className={getTransferClassName(operative.id, 'to-selected')}
                >
                  <button
                    type="button"
                    className="team-transfer-item"
                    onClick={() =>
                      onMoveOperative(operative.id, 'to-unselected')
                    }
                  >
                    <span>{operative.name}</span>
                    <span className="team-transfer-action">Remove</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
