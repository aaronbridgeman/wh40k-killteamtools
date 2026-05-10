import { useState } from 'react';
import { WeaponRulesPage } from './components/rules/WeaponRulesPage';
import { ActionsPage } from './components/rules/ActionsPage';
import { GeneralRulesPage } from './components/rules/GeneralRulesPage';
import { GameModeView } from './components/game/GameModeView';
import { QuickPlayEventView } from './components/event/QuickPlayEventView';
import { SoloJointOpsView } from './components/solo/SoloJointOpsView';
import { getFullVersionInfo } from './version';
import './App.css';

type ViewMode =
  | 'weapon-rules'
  | 'actions'
  | 'general-rules'
  | 'game-mode'
  | 'quick-play-event'
  | 'solo-joint-ops';

const queryView = new URLSearchParams(window.location.search).get('view');

// When launched via ?view=quick-play-event the nav is hidden to maximize
// focus during play (standalone quick play experience)
const standaloneQuickPlay = queryView === 'quick-play-event';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (queryView === 'quick-play-event') return 'quick-play-event';
    return 'solo-joint-ops';
  });

  return (
    <div className="app">
      {!standaloneQuickPlay && (
        <header className="app-header">
          <h1>Kill Team Dataslate</h1>
          <p className="subtitle">Warhammer 40,000 Kill Team Reference Tool</p>
          <nav className="nav-buttons">
            <button
              className={`nav-button ${viewMode === 'solo-joint-ops' ? 'active' : ''}`}
              onClick={() => setViewMode('solo-joint-ops')}
            >
              Solo/Joint Ops
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
      )}

      <main className="app-main">
        {viewMode === 'game-mode' && <GameModeView />}
        {viewMode === 'actions' && <ActionsPage />}
        {viewMode === 'general-rules' && <GeneralRulesPage />}
        {viewMode === 'weapon-rules' && <WeaponRulesPage />}
        {viewMode === 'quick-play-event' && <QuickPlayEventView />}
        {viewMode === 'solo-joint-ops' && <SoloJointOpsView />}
      </main>

      {!standaloneQuickPlay && (
        <footer className="app-footer">
          <p>
            This is an unofficial fan-made tool. Warhammer 40,000 and Kill Team
            are registered trademarks of Games Workshop Ltd.
          </p>
          <p className="version-info">{getFullVersionInfo()}</p>
        </footer>
      )}
    </div>
  );
}

export default App;
