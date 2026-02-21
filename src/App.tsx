import { useState, useEffect } from 'react';
import { FactionSelector } from './components/faction/FactionSelector';
import { FactionDetails } from './components/faction/FactionDetails';
import { OperativeCard } from './components/datacard/OperativeCard';
import { WeaponRulesPage } from './components/rules/WeaponRulesPage';
import { ActionsPage } from './components/rules/ActionsPage';
import { GeneralRulesPage } from './components/rules/GeneralRulesPage';
import { OperativeSelector } from './components/team/OperativeSelector';
import { SelectedTeamView } from './components/team/SelectedTeamView';
import { FactionRulesSelector } from './components/team/FactionRulesSelector';
import { GameModeView } from './components/game/GameModeView';
import { loadFaction, FactionId } from './services/dataLoader';
import {
  saveTeamState,
  loadTeamState,
  getInitialTeamState,
} from './services/teamStorage';
import { Faction, TeamState, SelectedOperative, Operative } from './types';
import { getFullVersionInfo } from './version';
import './App.css';

type ViewMode =
  | 'home'
  | 'weapon-rules'
  | 'actions'
  | 'general-rules'
  | 'game-mode';
type TeamViewMode = 'faction-info' | 'team-selection';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [teamViewMode, setTeamViewMode] =
    useState<TeamViewMode>('faction-info');
  const [selectedFactionId, setSelectedFactionId] = useState<
    FactionId | undefined
  >();
  const [faction, setFaction] = useState<Faction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamState, setTeamState] = useState<TeamState>(getInitialTeamState());
  const [selectedOperativeFilter, setSelectedOperativeFilter] = useState<
    string | 'all'
  >('all');

  // Load team state from localStorage on mount
  useEffect(() => {
    const savedState = loadTeamState();
    if (savedState) {
      setTeamState(savedState);
      // If there's a saved faction, load it
      if (savedState.factionId) {
        handleFactionSelect(savedState.factionId as FactionId);
      }
    }
  }, []);

  // Save team state to localStorage whenever it changes
  useEffect(() => {
    saveTeamState(teamState);
  }, [teamState]);

  const handleFactionSelect = async (factionId: FactionId) => {
    setSelectedFactionId(factionId);
    setLoading(true);
    setError(null);

    try {
      const loadedFaction = await loadFaction(factionId);
      setFaction(loadedFaction);
      // Update team state with new faction
      setTeamState((prev) => ({
        ...prev,
        factionId,
        // Clear team if switching factions
        selectedOperatives:
          prev.factionId === factionId ? prev.selectedOperatives : [],
        ruleChoices: prev.factionId === factionId ? prev.ruleChoices : null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setFaction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperative = (operative: Operative, weaponIds: string[]) => {
    const newSelection: SelectedOperative = {
      selectionId: `${operative.id}-${Date.now()}-${Math.random()}`,
      operative,
      selectedWeaponIds: weaponIds,
    };
    setTeamState((prev) => ({
      ...prev,
      selectedOperatives: [...prev.selectedOperatives, newSelection],
    }));
  };

  const handleRemoveOperative = (selectionId: string) => {
    setTeamState((prev) => ({
      ...prev,
      selectedOperatives: prev.selectedOperatives.filter(
        (s) => s.selectionId !== selectionId
      ),
    }));
  };

  const handleClearTeam = () => {
    setTeamState((prev) => ({
      ...prev,
      selectedOperatives: [],
      ruleChoices: null,
    }));
  };

  const handleRuleChoiceChange = (category: string, ruleId: string) => {
    setTeamState((prev) => {
      // Handle chapter tactics separately
      if (category === 'chapter_tactics_primary' || category === 'chapter_tactics_secondary') {
        const isPrimary = category === 'chapter_tactics_primary';
        return {
          ...prev,
          ruleChoices: {
            factionId: prev.factionId || '',
            choices: prev.ruleChoices?.choices || {},
            chapterTactics: {
              primary: isPrimary ? ruleId : (prev.ruleChoices?.chapterTactics?.primary || ''),
              secondary: !isPrimary ? ruleId : (prev.ruleChoices?.chapterTactics?.secondary || ''),
            },
          },
        };
      }

      // Handle other rule choices
      return {
        ...prev,
        ruleChoices: {
          factionId: prev.factionId || '',
          choices: {
            ...(prev.ruleChoices?.choices || {}),
            [category]: ruleId,
          },
          chapterTactics: prev.ruleChoices?.chapterTactics,
        },
      };
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kill Team Dataslate</h1>
        <p className="subtitle">Warhammer 40,000 Kill Team Reference Tool</p>
        <nav className="nav-buttons">
          <button
            className={`nav-button ${viewMode === 'home' ? 'active' : ''}`}
            onClick={() => setViewMode('home')}
          >
            Single Team
          </button>
          <button
            className={`nav-button ${viewMode === 'game-mode' ? 'active' : ''}`}
            onClick={() => setViewMode('game-mode')}
          >
            Game Mode
          </button>
          <button
            className={`nav-button ${viewMode === 'actions' ? 'active' : ''}`}
            onClick={() => setViewMode('actions')}
          >
            Actions
          </button>
          <button
            className={`nav-button ${viewMode === 'general-rules' ? 'active' : ''}`}
            onClick={() => setViewMode('general-rules')}
          >
            Rules
          </button>
          <button
            className={`nav-button ${viewMode === 'weapon-rules' ? 'active' : ''}`}
            onClick={() => setViewMode('weapon-rules')}
          >
            Weapon Rules
          </button>
        </nav>
      </header>

      <main className="app-main">
        {viewMode === 'home' && (
          <>
            <FactionSelector
              selectedFactionId={selectedFactionId}
              onFactionSelect={handleFactionSelect}
            />

            {loading && (
              <div className="loading" role="status" aria-live="polite">
                Loading faction data...
              </div>
            )}

            {error && (
              <div className="error" role="alert">
                <strong>Error:</strong> {error}
              </div>
            )}

            {faction && (
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
                    <FactionDetails faction={faction} />

                    {faction.operatives.length > 0 ? (
                      <section className="operatives-section">
                        <div className="operatives-header">
                          <h2>Operatives</h2>
                          <div className="operative-filter">
                            <label htmlFor="operative-select">
                              Jump to Operative:
                            </label>
                            <select
                              id="operative-select"
                              value={selectedOperativeFilter}
                              onChange={(e) =>
                                setSelectedOperativeFilter(e.target.value)
                              }
                              className="operative-selector"
                            >
                              <option value="all">Show All Operatives</option>
                              {faction.operatives.map((operative) => (
                                <option key={operative.id} value={operative.id}>
                                  {operative.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="operatives-grid">
                          {faction.operatives
                            .filter(
                              (operative) =>
                                selectedOperativeFilter === 'all' ||
                                operative.id === selectedOperativeFilter
                            )
                            .map((operative) => {
                              // Find if this operative is in the selected team
                              const selectedVersion =
                                teamState.selectedOperatives.find(
                                  (s) => s.operative.id === operative.id
                                );

                              return (
                                <OperativeCard
                                  key={operative.id}
                                  operative={operative}
                                  weapons={faction.weapons}
                                  abilities={faction.abilities}
                                  uniqueActions={faction.unique_actions}
                                  selectedWeaponIds={
                                    selectedVersion?.selectedWeaponIds
                                  }
                                />
                              );
                            })}
                        </div>
                      </section>
                    ) : (
                      <div className="info-message">
                        No operative data available yet. Operative datacards
                        will be added in future updates.
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <OperativeSelector
                      operatives={faction.operatives}
                      weapons={faction.weapons}
                      selectedOperatives={teamState.selectedOperatives}
                      onAddOperative={handleAddOperative}
                      onRemoveOperative={handleRemoveOperative}
                      faction={faction}
                    />

                    <SelectedTeamView
                      selectedOperatives={teamState.selectedOperatives}
                      faction={faction}
                      onClearTeam={handleClearTeam}
                    />

                    <FactionRulesSelector
                      faction={faction}
                      ruleChoices={teamState.ruleChoices}
                      onRuleChoiceChange={handleRuleChoiceChange}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
        {viewMode === 'game-mode' && <GameModeView />}
        {viewMode === 'actions' && <ActionsPage />}
        {viewMode === 'general-rules' && <GeneralRulesPage />}
        {viewMode === 'weapon-rules' && <WeaponRulesPage />}
      </main>

      <footer className="app-footer">
        <p>
          This is an unofficial fan-made tool. Warhammer 40,000 and Kill Team
          are registered trademarks of Games Workshop Ltd.
        </p>
        <p className="version-info">{getFullVersionInfo()}</p>
      </footer>
    </div>
  );
}

export default App;
