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
import { loadFaction, FactionId } from './services/dataLoader';
import {
  saveTeamState,
  loadTeamState,
  getInitialTeamState,
} from './services/teamStorage';
import { Faction, TeamState, SelectedOperative, Operative } from './types';
import './App.css';

type ViewMode = 'home' | 'weapon-rules' | 'actions' | 'general-rules';
type TeamViewMode = 'general' | 'selected';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [teamViewMode, setTeamViewMode] = useState<TeamViewMode>('general');
  const [selectedFactionId, setSelectedFactionId] = useState<
    FactionId | undefined
  >();
  const [faction, setFaction] = useState<Faction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamState, setTeamState] = useState<TeamState>(getInitialTeamState());

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
    setTeamState((prev) => ({
      ...prev,
      ruleChoices: {
        factionId: prev.factionId || '',
        choices: {
          ...(prev.ruleChoices?.choices || {}),
          [category]: ruleId,
        },
      },
    }));
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
            Home
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

            {loading && <div className="loading">Loading faction data...</div>}

            {error && <div className="error">Error: {error}</div>}

            {faction && (
              <>
                <div className="team-view-toggle">
                  <button
                    className={`toggle-button ${teamViewMode === 'general' ? 'active' : ''}`}
                    onClick={() => setTeamViewMode('general')}
                  >
                    General View
                  </button>
                  <button
                    className={`toggle-button ${teamViewMode === 'selected' ? 'active' : ''}`}
                    onClick={() => setTeamViewMode('selected')}
                  >
                    Selected Team
                  </button>
                </div>

                {teamViewMode === 'general' ? (
                  <>
                    <FactionDetails faction={faction} />

                    {faction.operatives.length > 0 ? (
                      <section className="operatives-section">
                        <h2>Operatives</h2>
                        <div className="operatives-grid">
                          {faction.operatives.map((operative) => (
                            <OperativeCard
                              key={operative.id}
                              operative={operative}
                              weapons={faction.weapons}
                            />
                          ))}
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
                    <SelectedTeamView
                      selectedOperatives={teamState.selectedOperatives}
                      faction={faction}
                      onClearTeam={handleClearTeam}
                    />

                    <OperativeSelector
                      operatives={faction.operatives}
                      weapons={faction.weapons}
                      selectedOperatives={teamState.selectedOperatives}
                      onAddOperative={handleAddOperative}
                      onRemoveOperative={handleRemoveOperative}
                      maxOperatives={faction.restrictions.maxOperatives}
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
        {viewMode === 'actions' && <ActionsPage />}
        {viewMode === 'general-rules' && <GeneralRulesPage />}
        {viewMode === 'weapon-rules' && <WeaponRulesPage />}
      </main>

      <footer className="app-footer">
        <p>
          This is an unofficial fan-made tool. Warhammer 40,000 and Kill Team
          are registered trademarks of Games Workshop Ltd.
        </p>
      </footer>
    </div>
  );
}

export default App;
