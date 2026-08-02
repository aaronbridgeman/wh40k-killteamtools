import { useState } from 'react';
import { WeaponRulesPage } from './components/rules/WeaponRulesPage';
import { ActionsPage } from './components/rules/ActionsPage';
import { GeneralRulesPage } from './components/rules/GeneralRulesPage';
import { GameModeView } from './components/game/GameModeView';
import { SoloJointOpsView } from './components/solo/SoloJointOpsView';
import { ScaffoldSystemView } from './components/game-system/ScaffoldSystemView';
import { GAME_SYSTEMS, GameSystemId } from './data/game-systems';
import {
  beginGoogleAuthInteraction,
  isGoogleDriveSyncConfigured,
  signInWithGoogle,
  signOutGoogleDriveSync,
} from './services/eventStorage';
import { getFullVersionInfo } from './version';
import './App.css';

type ViewMode =
  | 'weapon-rules'
  | 'actions'
  | 'general-rules'
  | 'game-mode'
  | 'solo-joint-ops';

const queryView = new URLSearchParams(window.location.search).get('view');
const googleLoginConfigured = isGoogleDriveSyncConfigured();

function App() {
  const [selectedGameSystemId, setSelectedGameSystemId] =
    useState<GameSystemId>('kill-team');
  const [googleLoginBusy, setGoogleLoginBusy] = useState(false);
  const [googleLoginStatus, setGoogleLoginStatus] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (queryView === 'solo-joint-ops') return 'solo-joint-ops';
    return 'solo-joint-ops';
  });

  const selectedGameSystem = GAME_SYSTEMS.find(
    (gameSystem) => gameSystem.id === selectedGameSystemId
  );
  const isKillTeamSelected = selectedGameSystem?.id === 'kill-team';

  const handleGoogleLogin = async () => {
    if (!googleLoginConfigured) {
      setGoogleLoginStatus(
        'Google login is not configured. Set VITE_GOOGLE_OAUTH_CLIENT_ID.'
      );
      return;
    }

    setGoogleLoginBusy(true);
    setGoogleLoginStatus(null);
    let timeoutId: number | null = null;
    let timedOut = false;
    try {
      beginGoogleAuthInteraction();
      timeoutId = window.setTimeout(() => {
        timedOut = true;
        setGoogleLoginBusy(false);
        setGoogleLoginStatus(
          'Google login timed out in the app. Please retry and allow popups for this site.'
        );
      }, 35000);

      await signInWithGoogle();
      if (timedOut) {
        return;
      }
      setGoogleLoginStatus('Signed in with Google.');
    } catch (error) {
      if (timedOut) {
        return;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Google login failed.';
      if (errorMessage.includes('access_denied')) {
        setGoogleLoginStatus(
          'Google denied access (403). Verify OAuth test-user access in the Google Cloud project for this client ID.'
        );
        return;
      }
      setGoogleLoginStatus(errorMessage);
    } finally {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (!timedOut) {
        setGoogleLoginBusy(false);
      }
    }
  };

  const handleGoogleLogout = () => {
    signOutGoogleDriveSync();
    setGoogleLoginStatus('Signed out from Google for this tab.');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tabletop Dataslate Tools</h1>
        <p className="subtitle">
          {selectedGameSystem?.description ??
            'Tabletop game system reference tools'}
        </p>

        <div className="game-system-selector">
          <label htmlFor="game-system-select">Game System:</label>
          <select
            id="game-system-select"
            value={selectedGameSystemId}
            onChange={(event) =>
              setSelectedGameSystemId(event.target.value as GameSystemId)
            }
          >
            {GAME_SYSTEMS.map((gameSystem) => (
              <option key={gameSystem.id} value={gameSystem.id}>
                {gameSystem.name}
                {gameSystem.status === 'scaffolded' ? ' (Scaffold)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div
          className="auth-actions"
          role="region"
          aria-label="Google login controls"
        >
          <button
            className="auth-button"
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoginBusy}
          >
            Login with Google
          </button>
          <button
            className="auth-button auth-button-secondary"
            type="button"
            onClick={handleGoogleLogout}
            disabled={googleLoginBusy}
          >
            Logout
          </button>
        </div>
        {googleLoginStatus && (
          <p className="auth-status">{googleLoginStatus}</p>
        )}

        {isKillTeamSelected && (
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
        )}
      </header>

      <main className="app-main">
        {isKillTeamSelected ? (
          <>
            {viewMode === 'game-mode' && <GameModeView />}
            {viewMode === 'actions' && <ActionsPage />}
            {viewMode === 'general-rules' && <GeneralRulesPage />}
            {viewMode === 'weapon-rules' && <WeaponRulesPage />}
            {viewMode === 'solo-joint-ops' && <SoloJointOpsView />}
          </>
        ) : (
          selectedGameSystem && (
            <ScaffoldSystemView gameSystem={selectedGameSystem} />
          )
        )}
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
