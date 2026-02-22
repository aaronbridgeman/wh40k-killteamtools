import { GameTrackingState, OperativeWoundState } from '@/types/game';
import { SelectedOperative } from '@/types/team';
import { shouldBeInjured } from '@/services/injuredCalculator';
import './GameManagement.css';

interface GameManagementProps {
  gameTracking: GameTrackingState;
  alphaOperatives: SelectedOperative[];
  bravoOperatives: SelectedOperative[];
  onUpdateGameTracking: (gameTracking: GameTrackingState) => void;
}

export function GameManagement({
  gameTracking,
  alphaOperatives,
  bravoOperatives,
  onUpdateGameTracking,
}: GameManagementProps) {
  const handleTurningPointChange = (delta: number) => {
    const newTP = Math.max(1, Math.min(4, gameTracking.turningPoint + delta));
    onUpdateGameTracking({
      ...gameTracking,
      turningPoint: newTP,
    });
  };

  const handleInitiativeChange = (team: 'alpha' | 'bravo') => {
    onUpdateGameTracking({
      ...gameTracking,
      initiative: team,
    });
  };

  const handleCommandPointsChange = (
    team: 'alpha' | 'bravo',
    delta: number
  ) => {
    const key = team === 'alpha' ? 'alphaCommandPoints' : 'bravoCommandPoints';
    const newCP = Math.max(0, gameTracking[key] + delta);
    onUpdateGameTracking({
      ...gameTracking,
      [key]: newCP,
    });
  };

  const handleWoundsChange = (
    team: 'alpha' | 'bravo',
    selectionId: string,
    delta: number
  ) => {
    const woundsKey =
      team === 'alpha' ? 'alphaOperativeWounds' : 'bravoOperativeWounds';
    const operatives = team === 'alpha' ? alphaOperatives : bravoOperatives;

    // Find the operative to get max wounds
    const operative = operatives.find((op) => op.selectionId === selectionId);
    if (!operative) return;

    const maxWounds = operative.operative.stats.wounds;
    const woundStates = gameTracking[woundsKey];
    const existingIndex = woundStates.findIndex(
      (w) => w.selectionId === selectionId
    );

    let newWoundStates: OperativeWoundState[];
    if (existingIndex >= 0) {
      // Update existing
      const newWounds = Math.max(
        0,
        Math.min(maxWounds, woundStates[existingIndex].currentWounds + delta)
      );
      // Auto-detect injured status based on wounds
      const autoInjured = shouldBeInjured(newWounds, maxWounds);
      // Preserve manual override if injured was explicitly set
      const currentState = woundStates[existingIndex];
      const injured = currentState.injured !== undefined 
        ? currentState.injured  // Keep manual toggle if set
        : autoInjured;           // Otherwise use auto-detection
      
      newWoundStates = [...woundStates];
      newWoundStates[existingIndex] = {
        ...newWoundStates[existingIndex],
        currentWounds: newWounds,
        injured: autoInjured || injured, // Mark injured if auto-detected OR manually set
      };
    } else {
      // Create new entry
      const newWounds = Math.max(0, Math.min(maxWounds, maxWounds + delta));
      const autoInjured = shouldBeInjured(newWounds, maxWounds);
      newWoundStates = [
        ...woundStates,
        {
          selectionId,
          currentWounds: newWounds,
          maxWounds,
          injured: autoInjured,
        },
      ];
    }

    onUpdateGameTracking({
      ...gameTracking,
      [woundsKey]: newWoundStates,
    });
  };

  const handleInjuredToggle = (
    team: 'alpha' | 'bravo',
    selectionId: string
  ) => {
    const woundsKey =
      team === 'alpha' ? 'alphaOperativeWounds' : 'bravoOperativeWounds';
    const operatives = team === 'alpha' ? alphaOperatives : bravoOperatives;

    // Find the operative to get max wounds
    const operative = operatives.find((op) => op.selectionId === selectionId);
    if (!operative) return;

    const maxWounds = operative.operative.stats.wounds;
    const woundStates = gameTracking[woundsKey];
    const existingIndex = woundStates.findIndex(
      (w) => w.selectionId === selectionId
    );

    let newWoundStates: OperativeWoundState[];
    if (existingIndex >= 0) {
      // Toggle existing injured status
      newWoundStates = [...woundStates];
      newWoundStates[existingIndex] = {
        ...newWoundStates[existingIndex],
        injured: !newWoundStates[existingIndex].injured,
      };
    } else {
      // Create new entry with injured = true
      newWoundStates = [
        ...woundStates,
        {
          selectionId,
          currentWounds: maxWounds,
          maxWounds,
          injured: true,
        },
      ];
    }

    onUpdateGameTracking({
      ...gameTracking,
      [woundsKey]: newWoundStates,
    });
  };

  const getOperativeWounds = (
    team: 'alpha' | 'bravo',
    selectionId: string,
    maxWounds: number
  ): number => {
    const woundsKey =
      team === 'alpha' ? 'alphaOperativeWounds' : 'bravoOperativeWounds';
    const woundState = gameTracking[woundsKey].find(
      (w) => w.selectionId === selectionId
    );
    return woundState ? woundState.currentWounds : maxWounds;
  };

  const getOperativeInjuredStatus = (
    team: 'alpha' | 'bravo',
    selectionId: string
  ): boolean => {
    const woundsKey =
      team === 'alpha' ? 'alphaOperativeWounds' : 'bravoOperativeWounds';
    const woundState = gameTracking[woundsKey].find(
      (w) => w.selectionId === selectionId
    );
    return woundState?.injured || false;
  };

  return (
    <div className="game-management">
      <h2>Game Management</h2>

      {/* Turning Point */}
      <section className="tracking-section">
        <h3>Turning Point</h3>
        <div className="tracker-control">
          <button
            className="control-button"
            onClick={() => handleTurningPointChange(-1)}
            disabled={gameTracking.turningPoint <= 1}
            aria-label="Decrease turning point"
          >
            −
          </button>
          <span className="tracker-value">{gameTracking.turningPoint}</span>
          <button
            className="control-button"
            onClick={() => handleTurningPointChange(1)}
            disabled={gameTracking.turningPoint >= 4}
            aria-label="Increase turning point"
          >
            +
          </button>
        </div>
      </section>

      {/* Initiative */}
      <section className="tracking-section">
        <h3>Initiative</h3>
        <div className="initiative-selector">
          <button
            className={`initiative-button ${gameTracking.initiative === 'alpha' ? 'active' : ''}`}
            onClick={() => handleInitiativeChange('alpha')}
          >
            Kill Team Alpha
          </button>
          <button
            className={`initiative-button ${gameTracking.initiative === 'bravo' ? 'active' : ''}`}
            onClick={() => handleInitiativeChange('bravo')}
          >
            Kill Team Bravo
          </button>
        </div>
      </section>

      {/* Command Points */}
      <section className="tracking-section">
        <h3>Command Points</h3>
        <div className="command-points-grid">
          <div className="team-tracker">
            <h4>Kill Team Alpha</h4>
            <div className="tracker-control">
              <button
                className="control-button"
                onClick={() => handleCommandPointsChange('alpha', -1)}
                disabled={gameTracking.alphaCommandPoints <= 0}
                aria-label="Decrease Alpha command points"
              >
                −
              </button>
              <span className="tracker-value">
                {gameTracking.alphaCommandPoints}
              </span>
              <button
                className="control-button"
                onClick={() => handleCommandPointsChange('alpha', 1)}
                aria-label="Increase Alpha command points"
              >
                +
              </button>
            </div>
          </div>
          <div className="team-tracker">
            <h4>Kill Team Bravo</h4>
            <div className="tracker-control">
              <button
                className="control-button"
                onClick={() => handleCommandPointsChange('bravo', -1)}
                disabled={gameTracking.bravoCommandPoints <= 0}
                aria-label="Decrease Bravo command points"
              >
                −
              </button>
              <span className="tracker-value">
                {gameTracking.bravoCommandPoints}
              </span>
              <button
                className="control-button"
                onClick={() => handleCommandPointsChange('bravo', 1)}
                aria-label="Increase Bravo command points"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Wound Tracking */}
      <section className="tracking-section">
        <h3>Wound Tracking</h3>
        <div className="wound-tracking-grid">
          {/* Alpha Team */}
          <div className="team-wounds">
            <h4>Kill Team Alpha</h4>
            {alphaOperatives.length === 0 ? (
              <p className="no-operatives">No operatives selected</p>
            ) : (
              <div className="operative-wounds-list">
                {alphaOperatives.map((selected) => {
                  const currentWounds = getOperativeWounds(
                    'alpha',
                    selected.selectionId,
                    selected.operative.stats.wounds
                  );
                  const isInjured = getOperativeInjuredStatus(
                    'alpha',
                    selected.selectionId
                  );
                  return (
                    <div
                      key={selected.selectionId}
                      className={`operative-wound-tracker ${isInjured ? 'injured' : ''}`}
                    >
                      <div className="operative-info">
                        <span className="operative-name">
                          {selected.operative.name}
                        </span>
                        {isInjured && (
                          <span 
                            className="injured-badge" 
                            title="Injured: Movement -2&quot;, Hit stat +1"
                          >
                            🩹 INJURED
                          </span>
                        )}
                      </div>
                      <div className="wound-controls">
                        <div className="tracker-control small">
                          <button
                            className="control-button small"
                            onClick={() =>
                              handleWoundsChange(
                                'alpha',
                                selected.selectionId,
                                -1
                              )
                            }
                            disabled={currentWounds <= 0}
                            aria-label={`Decrease wounds for ${selected.operative.name}`}
                          >
                            −
                          </button>
                          <span className="tracker-value small">
                            {currentWounds}/{selected.operative.stats.wounds}
                          </span>
                          <button
                            className="control-button small"
                            onClick={() =>
                              handleWoundsChange('alpha', selected.selectionId, 1)
                            }
                            disabled={
                              currentWounds >= selected.operative.stats.wounds
                            }
                            aria-label={`Increase wounds for ${selected.operative.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className={`injured-toggle ${isInjured ? 'active' : ''}`}
                          onClick={() =>
                            handleInjuredToggle('alpha', selected.selectionId)
                          }
                          title={isInjured ? 'Remove injured status' : 'Mark as injured'}
                          aria-label={`Toggle injured status for ${selected.operative.name}`}
                        >
                          🩹
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bravo Team */}
          <div className="team-wounds">
            <h4>Kill Team Bravo</h4>
            {bravoOperatives.length === 0 ? (
              <p className="no-operatives">No operatives selected</p>
            ) : (
              <div className="operative-wounds-list">
                {bravoOperatives.map((selected) => {
                  const currentWounds = getOperativeWounds(
                    'bravo',
                    selected.selectionId,
                    selected.operative.stats.wounds
                  );
                  const isInjured = getOperativeInjuredStatus(
                    'bravo',
                    selected.selectionId
                  );
                  return (
                    <div
                      key={selected.selectionId}
                      className={`operative-wound-tracker ${isInjured ? 'injured' : ''}`}
                    >
                      <div className="operative-info">
                        <span className="operative-name">
                          {selected.operative.name}
                        </span>
                        {isInjured && (
                          <span 
                            className="injured-badge" 
                            title="Injured: Movement -2&quot;, Hit stat +1"
                          >
                            🩹 INJURED
                          </span>
                        )}
                      </div>
                      <div className="wound-controls">
                        <div className="tracker-control small">
                          <button
                            className="control-button small"
                            onClick={() =>
                              handleWoundsChange(
                                'bravo',
                                selected.selectionId,
                                -1
                              )
                            }
                            disabled={currentWounds <= 0}
                            aria-label={`Decrease wounds for ${selected.operative.name}`}
                          >
                            −
                          </button>
                          <span className="tracker-value small">
                            {currentWounds}/{selected.operative.stats.wounds}
                          </span>
                          <button
                            className="control-button small"
                            onClick={() =>
                              handleWoundsChange('bravo', selected.selectionId, 1)
                            }
                            disabled={
                              currentWounds >= selected.operative.stats.wounds
                            }
                            aria-label={`Increase wounds for ${selected.operative.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className={`injured-toggle ${isInjured ? 'active' : ''}`}
                          onClick={() =>
                            handleInjuredToggle('bravo', selected.selectionId)
                          }
                          title={isInjured ? 'Remove injured status' : 'Mark as injured'}
                          aria-label={`Toggle injured status for ${selected.operative.name}`}
                        >
                          🩹
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
