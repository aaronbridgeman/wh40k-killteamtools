/**
 * QuickPlayEventView — root component for the Quick Play Event feature.
 *
 * Loads Plague Marines faction data (reusing the existing dataLoader service),
 * manages the top-level QuickPlayEventState, persists it to localStorage via
 * eventStorage, and orchestrates the child components.
 *
 * Learnings are persisted to a separate localStorage key (via
 * eventStorage.saveLearningsLog / loadLearningsLog) so they survive event
 * resets.
 *
 * @see QUICK_PLAY_EVENT_SPEC.md
 */

import { useState, useEffect, useCallback } from 'react';
import { loadFaction, FactionId } from '@/services/dataLoader';
import { loadUniversalEquipment } from '@/services/equipmentLoader';
import {
  saveEventState,
  loadEventState,
  clearEventState,
  getInitialEventState,
  saveLearningsLog,
  loadLearningsLog,
  clearLearningsLog,
  generateMarkdownReport,
} from '@/services/eventStorage';
import { Faction, Equipment } from '@/types';
import {
  QuickPlayEventState,
  GameEventState,
  LearningEntry,
} from '@/types/event';
import { QUICK_PLAY_DEFAULTS } from '@/constants';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { GamePanel } from './GamePanel';
import { LearningsTracker } from './LearningsTracker';
import { LearningsLog } from './LearningsLog';
import './QuickPlayEventView.css';

type EventViewMode = 'game' | 'log';

/**
 * Main container for the Plague Marines Quick Play Event feature.
 * Handles data loading, top-level state, and renders child components.
 */
export function QuickPlayEventView() {
  const [faction, setFaction] = useState<Faction | null>(null);
  const [universalEquipment, setUniversalEquipment] = useState<Equipment[]>([]);
  const [loadingFaction, setLoadingFaction] = useState(true);
  const [factionError, setFactionError] = useState<string | null>(null);
  const [eventState, setEventState] =
    useState<QuickPlayEventState>(getInitialEventState);
  const [learningEntries, setLearningEntries] = useState<LearningEntry[]>([]);
  const [eventViewMode, setEventViewMode] = useState<EventViewMode>('game');
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  const { canInstall, isInstalled, isIos, install } = usePwaInstall();

  // True only when the app is served from the dedicated standalone Quick Play
  // page (/quick-play/).  When accessed from the main app shell the manifest
  // in scope is for the full tool, so clicking "install" would install the
  // whole app — not just Quick Play.
  const isOnQuickPlayPage =
    window.location.pathname.endsWith('/quick-play/') ||
    window.location.pathname.endsWith('/quick-play');

  // ------------------------------------------------------------------
  // Load Plague Marines faction data on mount (reuses dataLoader service)
  // ------------------------------------------------------------------
  useEffect(() => {
    setLoadingFaction(true);
    setFactionError(null);
    loadFaction(QUICK_PLAY_DEFAULTS.FACTION_ID as FactionId)
      .then((loadedFaction) => {
        setFaction(loadedFaction);
      })
      .catch((err: unknown) => {
        setFactionError(
          err instanceof Error ? err.message : 'Failed to load faction data.'
        );
      })
      .finally(() => {
        setLoadingFaction(false);
      });

    // Load universal equipment synchronously
    setUniversalEquipment(loadUniversalEquipment());
  }, []);

  // ------------------------------------------------------------------
  // Restore persisted event state and learnings from localStorage on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const saved = loadEventState();
    if (saved) {
      setEventState(saved);
    }
    setLearningEntries(loadLearningsLog());
  }, []);

  // ------------------------------------------------------------------
  // Persist event state to localStorage on every change
  // ------------------------------------------------------------------
  useEffect(() => {
    saveEventState(eventState);
  }, [eventState]);

  // ------------------------------------------------------------------
  // Persist learnings to their own separate localStorage key
  // ------------------------------------------------------------------
  useEffect(() => {
    saveLearningsLog(learningEntries);
  }, [learningEntries]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  /** Switch between game tabs */
  const handleSelectGame = useCallback((index: number) => {
    setEventState((prev) => ({ ...prev, activeGameIndex: index }));
  }, []);

  /** Update a single game's state (called by GamePanel) */
  const handleGameChange = useCallback(
    (gameIndex: number, updatedGame: GameEventState) => {
      setEventState((prev) => {
        const updatedGames = [...prev.games];
        updatedGames[gameIndex] = updatedGame;
        return { ...prev, games: updatedGames };
      });
    },
    []
  );

  /** Add a learning entry to the log */
  const handleLearningSubmit = useCallback((entry: LearningEntry) => {
    setLearningEntries((prev) => [...prev, entry]);
  }, []);

  /** Delete a learning entry by ID */
  const handleLearningDelete = useCallback((id: string) => {
    setLearningEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  /** Clear all learning entries (with confirmation handled in LearningsLog) */
  const handleLearningsClearAll = useCallback(() => {
    setLearningEntries([]);
    clearLearningsLog();
  }, []);

  /** Reset the entire event (game data only) — learnings are preserved */
  const handleReset = useCallback(() => {
    if (
      window.confirm(
        'Reset the entire event? All game data will be lost.\n\nYour learnings log will be kept.'
      )
    ) {
      clearEventState();
      setEventState(getInitialEventState());
      setEventViewMode('game');
    }
  }, []);

  /**
   * Generates a Markdown report of the full event and triggers a browser
   * download of the resulting `.md` file.
   */
  const handleDownloadReport = useCallback(() => {
    if (!faction) return;

    // Build a name → display-name map so equipment IDs resolve to human-readable names
    const factionEq = faction.equipment ?? [];
    const universalEq = universalEquipment;
    const equipmentNames: Record<string, string> = {};
    [...factionEq, ...universalEq].forEach((eq) => {
      equipmentNames[eq.id] = eq.name;
    });

    const md = generateMarkdownReport(
      eventState,
      learningEntries,
      equipmentNames
    );
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (eventState.eventName || 'kill-team-event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    a.download = `${slug}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [eventState, learningEntries, faction, universalEquipment]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const activeGame = eventState.games[eventState.activeGameIndex];

  /**
   * Derives the W/L/D result for a game based on recorded VPs.
   * Returns null if the game has not been started yet (setup phase).
   */
  function gameResult(
    game: (typeof eventState.games)[number]
  ): 'win' | 'loss' | 'draw' | null {
    if (game.gamePhase !== 'playing') return null;
    if (game.playerVP > game.opponentVP) return 'win';
    if (game.playerVP < game.opponentVP) return 'loss';
    return 'draw';
  }

  const results = eventState.games.map(gameResult);
  const wins = results.filter((r) => r === 'win').length;
  const losses = results.filter((r) => r === 'loss').length;
  const draws = results.filter((r) => r === 'draw').length;
  const totalPlayerVP = eventState.games.reduce(
    (sum, g) => sum + g.playerVP,
    0
  );
  const totalOpponentVP = eventState.games.reduce(
    (sum, g) => sum + g.opponentVP,
    0
  );
  const hasAnyScore = results.some((r) => r !== null);

  return (
    <div className="quick-play-event">
      <header className="event-header">
        <h2 className="event-title">☠️ Nurgle&apos;s Quick Play Event</h2>
        <p className="event-subtitle">
          Plague Marines — {QUICK_PLAY_DEFAULTS.GAME_COUNT} Games of
          Grandfather&apos;s Glory
        </p>

        {/* PWA install button — only shown when relevant */}
        {!isInstalled && isOnQuickPlayPage && canInstall && (
          <button
            type="button"
            className="event-install-button"
            onClick={install}
            aria-label="Install Quick Play as an app on your device"
          >
            📲 Add to Home Screen
          </button>
        )}
        {!isInstalled && isOnQuickPlayPage && isIos && !canInstall && (
          <div className="event-ios-install">
            <button
              type="button"
              className="event-install-button event-install-button--ios"
              onClick={() => setShowIosInstructions((v) => !v)}
              aria-expanded={showIosInstructions}
              aria-controls="ios-install-instructions"
            >
              📲 Add to Home Screen
            </button>
            {showIosInstructions && (
              <div
                id="ios-install-instructions"
                className="event-ios-instructions"
                role="tooltip"
              >
                <p>To install on iOS:</p>
                <ol>
                  <li>
                    Tap the <strong>Share</strong> button (□↑) in Safari
                  </li>
                  <li>
                    Select <strong>Add to Home Screen</strong>
                  </li>
                  <li>
                    Tap <strong>Add</strong>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}
        {/* When viewed inside the main app, offer a link to the standalone
            Quick Play page where the browser can install *just* this feature */}
        {!isInstalled && !isOnQuickPlayPage && (
          <a
            href="/wh40k-killteamtools/quick-play/"
            className="event-install-button"
            aria-label="Open the Quick Play standalone page to install it as a separate app"
          >
            📲 Install Quick Play App
          </a>
        )}
      </header>

      {loadingFaction && (
        <div className="event-loading" role="status" aria-live="polite">
          Summoning the Death Guard…
        </div>
      )}

      {factionError && (
        <div className="event-error" role="alert">
          <strong>Error:</strong> {factionError}
        </div>
      )}

      {!loadingFaction && faction && (
        <>
          {eventViewMode === 'log' ? (
            <main className="event-main">
              <LearningsLog
                entries={learningEntries}
                onDelete={handleLearningDelete}
                onClearAll={handleLearningsClearAll}
                onBack={() => setEventViewMode('game')}
              />
            </main>
          ) : (
            <>
              {/* Tournament standings bar */}
              {hasAnyScore && (
                <div
                  className="tournament-standings"
                  role="region"
                  aria-label="Tournament standings"
                >
                  <div className="standings-record">
                    <span className="standings-item standings-win">
                      {wins}W
                    </span>
                    <span className="standings-sep">/</span>
                    <span className="standings-item standings-loss">
                      {losses}L
                    </span>
                    <span className="standings-sep">/</span>
                    <span className="standings-item standings-draw">
                      {draws}D
                    </span>
                  </div>
                  <div
                    className="standings-vp"
                    aria-label="Victory point totals"
                  >
                    <span className="standings-vp-you">{totalPlayerVP}</span>
                    <span className="standings-vp-sep"> : </span>
                    <span className="standings-vp-opp">{totalOpponentVP}</span>
                    <span className="standings-vp-label"> VP</span>
                  </div>
                </div>
              )}

              {/* Game selector tabs */}
              <nav className="game-tabs" aria-label="Game selection">
                {eventState.games.map((game, index) => {
                  const result = gameResult(game);
                  return (
                    <button
                      key={game.gameNumber}
                      className={`game-tab ${index === eventState.activeGameIndex ? 'active' : ''}`}
                      onClick={() => handleSelectGame(index)}
                      aria-pressed={index === eventState.activeGameIndex}
                    >
                      Game {game.gameNumber}
                      {result ? (
                        <span
                          className={`game-tab-result game-tab-result--${result}`}
                          aria-label={result}
                        >
                          {result === 'win'
                            ? '🏆'
                            : result === 'loss'
                              ? '💀'
                              : '🤝'}
                        </span>
                      ) : (
                        game.gamePhase === 'playing' && (
                          <span className="game-tab-status" aria-hidden="true">
                            {' '}
                            ▶
                          </span>
                        )
                      )}
                    </button>
                  );
                })}
              </nav>

              <main className="event-main">
                {activeGame && (
                  <GamePanel
                    game={activeGame}
                    gameIndex={eventState.activeGameIndex}
                    faction={faction}
                    universalEquipment={universalEquipment}
                    onChange={(updated) =>
                      handleGameChange(eventState.activeGameIndex, updated)
                    }
                  />
                )}

                {/* Learnings tracker — shared across all 3 games, always at the bottom */}
                <LearningsTracker
                  entries={learningEntries}
                  onSubmit={handleLearningSubmit}
                  onViewLog={() => setEventViewMode('log')}
                  defaultOpposition={activeGame?.opposition}
                  defaultCritOp={activeGame?.critOp}
                  defaultTacOp={activeGame?.tacOp}
                />

                <div className="event-reset-section">
                  <button
                    className="event-download-button"
                    onClick={handleDownloadReport}
                    aria-label="Download event report as Markdown file"
                  >
                    📥 Download Event Report
                  </button>
                  <button
                    className="event-reset-button"
                    onClick={handleReset}
                    aria-label="Reset event — clears all game data (learnings are kept)"
                  >
                    ⚠️ Reset Event
                  </button>
                </div>
              </main>
            </>
          )}
        </>
      )}
    </div>
  );
}
