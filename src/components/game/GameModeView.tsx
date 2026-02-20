import { useState, useEffect } from 'react';
import { FactionSelector } from '../faction/FactionSelector';
import { FactionDetails } from '../faction/FactionDetails';
import { OperativeCard } from '../datacard/OperativeCard';
import { OperativeSelector } from '../team/OperativeSelector';
import { SelectedTeamView } from '../team/SelectedTeamView';
import { FactionRulesSelector } from '../team/FactionRulesSelector';
import { loadFaction, FactionId } from '@/services/dataLoader';
import {
  saveGameModeState,
  loadGameModeState,
  getInitialGameModeState,
} from '@/services/teamStorage';
import { Faction, GameModeState, SelectedOperative, Operative } from '@/types';
import './GameModeView.css';

type TeamViewMode = 'faction-info' | 'team-selection';
type ActiveTab = 'management' | 'alpha' | 'bravo';

export function GameModeView() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('management');
  const [teamViewMode, setTeamViewMode] =
    useState<TeamViewMode>('faction-info');
  const [gameModeState, setGameModeState] = useState<GameModeState>(
    getInitialGameModeState()
  );
  const [alphaFaction, setAlphaFaction] = useState<Faction | null>(null);
  const [bravoFaction, setBravoFaction] = useState<Faction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load game mode state from localStorage on mount
  useEffect(() => {
    const savedState = loadGameModeState();
    if (savedState) {
      setGameModeState(savedState);
      // Load factions if they exist
      if (savedState.alpha.factionId) {
        handleFactionSelect(savedState.alpha.factionId as FactionId, 'alpha');
      }
      if (savedState.bravo.factionId) {
        handleFactionSelect(savedState.bravo.factionId as FactionId, 'bravo');
      }
    }
  }, []);

  // Save game mode state to localStorage whenever it changes
  useEffect(() => {
    saveGameModeState(gameModeState);
  }, [gameModeState]);

  const handleFactionSelect = async (
    factionId: FactionId,
    team: 'alpha' | 'bravo'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const loadedFaction = await loadFaction(factionId);

      if (team === 'alpha') {
        setAlphaFaction(loadedFaction);
      } else {
        setBravoFaction(loadedFaction);
      }

      // Update game mode state with new faction
      setGameModeState((prev) => ({
        ...prev,
        [team]: {
          ...prev[team],
          factionId,
          // Clear team if switching factions
          selectedOperatives:
            prev[team].factionId === factionId
              ? prev[team].selectedOperatives
              : [],
          ruleChoices:
            prev[team].factionId === factionId ? prev[team].ruleChoices : null,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      if (team === 'alpha') {
        setAlphaFaction(null);
      } else {
        setBravoFaction(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperative = (
    operative: Operative,
    weaponIds: string[],
    team: 'alpha' | 'bravo'
  ) => {
    const newSelection: SelectedOperative = {
      selectionId: `${operative.id}-${Date.now()}-${Math.random()}`,
      operative,
      selectedWeaponIds: weaponIds,
    };
    setGameModeState((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        selectedOperatives: [...prev[team].selectedOperatives, newSelection],
      },
    }));
  };

  const handleRemoveOperative = (
    selectionId: string,
    team: 'alpha' | 'bravo'
  ) => {
    setGameModeState((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        selectedOperatives: prev[team].selectedOperatives.filter(
          (s) => s.selectionId !== selectionId
        ),
      },
    }));
  };

  const handleClearTeam = (team: 'alpha' | 'bravo') => {
    setGameModeState((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        selectedOperatives: [],
        ruleChoices: null,
      },
    }));
  };

  const handleRuleChoiceChange = (
    category: string,
    ruleId: string,
    team: 'alpha' | 'bravo'
  ) => {
    setGameModeState((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        ruleChoices: {
          factionId: prev[team].factionId || '',
          choices: {
            ...(prev[team].ruleChoices?.choices || {}),
            [category]: ruleId,
          },
        },
      },
    }));
  };

  const currentTeamState =
    activeTab !== 'management' ? gameModeState[activeTab] : null;
  const currentFaction =
    activeTab === 'alpha'
      ? alphaFaction
      : activeTab === 'bravo'
        ? bravoFaction
        : null;

  return (
    <div className="game-mode-view">
      <div className="team-tabs">
        <button
          className={`team-tab ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          <span className="team-label">Game Management</span>
        </button>
        <button
          className={`team-tab ${activeTab === 'alpha' ? 'active' : ''}`}
          onClick={() => setActiveTab('alpha')}
        >
          <span className="team-label">Kill Team Alpha</span>
          {gameModeState.alpha.factionId && alphaFaction && (
            <span className="team-faction">{alphaFaction.name}</span>
          )}
        </button>
        <button
          className={`team-tab ${activeTab === 'bravo' ? 'active' : ''}`}
          onClick={() => setActiveTab('bravo')}
        >
          <span className="team-label">Kill Team Bravo</span>
          {gameModeState.bravo.factionId && bravoFaction && (
            <span className="team-faction">{bravoFaction.name}</span>
          )}
        </button>
      </div>

      {activeTab === 'management' ? (
        <div className="game-management">
          <h2>Game Management</h2>
          <p>
            Manage your game session, track victory points, and monitor game
            state.
          </p>
          <div className="info-message">
            Game management features coming soon. Use the Team Alpha and Team
            Bravo tabs to manage your teams.
          </div>
        </div>
      ) : (
        <>
          <FactionSelector
            selectedFactionId={
              currentTeamState?.factionId as FactionId | undefined
            }
            onFactionSelect={(factionId) =>
              handleFactionSelect(factionId, activeTab as 'alpha' | 'bravo')
            }
          />

          {loading && <div className="loading">Loading faction data...</div>}

          {error && <div className="error">Error: {error}</div>}

          {currentFaction && (
            <>
              <div className="team-view-toggle">
                <button
                  className={`toggle-button ${teamViewMode === 'faction-info' ? 'active' : ''}`}
                  onClick={() => setTeamViewMode('faction-info')}
                >
                  Faction & Operative Info
                </button>
                <button
                  className={`toggle-button ${teamViewMode === 'team-selection' ? 'active' : ''}`}
                  onClick={() => setTeamViewMode('team-selection')}
                >
                  Team Selection
                </button>
              </div>

              {teamViewMode === 'faction-info' ? (
                <>
                  <FactionDetails faction={currentFaction} />

                  {currentFaction.operatives.length > 0 ? (
                    <section className="operatives-section">
                      <h2>Operatives</h2>
                      <div className="operatives-grid">
                        {/* Filter operatives if team has selections, otherwise show all */}
                        {(currentTeamState &&
                        currentTeamState.selectedOperatives.length > 0
                          ? currentFaction.operatives.filter((operative) =>
                              currentTeamState.selectedOperatives.some(
                                (selected) =>
                                  selected.operative.id === operative.id
                              )
                            )
                          : currentFaction.operatives
                        ).map((operative) => (
                          <OperativeCard
                            key={operative.id}
                            operative={operative}
                            weapons={currentFaction.weapons}
                          />
                        ))}
                      </div>
                    </section>
                  ) : (
                    <div className="info-message">
                      No operative data available yet. Operative datacards will
                      be added in future updates.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <OperativeSelector
                    operatives={currentFaction.operatives}
                    weapons={currentFaction.weapons}
                    selectedOperatives={
                      currentTeamState?.selectedOperatives || []
                    }
                    onAddOperative={(operative, weaponIds) =>
                      handleAddOperative(
                        operative,
                        weaponIds,
                        activeTab as 'alpha' | 'bravo'
                      )
                    }
                    onRemoveOperative={(selectionId) =>
                      handleRemoveOperative(
                        selectionId,
                        activeTab as 'alpha' | 'bravo'
                      )
                    }
                    maxOperatives={currentFaction.restrictions.maxOperatives}
                  />

                  <SelectedTeamView
                    selectedOperatives={
                      currentTeamState?.selectedOperatives || []
                    }
                    faction={currentFaction}
                    onClearTeam={() =>
                      handleClearTeam(activeTab as 'alpha' | 'bravo')
                    }
                  />

                  <FactionRulesSelector
                    faction={currentFaction}
                    ruleChoices={currentTeamState?.ruleChoices || null}
                    onRuleChoiceChange={(category, ruleId) =>
                      handleRuleChoiceChange(
                        category,
                        ruleId,
                        activeTab as 'alpha' | 'bravo'
                      )
                    }
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
