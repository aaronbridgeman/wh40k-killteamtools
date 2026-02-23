# Missing Kill Team Features - Implementation Plan

## Executive Summary

This document outlines missing Warhammer 40K Kill Team rules and features from the current implementation, along with a prioritized roadmap for adding them. The application currently supports core gameplay tracking (wounds, CP, activation) but lacks several important game systems including ploys, missions, and advanced terrain mechanics.

## Current Implementation Status

### ✅ Implemented Features

**Core Game Systems:**

- Turning point tracking (1-4)
- Initiative determination
- Command Point (CP) management
- Operative activation tracking
- Wound tracking with auto-injury detection
- Equipment with limited uses
- Basic action system (Move, Dash, Charge, Fall Back, Shoot, Fight)

**Team Building:**

- Operative selection with weapon loadouts
- Equipment assignment (max 4 per team)
- Faction-specific rules (Chapter Tactics for Angels of Death)
- Team persistence via LocalStorage

**Reference Materials:**

- Weapon special rules glossary (24+ rules)
- General game rules
- Actions reference with AP costs

**Supported Factions:**

- Angels of Death (Space Marines)
- Plague Marines (Death Guard)

## Missing Features Analysis

### 🔴 Priority 1: Critical Game Systems

These features are essential for complete Kill Team gameplay and should be implemented first.

#### 1.1 Strategic & Tactical Ploys System

**Description:** Ploys are special abilities that cost Command Points and provide tactical advantages. Each faction has unique Strategic Ploys (used in Strategy phase) and Tactical Ploys (used in Firefight phase).

**Why Critical:** Ploys are a core mechanic that dramatically affects gameplay strategy and tactics. They're used in every game.

**Implementation Requirements:**

**Data Model:**

```typescript
interface Ploy {
  id: string;
  name: string;
  type: 'strategic' | 'tactical';
  cost: number; // CP cost
  timing: string; // e.g., "Strategy phase", "When an operative activates"
  effect: string; // Full effect description
  restrictions?: string[]; // Usage restrictions
  keywords?: string[]; // Required keywords
}

interface FactionPloys {
  strategic: Ploy[];
  tactical: Ploy[];
}
```

**UI Components:**

- `PloySelector.tsx` - Browse and use ploys
- `PloyCard.tsx` - Display individual ploy
- `ActivePloysTracker.tsx` - Track used ploys per turning point

**Service Layer:**

- `ployService.ts` - Validate ploy usage, check costs, track usage per turning point

**Data Requirements:**

- Add ploys to each faction JSON
- Create ploy validation rules
- Track used ploys in game state

**Estimated Effort:** 2-3 weeks

---

#### 1.2 Mission & Scenario Framework

**Description:** Missions define victory conditions, deployment zones, objective placement, and special rules. Common missions include Recover, Seize Ground, and Domination.

**Why Critical:** Missions provide the game's objective and structure. Without missions, games lack direction.

**Implementation Requirements:**

**Data Model:**

```typescript
interface Mission {
  id: string;
  name: string;
  description: string;
  turningPoints: number; // Usually 4
  victoryPoints: {
    primary: VictoryCondition[];
    secondary?: VictoryCondition[];
  };
  deployment: DeploymentConfiguration;
  objectiveMarkers: ObjectiveConfiguration;
  specialRules?: string[];
}

interface VictoryCondition {
  name: string;
  description: string;
  vpReward: number;
  timing: string; // When VP is scored
}

interface ObjectiveConfiguration {
  count: number;
  placement: string; // Rules for placing markers
  control: string; // Rules for controlling markers
}
```

**UI Components:**

- `MissionSelector.tsx` - Select mission for game
- `MissionDisplay.tsx` - Show mission details and VP conditions
- `ObjectivePlacement.tsx` - Visual objective placement tool
- `VictoryPointTracker.tsx` - Calculate and track VP

**Service Layer:**

- `missionService.ts` - Load missions, validate configuration
- `victoryPointService.ts` - Calculate VP from game state

**Data Requirements:**

- Create mission JSON files for Core Book missions
- Define objective marker types
- Add deployment zone configurations

**Estimated Effort:** 3-4 weeks

---

#### 1.3 Objective Markers & Control

**Description:** Objective markers are physical tokens placed on the board that operatives can control. Control is determined by proximity and operative count.

**Why Critical:** Objectives are the primary way to score victory points in most missions.

**Implementation Requirements:**

**Data Model:**

```typescript
interface ObjectiveMarker {
  id: string;
  name: string; // e.g., "Objective 1", "Central Objective"
  position?: { x: number; y: number }; // Optional board position
  controlledBy: 'alpha' | 'bravo' | null;
  contestedByAlpha: string[]; // Operative IDs within range
  contestedByBravo: string[]; // Operative IDs within range
}

interface ObjectiveControl {
  range: number; // Control range in inches (usually 2")
  requirements: string; // e.g., "Closest friendly operative"
}
```

**UI Components:**

- `ObjectiveMarkerPanel.tsx` - List all objectives
- `ObjectiveControlIndicator.tsx` - Show control status
- `ObjectiveAssignmentModal.tsx` - Assign operatives to objectives

**Service Layer:**

- `objectiveService.ts` - Calculate control, determine contested status
- Integration with mission VP calculation

**Game State Updates:**

- Add objective markers to game state
- Track operative proximity to objectives
- Auto-calculate control (with manual override)

**Estimated Effort:** 2 weeks

---

#### 1.4 Tac Ops (Secondary Objectives)

**Description:** Tac Ops are secret secondary objectives that provide additional VP. Players select 1-3 Tac Ops before the battle from archetypes like Security, Infiltration, or Recon.

**Why Critical:** Tac Ops add strategic depth and are part of the core matched play rules.

**Implementation Requirements:**

**Data Model:**

```typescript
interface TacOp {
  id: string;
  name: string;
  archetype: 'security' | 'infiltration' | 'recon' | 'seek-and-destroy';
  description: string;
  victoryCondition: string;
  vpReward: number; // Usually 2 VP
  revealed: boolean; // Revealed when achieved
}

interface SelectedTacOps {
  alpha: TacOp[];
  bravo: TacOp[];
}
```

**UI Components:**

- `TacOpSelector.tsx` - Select Tac Ops before game
- `TacOpTracker.tsx` - Track and reveal Tac Ops
- `TacOpCard.tsx` - Display Tac Op details

**Service Layer:**

- `tacOpService.ts` - Load Tac Ops, validate selection
- Integration with VP tracker

**Data Requirements:**

- Create Tac Ops JSON database
- Define archetypes and constraints
- Add reveal/scoring triggers

**Estimated Effort:** 1-2 weeks

---

### 🟡 Priority 2: Enhanced Game Mechanics

These features improve gameplay accuracy and simulation but aren't absolutely critical.

#### 2.1 Advanced Terrain Rules

**Description:** Terrain affects movement, visibility, and cover. Types include Light/Heavy cover, Vantage points, Traverse terrain, and Obscuring terrain.

**Implementation Requirements:**

**Data Model:**

```typescript
interface TerrainPiece {
  id: string;
  name: string;
  type: 'light' | 'heavy' | 'vantage' | 'traverse' | 'obscuring';
  effects: {
    cover?: 'light' | 'heavy';
    vantage?: boolean;
    traverseCost?: number; // AP cost
    obscuring?: boolean;
  };
}

interface TerrainState {
  pieces: TerrainPiece[];
  operativePositions?: Map<string, string>; // Operative ID -> Terrain ID
}
```

**UI Components:**

- `TerrainSetup.tsx` - Define terrain pieces
- `TerrainIndicator.tsx` - Show terrain effects on operatives
- `CoverCalculator.tsx` - Determine cover from terrain

**Service Layer:**

- `terrainService.ts` - Calculate cover, vantage, obscuring effects

**Estimated Effort:** 2-3 weeks

---

#### 2.2 Additional Actions

**Description:** Add missing actions like Traverse, Pick Up, Overwatch, and unique operative actions.

**Missing Actions:**

- **Traverse (1-2AP):** Climb or move through terrain
- **Pick Up (1AP):** Pick up objective marker or token
- **Overwatch (2AP):** React to enemy movement
- **Unique Actions:** Faction-specific actions (e.g., Astartes Combat Squad Split)

**Implementation Requirements:**

**Data Model:**

```typescript
interface Action {
  id: string;
  name: string;
  apCost: number | string; // e.g., "1" or "2" or "1+"
  description: string;
  requirements?: string[]; // e.g., "Within 1\" of objective"
  type: 'core' | 'unique' | 'universal';
}
```

**UI Updates:**

- Add to actions reference page
- Add buttons to operative activation panel
- Track special action usage

**Estimated Effort:** 1 week

---

#### 2.3 Group Activation Implementation

**Description:** Some operatives have Group Activation (GA) stat > 1, allowing multiple operatives to activate together. Currently tracked but not enforced.

**Implementation Requirements:**

- Update activation UI to support group selection
- Validate GA rules (must be within 2" at start of activation)
- Track group activation separately from individual activation

**Estimated Effort:** 1 week

---

#### 2.4 Ready vs. Activated State Tracking

**Description:** Operatives transition from Ready → Activated → Expired. Currently only tracks activated/not activated.

**Implementation Requirements:**

- Add "ready" state to operative tracking
- Update UI to show three states clearly
- Implement Counteract rule properly (only for Expired operatives)

**Estimated Effort:** 3-5 days

---

### 🟢 Priority 3: Advanced Features

These features enhance the experience but are nice-to-have rather than essential.

#### 3.1 Status Effects & Tokens

**Description:** Track various status effects and tokens on operatives.

**Missing Status Effects:**

- **Stun tokens:** Reduce APL
- **Confused status:** Random movement
- **Engaged status:** In melee combat
- **Auspex Scan tokens**
- **Marker Light tokens** (for T'au)

**Implementation Requirements:**

**Data Model:**

```typescript
interface StatusEffect {
  id: string;
  name: string;
  effect: string;
  duration: 'turning-point' | 'activation' | 'battle' | 'permanent';
  icon?: string;
}

interface OperativeStatus {
  effects: StatusEffect[];
  tokens: Map<string, number>; // Token type -> count
}
```

**UI Components:**

- `StatusEffectPanel.tsx` - Manage status effects
- `TokenCounter.tsx` - Track various tokens
- Status icons on operative cards

**Estimated Effort:** 1-2 weeks

---

#### 3.2 Fire Team Composition Validation

**Description:** Enforce Fire Team rules (e.g., must have 1 Leader, max X Heavy operatives, specific combinations).

**Implementation Requirements:**

- Define fire team rules in faction data
- Create validation service
- Show real-time validation feedback in team builder
- Display fire team composition summary

**Estimated Effort:** 1 week

---

#### 3.3 Spec Ops Campaign System

**Description:** Campaign mode with persistent rosters, experience, requisitions, and battle honours.

**Implementation Requirements:**

**Data Model:**

```typescript
interface SpecOpsRoster {
  id: string;
  name: string;
  faction: string;
  requisitionPoints: number;
  totalXP: number;
  operatives: SpecOpsOperative[];
  equipment: EquipmentAsset[];
  battleTally: BattleRecord[];
}

interface SpecOpsOperative {
  operative: Operative;
  xp: number;
  battleHonours: BattleHonour[];
  battleScars: BattleScar[];
  rank: number;
}

interface BattleHonour {
  id: string;
  name: string;
  effect: string;
  type: 'attribute' | 'ability' | 'weapon';
}
```

**UI Components:**

- `RosterManager.tsx` - Create/manage rosters
- `BattleHonourSelector.tsx` - Choose honours
- `RequisitionPanel.tsx` - Spend requisition points
- `CampaignTracker.tsx` - Track campaign progress

**Service Layer:**

- `campaignService.ts` - Manage rosters, XP, requisitions
- `battleHonourService.ts` - Apply honours to operatives

**Estimated Effort:** 4-6 weeks (major feature)

---

#### 3.4 Rare Equipment & Battle Honours

**Description:** Advanced equipment and operative upgrades from campaign play.

**Implementation Requirements:**

- Add rare equipment JSON data
- Implement equipment restrictions (one per team, etc.)
- Add battle honour system (see Spec Ops above)
- Track equipment across battles

**Estimated Effort:** 1-2 weeks

---

#### 3.5 Dice Roller Utility

**Description:** In-app dice rolling for attacks, defense, and other checks.

**Implementation Requirements:**

**Features:**

- Roll specified number of D6
- Calculate hit results (based on BS/WS)
- Calculate critical hits (6+ or modified)
- Defense rolls with cover saves
- Animation and visual feedback

**UI Components:**

- `DiceRoller.tsx` - Main dice interface
- `DiceResultDisplay.tsx` - Show results
- Integration with combat actions

**Service Layer:**

- `diceService.ts` - Generate random rolls, calculate results

**Estimated Effort:** 1 week

---

#### 3.6 Print/Export Functionality

**Description:** Export team rosters and datacards to PDF for printing.

**Implementation Requirements:**

- Generate printable HTML views
- CSS print styles for datacards
- PDF generation (using library like jsPDF or print-to-PDF)
- Export team as JSON for sharing

**Estimated Effort:** 1 week

---

### 🔵 Priority 4: Content Expansion

#### 4.1 Additional Factions

**Missing Factions (High Priority):**

- Hunter Clade (Adeptus Mechanicus)
- Pathfinder (T'au Empire)
- Veteran Guardsmen (Astra Militarum)
- Kommandos (Orks)
- Legionary (Chaos Space Marines)
- Warpcoven (Thousand Sons)
- Warp Coven (Grey Knights)
- Corsair Voidscarred (Aeldari Pirates)
- Blooded (Traitor Guard)
- Brood Coven (Genestealer Cults)

**Implementation Per Faction:**

- Create faction JSON with operatives
- Add faction-specific rules
- Add strategic and tactical ploys
- Extract operative images
- Write faction tests

**Estimated Effort:** 1 week per faction (basic), 2 weeks (with ploys and unique mechanics)

---

#### 4.2 Equipment Expansion

**Missing Equipment Categories:**

- Faction-specific equipment
- Rare equipment from White Dwarf/expansions
- Equipment upgrades from campaign
- Mission-specific equipment

**Estimated Effort:** 1 week per 10 equipment items

---

## Implementation Roadmap

### Phase 1: Core Game Completion (8-10 weeks)

Focus on Priority 1 features to complete core matched play support.

**Weeks 1-3:** Strategic & Tactical Ploys System

- Design data model and UI
- Implement ploy selection and usage
- Add ploys for Angels of Death and Plague Marines
- Test CP interactions

**Weeks 4-7:** Mission & Scenario Framework

- Create mission data structure
- Implement mission selection
- Add objective marker system
- Build VP tracking
- Add 5-6 core missions

**Weeks 8-9:** Tac Ops System

- Create Tac Op database
- Implement selection UI
- Add reveal/scoring mechanics
- Integrate with VP tracker

**Week 10:** Testing & Refinement

- End-to-end game testing
- Bug fixes
- Documentation updates

### Phase 2: Enhanced Mechanics (6-8 weeks)

Focus on Priority 2 features for gameplay depth.

**Weeks 1-3:** Advanced Terrain Rules

- Terrain piece definitions
- Cover calculation improvements
- Vantage point rules
- Traverse implementation

**Weeks 4-5:** Additional Actions & Status Effects

- Add missing core actions
- Implement status effect tracking
- Add token management

**Weeks 6-7:** Group Activation & Ready State

- Implement GA rules
- Refine activation tracking
- Update Counteract implementation

**Week 8:** Testing & Polish

### Phase 3: Advanced Features (8-12 weeks)

Focus on Priority 3 features for enhanced experience.

**Weeks 1-6:** Spec Ops Campaign System (MAJOR)

- Design campaign data structures
- Build roster management
- Implement XP and requisitions
- Add battle honours
- Create campaign tracking UI

**Weeks 7-9:** Fire Team Validation & Rare Equipment

- Build fire team validation
- Add rare equipment
- Equipment restriction system

**Weeks 10-12:** Quality of Life Improvements

- Dice roller
- Print/export functionality
- UI/UX enhancements
- Performance optimization

### Phase 4: Content Expansion (Ongoing)

Add new factions and equipment as they release.

**Quarterly Updates:**

- Add 2-3 new factions per quarter
- Update existing factions with new rules
- Add new equipment and ploys
- Balance updates as published

---

## Technical Considerations

### Data Model Extensions

**Game State Expansion:**

```typescript
interface ExtendedGameState {
  // Existing
  turningPoint: number;
  initiative: 'alpha' | 'bravo';
  commandPoints: { alpha: number; bravo: number };
  operatives: TrackedOperative[];

  // New
  mission: Mission;
  tacOps: SelectedTacOps;
  objectives: ObjectiveMarker[];
  usedPloys: UsedPloy[];
  terrain: TerrainPiece[];
  victoryPoints: { alpha: number; bravo: number };
  activePloys: ActivePloy[];
}
```

### Storage Considerations

- Game state size will increase significantly
- Consider IndexedDB for complex campaign data
- Implement data migration for version updates
- Add state export/import for backup

### Performance

- Lazy load faction data (already implemented)
- Virtual scrolling for large lists
- Optimize re-renders with React.memo
- Consider Web Workers for complex calculations

### Testing Strategy

**Priority 1 Features:**

- Unit tests for all services (80%+ coverage)
- Integration tests for game flows
- E2E tests for critical paths

**Priority 2-4 Features:**

- Unit tests for core logic
- Component tests for UI
- Manual testing for edge cases

---

## Success Metrics

### Feature Completeness

- ✅ All Priority 1 features implemented
- ✅ 80%+ of Priority 2 features implemented
- ✅ 5+ factions fully supported

### Quality Metrics

- ✅ 80%+ test coverage maintained
- ✅ Zero critical bugs in production
- ✅ Page load time < 2s
- ✅ Lighthouse score 90+

### User Experience

- ✅ Positive community feedback
- ✅ Active usage metrics increasing
- ✅ Low bounce rate on GitHub Pages

---

## Conclusion

This implementation plan outlines a comprehensive roadmap to complete the Kill Team Dataslate application. By prioritizing core game systems (Ploys, Missions, Objectives, Tac Ops), we ensure the application supports full matched play functionality. Enhanced mechanics and advanced features further improve the experience, while ongoing content expansion keeps the tool current with new releases.

The phased approach allows for incremental delivery of value while maintaining high code quality and test coverage. Each phase builds on previous work, ensuring a stable foundation for future enhancements.

**Next Steps:**

1. Review and approve this plan with stakeholders
2. Break down Phase 1 features into detailed tasks
3. Create GitHub issues for each feature
4. Begin implementation of Strategic & Tactical Ploys system
5. Establish regular release cadence (e.g., monthly updates)

---

## Appendix: Related Documentation

- [SPEC.md](./SPEC.md) - Original technical specification
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [README.md](./README.md) - Project overview and setup

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-23  
**Author:** Kill Team Dataslate Development Team
