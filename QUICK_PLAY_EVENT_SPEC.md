# Quick Play Event — Specification

## Overview

A specialised companion within the Kill Team Dataslate for attending **quick play events (tournaments)** with **Plague Marines only**. Designed to run **3 games in a single day** where the player may not know opponents in advance.

The interface is themed around **Grandfather Nurgle**: green palette, with the sacred numbers **3** (three games) and **7** (seven operatives) prominent throughout.

> **Design principle:** This feature maximises reuse of existing codebase assets — components, services, types, CSS variables, and patterns — to ensure consistency and reduce maintenance burden. See [Codebase Reuse](#codebase-reuse) for details.

---

## Feature Requirements

### 1. Event Setup

- Optional event name (free text)
- **3 game slots** pre-configured (Nurgle's sacred number 3)
- Data persists between sessions via **localStorage** (primary) with optional **Google Drive** sync (see [Persistence](#8-data-persistence))
- "Reset Event" button with confirmation to wipe state and start fresh

### 2. Operative Roster — "Remove One" Mechanic

The Plague Marines roster has exactly **7 operatives** (Nurgle's sacred number). For each game, one operative is removed, fielding **6** for that game.

**Standard 7-man roster:**

| # | Operative | Role |
|---|-----------|------|
| 1 | Plague Marine Champion | Leader |
| 2 | Plague Marine Bombardier | Specialist (Grenadier) |
| 3 | Plague Marine Fighter | Specialist (Flail) |
| 4 | Plague Marine Heavy Gunner | Specialist (Plague Spewer) |
| 5 | Plague Marine Icon Bearer | Specialist (Icon) |
| 6 | Malignant Plaguecaster | Specialist (Psyker) |
| 7 | Plague Marine Warrior | Standard |

**Interaction model:** Display all 7 operatives using the existing `OperativeCard` component. Each card has a "Remove from Game" / "Restore" toggle button below it. Exactly one non-leader operative may be removed per game. The Champion (type `"Leader"`) cannot be removed.

### 3. Equipment Selection & Tracking

Per game, player selects from the faction equipment (reusing the existing `Equipment` type from `faction.json`):

| Equipment | Notes |
|-----------|-------|
| Plague Bells | Passive stat effect, no usage limit |
| Blight Grenades | Ranged weapon, **max 2 uses per game** (tracked via existing `LimitedItemTracker`) |
| Plague Rounds | Passive weapon modifier, no usage limit |

**Blight Grenade tracking:**

- Uses the existing `LimitedItemTracker` component (max 2 uses)
- The Bombardier's `Grenadier` ability means **his grenade uses do not count** towards the 2-use limit
- When Blight Grenades equipment is selected, the Bombardier's `OperativeCard` shows a **modified grenade weapon** with Hit stat **improved by 1** (4+ → 3+)
- A note is shown on the card: _"Grenadier: +1 Hit stat. Does not count towards usage limit."_
- This is achieved by injecting a synthetic `Weapon` object (with `ballisticSkill: 3`) into the weapons list passed to `OperativeCard`

**Equipment resets per game** — player selects fresh equipment for each game.

### 4. Turning Point Management

- Turning points numbered **1–4**
- Player selects/advances the current turning point
- A **strategic ploy** is selected once per turning point and displayed prominently throughout
- Moving to the next turning point clears the firefight ploy "used" markers (awaiting Open Question #7 confirmation)

### 5. Strategic Ploys

Four strategic ploys from `faction.json` (type `strategy`, cost **1 CP** each unless modified):

| Ploy | CP | Notes |
|------|----|-------|
| Contagion | 1 (or **0**) | 0 CP if Icon Bearer is in opponent territory |
| Lumbering Death | 1 | |
| Cloud of Flies | 1 | |
| Nurglings | 1 | Targets within **3"** (or **7"** if poisoned) |

**Selection:** Player selects exactly one strategic ploy per turning point. The selected ploy is displayed as a highlighted info card for the rest of the turning point.

### 6. Command Points (CP) Tracking

- Player tracks their own CP with +/− buttons
- Constrained to 0–20 (reusing `GAME_DEFAULTS.MIN_COMMAND_POINTS` and `GAME_DEFAULTS.MAX_COMMAND_POINTS` from `constants.ts`)
- Default starting CP: **2** per turning point (configurable via Open Question #2)

### 7. Firefight Ploys

Four firefight ploys from `faction.json` (type `firefight`, cost **1 CP** each):

| Ploy | When |
|------|------|
| Virulent Poison | During activation |
| Poisonous Demise | When friendly operative incapacitated |
| Sickening Resilience | When taking damage |
| Curse of Rot | After opponent rolls dice in combat within **3"** (**7"** if poisoned) |

**Display behaviour:**

- All 4 firefight ploys always shown (data sourced from `faction.json` `ploys` array)
- Ploys the player **can afford** (CP ≥ cost) are highlighted
- Ploys the player **cannot afford** are dimmed
- Player can tap a ploy to mark it as "Used" this turning point
- Used markers reset when advancing to next turning point

### 8. Data Persistence

#### Primary: localStorage

- All event state saved automatically on every change
- Key: `kill-team-quick-play-event` (added to `STORAGE_KEYS` in `constants.ts`)
- Follows the same save/load/clear pattern as `teamStorage.ts`
- No login required, works with GitHub Pages offline

**Limitations:** Per-device only; data lost if browser storage is cleared.

#### Secondary Option: Google Drive (Architecture Stub)

Google Drive JSON file sync is architecturally viable for a GitHub Pages client-side app:

1. User authenticates via **Google OAuth 2.0 (PKCE / implicit flow)**
2. App requests `drive.file` scope (access only to files it creates — least privilege)
3. State saved as `kill-team-event.json` in the user's Google Drive
4. On load, app checks for existing Drive file and offers to restore it

**Requirements to implement:**
- Google Cloud project with OAuth 2.0 Web Application client
- Authorised JavaScript origin: `https://aaronbridgeman.github.io`
- Google Drive API v3 enabled on the project
- No server required — fully client-side via Google Identity Services JS SDK

> **Open Question #1:** Should Google Drive sync be implemented? If yes, please create a Google Cloud project, enable the Drive API, and provide the OAuth 2.0 client ID.

**Current status:** Stub/documentation only in `src/services/eventStorage.ts`. Not implemented pending Open Question #1.

---

## Nurgle Green Theme

CSS custom properties scoped to the `.quick-play-event` container, extending (not replacing) the existing `:root` variables from `index.css`. No impact on the rest of the app.

| Token | Value | Use |
|-------|-------|-----|
| `--nurgle-bg` | `#0f1a0e` | Page background |
| `--nurgle-surface` | `#1c2e1a` | Cards, panels |
| `--nurgle-surface-raised` | `#243d21` | Elevated surfaces |
| `--nurgle-primary` | `#4a7c3f` | Primary Nurgle green |
| `--nurgle-accent` | `#7ab648` | Accent / highlight green |
| `--nurgle-text` | `#d4e8c2` | Primary text |
| `--nurgle-text-muted` | `#8aad7a` | Secondary text |
| `--nurgle-border` | `#3a5c35` | Borders |
| `--nurgle-gold` | `#c9a227` | Nurgle gold accents |
| `--nurgle-danger` | `#8b2020` | Warnings / removed operative indicator |

**Sacred numbers 3 and 7:**
- **3 games** in the event
- **7 operatives** in the roster (one removed = 6 per game)
- Ploy descriptions reference "**3**\"" and "**7**\"" ranges (Nurglings, Virulent Poison, Curse of Rot)
- Roll result of "**7**+" featured in Virulent Poison ploy

---

## Codebase Reuse

This feature deliberately reuses existing assets:

| Asset | Source | Used For |
|-------|--------|----------|
| `Faction`, `Operative`, `Ploy`, `Equipment`, `Ability`, `Weapon` types | `src/types/` | All data modelling |
| `loadFaction('plague-marines')` | `src/services/dataLoader.ts` | Loading all operative, ploy, equipment data |
| `OperativeCard` component | `src/components/datacard/` | Displaying operative stat blocks in roster |
| `LimitedItemTracker` component | `src/components/common/` | Tracking Blight Grenade uses |
| `GAME_DEFAULTS` constants | `src/constants.ts` | CP min/max bounds |
| `STORAGE_KEYS` constant | `src/constants.ts` | localStorage key (added to existing map) |
| `:root` CSS variables | `src/index.css` | Base layout and spacing tokens |
| localStorage save/load pattern | `src/services/teamStorage.ts` | Event state persistence |
| `getModifiedHitStat` | `src/services/injuredCalculator.ts` | Not called directly, but the pattern informs grenade hit stat modification |

---

## Component Architecture

```
QuickPlayEventView          # Main Nurgle-themed container; loads faction data
├── EventSetup              # First-time setup (event name, begin button)
└── [When setupComplete]
    ├── GameTabs            # Three tab buttons: Game 1 / Game 2 / Game 3
    ├── GamePanel           # Active game content panel
    │   ├── OperativeRosterManager    # Show all 7 operatives; remove/restore 1
    │   │   └── OperativeCard ×7     # Reused component; Bombardier augmented when grenades selected
    │   ├── EventEquipmentTracker    # Equipment selection + grenade usage
    │   │   └── LimitedItemTracker   # Reused component for Blight Grenade uses
    │   ├── TurningPointPloys        # TP selector, strategic ploy selection & display
    │   │   ├── CPTracker            # CP +/− tracker
    │   │   ├── StrategicPloySelector # Choose one ploy per TP
    │   │   └── FirefightPloys       # Show all 4 with affordability & used state
    │   └── [separator]
    └── LearningsTracker    # Free text notes — shared across all 3 games
```

Files created under `src/components/event/`:

| File | Purpose |
|------|---------|
| `QuickPlayEventView.tsx` | Root container and state manager |
| `QuickPlayEventView.css` | Nurgle theme CSS variables and layout |
| `EventSetup.tsx` | Event name / first-run setup |
| `EventSetup.css` | Setup screen styles |
| `GamePanel.tsx` | Per-game content wrapper |
| `GamePanel.css` | Game panel layout styles |
| `OperativeRosterManager.tsx` | 7-operative display with remove/restore |
| `OperativeRosterManager.css` | Roster layout styles |
| `EventEquipmentTracker.tsx` | Equipment selection and grenade tracking |
| `EventEquipmentTracker.css` | Equipment tracker styles |
| `TurningPointPloys.tsx` | Turning point + ploy management |
| `TurningPointPloys.css` | Ploy panel styles |
| `CPTracker.tsx` | Command point display and adjustment |
| `CPTracker.css` | CP tracker styles |
| `LearningsTracker.tsx` | Free-text notes textarea |
| `LearningsTracker.css` | Notes area styles |

---

## Type Definitions

See `src/types/event.ts` for full TypeScript definitions. Summary:

```typescript
/** State for a single turning point's ploy selections */
interface TurningPointState {
  selectedStrategicPloyId: string | null;
  usedFirefightPloyIds: string[];
}

/** State for a single game within the event */
interface GameEventState {
  gameNumber: 1 | 2 | 3;
  removedOperativeId: string | null;  // null = all 7 present
  selectedEquipmentIds: string[];
  blightGrenadeUsesRemaining: number; // 0–2; reset per game
  turningPoint: number;               // 0 = not started, 1–4 active
  commandPoints: number;
  turningPoints: Record<number, TurningPointState>; // keyed 1–4
}

/** Top-level event state */
interface QuickPlayEventState {
  version: number;            // Schema version for future migrations
  eventName: string;
  setupComplete: boolean;
  activeGameIndex: number;    // 0–2
  games: GameEventState[];    // Always exactly 3 elements
  learnings: string;          // Shared free-text notes
}
```

---

## Testing Plan

All tests follow the existing patterns in `tests/unit/`. Run with `npm run test`.

### Service Tests — `tests/unit/eventStorage.test.ts`

| Test | Description |
|------|-------------|
| `getInitialEventState` | Returns correctly structured initial state with 3 games |
| `saveEventState` | Serialises state to `localStorage` |
| `loadEventState` | Deserialises and validates state from `localStorage` |
| `loadEventState (missing)` | Returns `null` when no saved state |
| `loadEventState (corrupt)` | Clears and returns `null` for invalid JSON |
| `clearEventState` | Removes key from `localStorage` |
| `getInitialGameState` | Returns correctly structured game state for each game number |

### Component Tests

| File | Tests |
|------|-------|
| `tests/unit/QuickPlayEventView.test.tsx` | Renders setup screen on first load; shows game tabs after setup; persists/restores from localStorage |
| `tests/unit/OperativeRosterManager.test.tsx` | Shows all 7 operatives; allows removing one non-leader; prevents removing leader; prevents removing more than one |
| `tests/unit/TurningPointPloys.test.tsx` | Advances turning point; selects strategic ploy; highlights/dims firefight ploys by CP; marks used ploys; resets used on TP advance |
| `tests/unit/CPTracker.test.tsx` | Increments/decrements CP; clamps at 0 and 20 |
| `tests/unit/EventEquipmentTracker.test.tsx` | Toggles equipment selection; tracks Blight Grenade uses; Bombardier card shows grenade with +1 hit when grenades selected |

### Coverage Target

80%+ line coverage on new service and component files, consistent with existing project targets.

---

## Documentation Plan

### Files Updated Alongside Code

| Document | Change |
|----------|--------|
| `ARCHITECTURE.md` | Add Quick Play Event to component hierarchy diagram and component table |
| `SPEC.md` | Mark Quick Play Event as a new feature (Implementation Status section) |
| `README.md` | Add Quick Play Event to Features list |
| JSDoc on all public functions | Standard for all `src/services/` and `src/components/event/` files |

### Maintenance Responsibility

- Each new component and service function carries JSDoc comments
- Architecture diagram updated whenever new components are added to `src/components/event/`
- Test coverage checked on every PR via `npm run test:coverage`
- Any schema migration (change to `QuickPlayEventState`) must:
  1. Increment `version` field
  2. Add migration logic in `eventStorage.ts`
  3. Update this spec's [Type Definitions](#type-definitions) section

---

## Open Questions for User Input

1. **Google Drive sync:** Should this be implemented? (See [Persistence](#8-data-persistence) for requirements.)

2. **Starting CP:** How many Command Points do you start each turning point with? Does CP carry over between turning points, or reset?

3. **Strategic ploy cost:** Does choosing a strategic ploy deduct 1 CP from your pool, or is strategic ploy selection free?

4. **Wound tracking:** Should operative wounds be tracked during the game (like the existing Game Mode view)?

5. **Multiple equipment items:** Kill Team allows up to 4 items total. Should the 4-item limit be enforced here, or can any combination of the 3 faction items be selected?

6. **Bombardier Toxic rule:** The Grenadier ability also adds the **Toxic** rule to grenades. Should this also be shown on the modified card note?

7. **Firefight ploy reset:** Should used-ploy markers reset **automatically** when the turning point advances, or should the player manually clear them?

8. **Score tracking:** Should the app track victory points / mission scores per game?

9. **Mission selection:** Should the app include mission selection to help with objective tracking?

10. **Opponent faction:** Would tracking the opponent's faction (for cross-faction ploy interactions) be useful?

---

## Non-Functional Requirements

- Works **offline** (PWA / localStorage — no network needed at the gaming table)
- **Mobile-first** responsive design (primary use case: phone at a gaming table)
- No new external dependencies
- Must not affect existing app functionality
- Accessible (WCAG 2.1 AA where practical — semantic HTML, aria labels)

---

## Implementation Status

| Feature | Status |
|---------|--------|
| Spec & open questions | ✅ Complete |
| TypeScript types (`src/types/event.ts`) | ✅ Skeleton |
| localStorage persistence | ✅ Skeleton |
| Google Drive persistence | 🔲 Stub only — awaiting Open Question #1 |
| `QuickPlayEventView` | ✅ Skeleton |
| `EventSetup` | ✅ Skeleton |
| `GamePanel` + game tabs | ✅ Skeleton |
| `OperativeRosterManager` (reuses `OperativeCard`) | ✅ Skeleton |
| `EventEquipmentTracker` (reuses `LimitedItemTracker`) | ✅ Skeleton |
| `TurningPointPloys` | ✅ Skeleton |
| `CPTracker` | ✅ Skeleton |
| Firefight ploy display | ✅ Skeleton |
| `LearningsTracker` | ✅ Skeleton |
| Nurgle green CSS theme | ✅ Skeleton |
| App navigation integration | ✅ Complete |
| Service unit tests | ✅ Skeleton |
| Component unit tests | ✅ Skeleton |
| `ARCHITECTURE.md` updated | ✅ Complete |
| `SPEC.md` updated | ✅ Complete |
| `README.md` updated | ✅ Complete |
| Wound tracking | 🔲 Pending Open Question #4 |
| Score / mission tracking | 🔲 Pending Open Questions #8 & #9 |
