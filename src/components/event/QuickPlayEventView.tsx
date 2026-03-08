/**
 * QuickPlayEventView — root component for the Quick Play Event feature.
 *
 * Loads Plague Marines faction data (reusing the existing dataLoader service),
 * manages the top-level QuickPlayEventState, persists it to localStorage via
 * eventStorage, and orchestrates the child components.
 *
 * @see QUICK_PLAY_EVENT_SPEC.md
 */

import { useState, useEffect, useCallback } from 'react';
import { loadFaction, FactionId } from '@/services/dataLoader';
import {
  saveEventState,
  loadEventState,
  clearEventState,
  getInitialEventState,
} from '@/services/eventStorage';
import { Faction } from '@/types';
import { QuickPlayEventState, GameEventState } from '@/types/event';
import { QUICK_PLAY_DEFAULTS } from '@/constants';
import { EventSetup } from './EventSetup';
import { GamePanel } from './GamePanel';
import { LearningsTracker } from './LearningsTracker';
import './QuickPlayEventView.css';

/**
 * Main container for the Plague Marines Quick Play Event feature.
 * Handles data loading, top-level state, and renders child components.
 */
export function QuickPlayEventView() {
  const [faction, setFaction] = useState<Faction | null>(null);
  const [loadingFaction, setLoadingFaction] = useState(true);
  const [factionError, setFactionError] = useState<string | null>(null);
  const [eventState, setEventState] =
    useState<QuickPlayEventState>(getInitialEventState);

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
  }, []);

  // ------------------------------------------------------------------
  // Restore persisted event state from localStorage on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const saved = loadEventState();
    if (saved) {
      setEventState(saved);
    }
  }, []);

  // ------------------------------------------------------------------
  // Persist event state to localStorage on every change
  // ------------------------------------------------------------------
  useEffect(() => {
    saveEventState(eventState);
  }, [eventState]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  /** Called when the EventSetup form is submitted */
  const handleSetupComplete = useCallback((eventName: string) => {
    setEventState((prev) => ({
      ...prev,
      eventName,
      setupComplete: true,
    }));
  }, []);

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

  /** Update the shared learnings / notes */
  const handleLearningsChange = useCallback((learnings: string) => {
    setEventState((prev) => ({ ...prev, learnings }));
  }, []);

  /** Reset the entire event with user confirmation */
  const handleReset = useCallback(() => {
    if (
      window.confirm(
        'Reset the entire event? All game data and notes will be lost.'
      )
    ) {
      clearEventState();
      setEventState(getInitialEventState());
    }
  }, []);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const activeGame = eventState.games[eventState.activeGameIndex];

  return (
    <div className="quick-play-event">
      <header className="event-header">
        <h2 className="event-title">☠️ Nurgle&apos;s Quick Play Event</h2>
        <p className="event-subtitle">
          Plague Marines — {QUICK_PLAY_DEFAULTS.GAME_COUNT} Games of
          Grandfather&apos;s Glory
        </p>
        {eventState.eventName && (
          <span className="event-name-badge">{eventState.eventName}</span>
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
          {!eventState.setupComplete ? (
            <div className="event-main">
              <EventSetup onSetupComplete={handleSetupComplete} />
            </div>
          ) : (
            <>
              {/* Game selector tabs */}
              <nav className="game-tabs" aria-label="Game selection">
                {eventState.games.map((game, index) => (
                  <button
                    key={game.gameNumber}
                    className={`game-tab ${index === eventState.activeGameIndex ? 'active' : ''}`}
                    onClick={() => handleSelectGame(index)}
                    aria-pressed={index === eventState.activeGameIndex}
                  >
                    Game {game.gameNumber}
                  </button>
                ))}
              </nav>

              <main className="event-main">
                {activeGame && (
                  <GamePanel
                    game={activeGame}
                    gameIndex={eventState.activeGameIndex}
                    faction={faction}
                    onChange={(updated) =>
                      handleGameChange(eventState.activeGameIndex, updated)
                    }
                  />
                )}

                {/* Learnings — shared across all 3 games, always at the bottom */}
                <LearningsTracker
                  value={eventState.learnings}
                  onChange={handleLearningsChange}
                />

                <div className="event-reset-section">
                  <button
                    className="event-reset-button"
                    onClick={handleReset}
                    aria-label="Reset event — clears all saved data"
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
