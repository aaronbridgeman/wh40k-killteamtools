/**
 * Service for persisting Quick Play Event state.
 *
 * Primary storage: localStorage (works offline, no authentication required,
 * fully compatible with GitHub Pages deployment).
 *
 * Secondary storage: Google Drive (stub — see QUICK_PLAY_EVENT_SPEC.md for
 * implementation requirements and Open Question #1).
 *
 * Follows the same save/load/clear pattern established in teamStorage.ts.
 *
 * @see QUICK_PLAY_EVENT_SPEC.md
 */

import {
  QuickPlayEventState,
  GameEventState,
  TurningPointState,
  LearningEntry,
} from '@/types/event';
import {
  STORAGE_KEYS,
  ERROR_MESSAGES,
  QUICK_PLAY_DEFAULTS,
  GAME_DEFAULTS,
} from '@/constants';

const STORAGE_KEY = STORAGE_KEYS.QUICK_PLAY_EVENT;
const LEARNINGS_STORAGE_KEY = STORAGE_KEYS.LEARNINGS_LOG;

// ---------------------------------------------------------------------------
// Legacy schema types for migration
// ---------------------------------------------------------------------------

/** Schema v1/v2/v3 turning point — used single `selectedStrategicPloyId` or v4 `selectedStrategicPloyIds` */
interface LegacyTurningPointStateV1 {
  selectedStrategicPloyId?: string | null; // v1/v2/v3 single ploy (legacy)
  selectedStrategicPloyIds?: string[]; // v4+ multiple ploys
  usedFirefightPloyIds?: string[];
  firefightPloyCounts?: Record<string, number>;
}

/** Schema v1/v2 game — may lack v3 fields */
interface LegacyGameStateV1 {
  gameNumber: 1 | 2 | 3;
  removedOperativeId: string | null;
  selectedEquipmentIds: string[];
  blightGrenadeUsesRemaining: number;
  turningPoint: number;
  commandPoints: number;
  turningPoints: Record<string, LegacyTurningPointStateV1>;
  injuredOperativeIds?: string[];
  incapacitatedOperativeIds?: string[];
  // v3 optional fields (may be absent when migrating from v2)
  gamePhase?: 'setup' | 'playing';
  opposition?: string;
  critOp?: string;
  tacOp?: string;
  killOpKillCount?: number;
  opponentCount?: number;
  // v6 optional fields (may be absent when migrating from v5)
  playerVP?: number;
  opponentVP?: number;
  // v7 optional fields (may be absent when migrating from v6)
  iconBearerInEnemyTerritory?: boolean;
  // v8 optional fields (may be absent when migrating from v7)
  equipmentUsesRemaining?: Record<string, number>;
}

/** Schema v1/v2 root state — may include learningEntries (moved to separate storage in v3) */
interface LegacyEventStateV1 {
  version?: number;
  eventName: string;
  setupComplete: boolean;
  activeGameIndex: number;
  games: LegacyGameStateV1[];
  learnings?: string;
  learningEntries?: LearningEntry[];
}

// ---------------------------------------------------------------------------
// Initial state factories
// ---------------------------------------------------------------------------

/**
 * Returns the initial state for a single turning point.
 */
export function getInitialTurningPointState(): TurningPointState {
  return {
    selectedStrategicPloyIds: [],
    firefightPloyCounts: {},
  };
}

/**
 * Returns the initial state for a single game within the event.
 *
 * @param gameNumber - The game number (1, 2, or 3)
 */
export function getInitialGameState(gameNumber: 1 | 2 | 3): GameEventState {
  return {
    gameNumber,
    removedOperativeId: null,
    selectedEquipmentIds: [],
    blightGrenadeUsesRemaining: QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES,
    equipmentUsesRemaining: {},
    turningPoint: 0,
    commandPoints: QUICK_PLAY_DEFAULTS.STARTING_COMMAND_POINTS,
    turningPoints: {},
    incapacitatedOperativeIds: [],
    injuredOperativeIds: [],
    gamePhase: 'setup',
    opposition: '',
    critOp: '',
    tacOp: '',
    killOpKillCount: 0,
    opponentCount: 0,
    playerVP: 0,
    opponentVP: 0,
    iconBearerInEnemyTerritory: false,
  };
}

/**
 * Returns the initial state for an entire quick play event with 3 games.
 * The event starts immediately without a setup screen (setupComplete is always true).
 */
export function getInitialEventState(): QuickPlayEventState {
  return {
    version: QUICK_PLAY_DEFAULTS.SCHEMA_VERSION,
    eventName: '',
    setupComplete: true,
    activeGameIndex: 0,
    games: [
      getInitialGameState(1),
      getInitialGameState(2),
      getInitialGameState(3),
    ],
  };
}

// ---------------------------------------------------------------------------
// localStorage persistence — event state
// ---------------------------------------------------------------------------

/**
 * Saves the Quick Play Event state to localStorage.
 *
 * @param state - The event state to persist
 */
export function saveEventState(state: QuickPlayEventState): void {
  try {
    const serialised = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialised);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error(ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED, error);
      } else {
        console.error('Failed to save event state:', error.message);
      }
    }
    // Attempt to clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Loads the Quick Play Event state from localStorage.
 * Returns null if no saved state exists or the saved data is invalid.
 *
 * Applies migrations for older schema versions:
 *  v1 → v2: rename `usedFirefightPloyIds`→`firefightPloyCounts`,
 *            rename `injuredOperativeIds`→`incapacitatedOperativeIds`,
 *            rename `learnings`→`learningEntries`.
 *  v2 → v3: add `gamePhase`, `opposition`, `critOp`, `tacOp`, `killOpKillCount`;
 *            migrate `learningEntries` from event state to separate learnings storage.
 *  v3 → v4: replace `selectedStrategicPloyId` with `selectedStrategicPloyIds` array.
 *  v4 → v5: add `opponentCount` per game.
 *  v5 → v6: add `playerVP`, `opponentVP` per game.
 *
 * @returns The persisted event state, or null if unavailable
 */
export function loadEventState(): QuickPlayEventState | null {
  try {
    const serialised = localStorage.getItem(STORAGE_KEY);
    if (!serialised) {
      return null;
    }

    const parsed = JSON.parse(serialised) as LegacyEventStateV1;

    // Basic structural validation
    if (
      parsed &&
      typeof parsed === 'object' &&
      'games' in parsed &&
      Array.isArray(parsed.games) &&
      parsed.games.length === QUICK_PLAY_DEFAULTS.GAME_COUNT &&
      typeof parsed.setupComplete === 'boolean'
    ) {
      // v2 → v3: if the old state had learningEntries, migrate them to
      // the separate learnings storage (only if separate storage is empty).
      if (
        Array.isArray(parsed.learningEntries) &&
        parsed.learningEntries.length > 0
      ) {
        const existing = loadLearningsLog();
        if (existing.length === 0) {
          saveLearningsLog(parsed.learningEntries);
        }
      }

      // Migrate each game's fields to the current schema
      const migratedGames = parsed.games.map(
        (game: LegacyGameStateV1): GameEventState => {
          // v1 → v2: rename injuredOperativeIds → incapacitatedOperativeIds
          const incapacitatedOperativeIds: string[] = Array.isArray(
            game.incapacitatedOperativeIds
          )
            ? game.incapacitatedOperativeIds
            : Array.isArray(game.injuredOperativeIds)
              ? game.injuredOperativeIds
              : [];

          // v1 → v2: migrate turning points
          const turningPoints: Record<number, TurningPointState> = {};
          if (game.turningPoints && typeof game.turningPoints === 'object') {
            for (const [tpKey, tpVal] of Object.entries(game.turningPoints)) {
              const tpCounts: Record<string, number> = {};
              if (tpVal.firefightPloyCounts !== undefined) {
                // Already v2 format — sanitise values to ensure they are numbers
                for (const [k, v] of Object.entries(
                  tpVal.firefightPloyCounts
                )) {
                  tpCounts[k] = typeof v === 'number' ? v : 0;
                }
              } else if (Array.isArray(tpVal.usedFirefightPloyIds)) {
                // Legacy v1: each entry in the list counts as one use
                tpVal.usedFirefightPloyIds.forEach((id) => {
                  tpCounts[id] = 1;
                });
              }
              turningPoints[Number(tpKey)] = {
                selectedStrategicPloyIds: Array.isArray(
                  tpVal.selectedStrategicPloyIds
                )
                  ? tpVal.selectedStrategicPloyIds // already v4 format
                  : tpVal.selectedStrategicPloyId // migrate from v1/v2/v3
                    ? [tpVal.selectedStrategicPloyId]
                    : [],
                firefightPloyCounts: tpCounts,
              };
            }
          }

          // v2 → v3: add new game fields with sensible defaults
          const gamePhase: 'setup' | 'playing' =
            game.gamePhase === 'playing'
              ? 'playing'
              : game.turningPoint > 0
                ? 'playing' // already started — treat as playing
                : 'setup';

          return {
            gameNumber: game.gameNumber,
            removedOperativeId: game.removedOperativeId,
            selectedEquipmentIds: game.selectedEquipmentIds,
            blightGrenadeUsesRemaining: game.blightGrenadeUsesRemaining,
            equipmentUsesRemaining: game.equipmentUsesRemaining ?? {},
            turningPoint: game.turningPoint,
            commandPoints: game.commandPoints,
            incapacitatedOperativeIds,
            injuredOperativeIds: Array.isArray(game.injuredOperativeIds)
              ? game.injuredOperativeIds
              : [],
            turningPoints,
            gamePhase,
            opposition: game.opposition ?? '',
            critOp: game.critOp ?? '',
            tacOp: game.tacOp ?? '',
            killOpKillCount: game.killOpKillCount ?? 0,
            opponentCount: game.opponentCount ?? 0,
            playerVP: game.playerVP ?? 0,
            opponentVP: game.opponentVP ?? 0,
            iconBearerInEnemyTerritory:
              game.iconBearerInEnemyTerritory ?? false,
          };
        }
      );

      return {
        version: QUICK_PLAY_DEFAULTS.SCHEMA_VERSION,
        eventName: parsed.eventName,
        setupComplete: true, // always true in v3 — no setup screen
        activeGameIndex: parsed.activeGameIndex,
        games: migratedGames,
      };
    }

    // Invalid structure — clear corrupted data
    console.warn(ERROR_MESSAGES.INVALID_DATA);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Failed to load event state:', error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

/**
 * Clears the Quick Play Event state from localStorage.
 * Does NOT clear the learnings log — use clearLearningsLog() for that.
 */
export function clearEventState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear event state:', error);
  }
}

// ---------------------------------------------------------------------------
// localStorage persistence — learnings log (separate from event state)
// ---------------------------------------------------------------------------

/**
 * Saves the learnings log to its own localStorage key.
 * The log is stored separately from the event state so it survives resets.
 *
 * @param entries - The full list of learning entries to persist
 */
export function saveLearningsLog(entries: LearningEntry[]): void {
  try {
    localStorage.setItem(LEARNINGS_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to save learnings log:', error.message);
    }
  }
}

/**
 * Loads the learnings log from its own localStorage key.
 * Returns an empty array if no entries exist or the data is invalid.
 */
export function loadLearningsLog(): LearningEntry[] {
  try {
    const serialised = localStorage.getItem(LEARNINGS_STORAGE_KEY);
    if (!serialised) return [];
    const parsed = JSON.parse(serialised);
    return Array.isArray(parsed) ? (parsed as LearningEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Clears the learnings log from localStorage.
 */
export function clearLearningsLog(): void {
  try {
    localStorage.removeItem(LEARNINGS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear learnings log:', error);
  }
}

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------

/**
 * Returns the turning point state for a given turning point number,
 * initialising it with defaults if it has not been reached yet.
 *
 * @param game - The current game state
 * @param turningPointNumber - The turning point number (1–4)
 */
export function getTurningPointState(
  game: GameEventState,
  turningPointNumber: number
): TurningPointState {
  return (
    game.turningPoints[turningPointNumber] ?? getInitialTurningPointState()
  );
}

/**
 * Returns an updated game state with the given turning point state applied.
 *
 * @param game - The current game state
 * @param turningPointNumber - The turning point number to update (1–4)
 * @param tpState - The new turning point state
 */
export function updateTurningPointState(
  game: GameEventState,
  turningPointNumber: number,
  tpState: TurningPointState
): GameEventState {
  return {
    ...game,
    turningPoints: {
      ...game.turningPoints,
      [turningPointNumber]: tpState,
    },
  };
}

/**
 * Advances the turning point for a game, clearing used firefight ploy markers
 * for the new turning point and clamping to the maximum.
 *
 * @param game - The current game state
 * @returns Updated game state with incremented turning point
 */
export function advanceTurningPoint(game: GameEventState): GameEventState {
  const nextTp = Math.min(
    game.turningPoint + 1,
    GAME_DEFAULTS.MAX_TURNING_POINT
  );
  return {
    ...game,
    turningPoint: nextTp,
    // Initialise fresh turning point state (clears used firefight ploys)
    turningPoints: {
      ...game.turningPoints,
      [nextTp]: game.turningPoints[nextTp] ?? getInitialTurningPointState(),
    },
  };
}

// ---------------------------------------------------------------------------
// Markdown report generation
// ---------------------------------------------------------------------------

/**
 * Generates a Markdown-formatted event report combining all game results,
 * kill counts, equipment selections, and learnings log entries.
 *
 * The output is suitable for saving as a `.md` file or pasting into notes.
 *
 * @param event - The full quick play event state
 * @param learnings - All learning entries for the event
 * @param equipmentNames - Optional mapping of equipment ID → display name for
 *   the equipment summary lines (falls back to raw IDs if not provided).
 * @returns A Markdown string ready for download or clipboard.
 */
export function generateMarkdownReport(
  event: QuickPlayEventState,
  learnings: LearningEntry[],
  equipmentNames: Record<string, string> = {}
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Header ────────────────────────────────────────────────────────────
  const lines: string[] = [
    `# Kill Team Quick Play Event Report`,
    ``,
    `**Date:** ${dateStr}  `,
    event.eventName ? `**Event:** ${event.eventName}  ` : '',
    `**Faction:** Plague Marines`,
    ``,
  ];

  // ── Event summary ─────────────────────────────────────────────────────
  const results = event.games.map((g) => {
    if (g.gamePhase !== 'playing') return null;
    if (g.playerVP > g.opponentVP) return 'Win';
    if (g.playerVP < g.opponentVP) return 'Loss';
    return 'Draw';
  });
  const wins = results.filter((r) => r === 'Win').length;
  const losses = results.filter((r) => r === 'Loss').length;
  const draws = results.filter((r) => r === 'Draw').length;
  const totalPlayerVP = event.games.reduce((s, g) => s + g.playerVP, 0);
  const totalOpponentVP = event.games.reduce((s, g) => s + g.opponentVP, 0);

  lines.push(`## Event Summary`);
  lines.push(``);
  lines.push(`| Record | Your VP | Opp VP |`);
  lines.push(`|--------|---------|--------|`);
  lines.push(
    `| ${wins}W / ${losses}L / ${draws}D | ${totalPlayerVP} | ${totalOpponentVP} |`
  );
  lines.push(``);

  // ── Per-game details ──────────────────────────────────────────────────
  lines.push(`## Game Results`);
  lines.push(``);

  event.games.forEach((game, idx) => {
    const resultEmoji =
      results[idx] === 'Win' ? '🏆' : results[idx] === 'Loss' ? '💀' : '🤝';
    const resultLabel = results[idx] ?? 'Not played';

    lines.push(`### Game ${game.gameNumber} — ${resultEmoji} ${resultLabel}`);
    lines.push(``);

    if (game.opposition) lines.push(`**Opponent:** ${game.opposition}  `);
    if (game.critOp) lines.push(`**Crit Op:** ${game.critOp}  `);
    if (game.tacOp) lines.push(`**Tac Op:** ${game.tacOp}  `);
    if (game.opponentCount > 0)
      lines.push(`**Opponent Operatives:** ${game.opponentCount}  `);
    lines.push(``);

    lines.push(`| Your VP | Opp VP | Kill Op Kills |`);
    lines.push(`|---------|--------|---------------|`);
    lines.push(
      `| ${game.playerVP} | ${game.opponentVP} | ${game.killOpKillCount}${game.opponentCount > 0 ? `/${game.opponentCount}` : ''} |`
    );
    lines.push(``);

    // Equipment
    if (game.selectedEquipmentIds.length > 0) {
      lines.push(`**Equipment used:**`);
      game.selectedEquipmentIds.forEach((id) => {
        const name = equipmentNames[id] ?? id;
        lines.push(`- ${name}`);
      });
      lines.push(``);
    }

    // Incapacitated operatives
    if (game.incapacitatedOperativeIds.length > 0) {
      lines.push(
        `**Friendly operatives incapacitated:** ${game.incapacitatedOperativeIds.length}`
      );
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(``);
  });

  // ── Learnings log ─────────────────────────────────────────────────────
  if (learnings.length > 0) {
    lines.push(`## Learnings & Notes`);
    lines.push(``);
    learnings.forEach((entry, i) => {
      const ts = new Date(entry.timestamp).toLocaleString('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const context = [entry.oppositionTeam, entry.critOp, entry.tacOp]
        .filter(Boolean)
        .join(' · ');
      lines.push(
        `${i + 1}. ${entry.text}${context ? `  \n   _[${context}]_` : ''}${` — ${ts}`}`
      );
    });
    lines.push(``);
  }

  // Filter out consecutive blank lines
  return lines
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n');
}

// ---------------------------------------------------------------------------
// Google Drive sync (optional, requires OAuth client setup)
// ---------------------------------------------------------------------------

const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_DRIVE_FILES_API = 'https://www.googleapis.com/drive/v3/files';
const GOOGLE_DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';
const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_EVENT_FILE_NAME = 'kill-team-event.json';

let googleAccessToken: string | null = null;
let gisScriptPromise: Promise<void> | null = null;
let googleAuthInteractionExpiresAt = 0;

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (params?: { prompt?: string }) => void;
}

interface GoogleDriveFileSummary {
  id: string;
}

interface GoogleDriveFileListResponse {
  files?: GoogleDriveFileSummary[];
}

interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: unknown) => void;
  }) => GoogleTokenClient;
}

interface GoogleGlobal {
  accounts?: {
    oauth2?: GoogleAccountsOAuth2;
  };
}

function getGoogleClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'Google Drive sync is not configured. Add VITE_GOOGLE_OAUTH_CLIENT_ID to your environment.'
    );
  }
  return clientId;
}

export function isGoogleDriveSyncConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID);
}

export function signOutGoogleDriveSync(): void {
  googleAccessToken = null;
}

/**
 * Must be called from a direct user gesture before starting Google OAuth.
 * This prevents popup auth from being triggered automatically on page load.
 */
export function beginGoogleAuthInteraction(): void {
  googleAuthInteractionExpiresAt = Date.now() + 15_000;
}

function consumeGoogleAuthInteractionOrThrow(): void {
  if (Date.now() > googleAuthInteractionExpiresAt) {
    throw new Error(
      'Google login is gated behind user interaction. Click "Login with Google" to continue.'
    );
  }
  // One-shot consumption to avoid accidental retries without another click.
  googleAuthInteractionExpiresAt = 0;
}

async function ensureGoogleIdentityScriptLoaded(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Google login is only available in a browser environment.');
  }

  const existingGoogle = (window as Window & { google?: GoogleGlobal }).google;
  if (existingGoogle?.accounts?.oauth2) {
    return;
  }

  if (gisScriptPromise) {
    return gisScriptPromise;
  }

  gisScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google Identity Services script.')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script.'));
    };
    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

async function requestGoogleAccessToken(): Promise<string> {
  consumeGoogleAuthInteractionOrThrow();
  await ensureGoogleIdentityScriptLoaded();

  const googleGlobal = (window as Window & { google?: GoogleGlobal }).google;
  const oauth2 = googleGlobal?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Google Identity Services is unavailable. Please refresh and try again.');
  }

  const clientId = getGoogleClientId();

  const token = await new Promise<string>((resolve, reject) => {
    let resolved = false;
    const timeoutId = window.setTimeout(() => {
      if (resolved) return;
      resolved = true;
      reject(
        new Error(
          'Google sign-in timed out. Please retry and allow popups for this site.'
        )
      );
    }, 30000);

    const settleResolve = (accessToken: string) => {
      if (resolved) return;
      resolved = true;
      window.clearTimeout(timeoutId);
      resolve(accessToken);
    };

    const settleReject = (message: string) => {
      if (resolved) return;
      resolved = true;
      window.clearTimeout(timeoutId);
      reject(new Error(message));
    };

    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: (response: GoogleTokenResponse) => {
        if (resolved) return;

        if (response.error) {
          settleReject(
            response.error_description ||
              `Google auth failed with error: ${response.error}`
          );
          return;
        }

        if (!response.access_token) {
          settleReject('Google auth did not return an access token.');
          return;
        }

        settleResolve(response.access_token);
      },
      error_callback: () => {
        settleReject('Google auth popup failed or was blocked.');
      },
    });

    tokenClient.requestAccessToken({
      prompt: googleAccessToken ? '' : 'consent',
    });
  });

  googleAccessToken = token;
  return token;
}

async function getDriveAccessToken(): Promise<string> {
  if (googleAccessToken) {
    return googleAccessToken;
  }
  return requestGoogleAccessToken();
}

async function driveRequest(
  url: string,
  init: RequestInit = {},
  retryOnUnauthorized = true
): Promise<Response> {
  const token = await getDriveAccessToken();
  const headers = new Headers(init.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 401 && retryOnUnauthorized) {
    googleAccessToken = null;
    return driveRequest(url, init, false);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Drive request failed (${response.status}): ${message}`);
  }

  return response;
}

function buildMultipartBody(metadata: Record<string, unknown>, content: string): {
  body: string;
  boundary: string;
} {
  const boundary = `batch_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${content}\r\n` +
    `--${boundary}--`;

  return { body, boundary };
}

async function findEventFileIdInDrive(): Promise<string | null> {
  const query =
    `name='${DRIVE_EVENT_FILE_NAME}' and trashed=false and 'appDataFolder' in parents`;
  const url =
    `${GOOGLE_DRIVE_FILES_API}?spaces=appDataFolder&fields=files(id)&q=${encodeURIComponent(query)}`;

  const response = await driveRequest(url, { method: 'GET' });
  const payload = (await response.json()) as GoogleDriveFileListResponse;
  const file = payload.files?.[0];
  return file?.id ?? null;
}

function isQuickPlayEventStateShape(value: unknown): value is QuickPlayEventState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as QuickPlayEventState;
  if (!Array.isArray(candidate.games)) {
    return false;
  }

  return candidate.games.length === QUICK_PLAY_DEFAULTS.GAME_COUNT;
}

/**
 * Initiates Google OAuth sign-in and stores the access token in memory.
 * The token is never written to localStorage.
 */
export async function signInWithGoogle(): Promise<void> {
  await requestGoogleAccessToken();
}

/**
 * Saves the Quick Play Event state to a JSON file in the user's Google Drive
 * appData folder. This keeps the file hidden from normal Drive UI while still
 * allowing cross-device restore.
 */
export async function saveEventStateToGoogleDrive(
  state: QuickPlayEventState
): Promise<void> {
  const existingFileId = await findEventFileIdInDrive();
  const stateJson = JSON.stringify(state);

  if (existingFileId) {
    const { body, boundary } = buildMultipartBody({}, stateJson);
    await driveRequest(
      `${GOOGLE_DRIVE_UPLOAD_API}/${existingFileId}?uploadType=multipart`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );
    return;
  }

  const metadata = {
    name: DRIVE_EVENT_FILE_NAME,
    parents: ['appDataFolder'],
  };
  const { body, boundary } = buildMultipartBody(metadata, stateJson);

  await driveRequest(`${GOOGLE_DRIVE_UPLOAD_API}?uploadType=multipart`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
}

/**
 * Loads the Quick Play Event state from Google Drive appData folder.
 * Returns null when no cloud file exists.
 */
export async function loadEventStateFromGoogleDrive(): Promise<QuickPlayEventState | null> {
  const existingFileId = await findEventFileIdInDrive();
  if (!existingFileId) {
    return null;
  }

  const response = await driveRequest(
    `${GOOGLE_DRIVE_FILES_API}/${existingFileId}?alt=media`,
    {
      method: 'GET',
    }
  );
  const parsed = (await response.json()) as unknown;

  if (!isQuickPlayEventStateShape(parsed)) {
    throw new Error('Invalid event data found in Google Drive sync file.');
  }

  return parsed;
}
