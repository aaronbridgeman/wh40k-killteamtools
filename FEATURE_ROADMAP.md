# Kill Team Dataslate - Feature Roadmap

> Quick reference for missing features and implementation priorities

## 📊 Current Status

### ✅ Implemented (All 3 Iterations Complete)

- **Core Game Tracking**: Turning points, initiative, CP, wounds, activation
- **Team Building**: Operative selection, weapon loadouts, equipment (max 4)
- **Faction Rules**: Chapter Tactics for Angels of Death
- **Reference Materials**: Weapon rules (24+), actions (6), general rules
- **Data**: 2 factions (Angels of Death, Plague Marines)
- **PWA Features**: Offline support, installable app, service worker

### 📈 Completion Estimate

**Current Feature Coverage**: ~40% of full Kill Team rules

**Core Matched Play**: Missing critical systems (Ploys, Missions, Objectives)

**Campaign/Spec Ops**: Not implemented

---

## 🎯 Missing Features by Priority

### 🔴 Priority 1: Critical for Matched Play (8-10 weeks)

> **Essential systems needed for complete Kill Team gameplay**

| Feature                | Effort    | Status | Impact                         |
| ---------------------- | --------- | ------ | ------------------------------ |
| Strategic Ploys        | 2-3 weeks | ❌     | Core CP-based abilities        |
| Tactical Ploys         | (same)    | ❌     | Mid-game tactical options      |
| Mission System         | 3-4 weeks | ❌     | Victory conditions & structure |
| Objective Markers      | 2 weeks   | ❌     | Primary VP scoring             |
| Tac Ops                | 1-2 weeks | ❌     | Secondary objectives           |
| Victory Point Tracking | (with ^)  | ❌     | Automated scoring              |

**Deliverable**: Full matched play support with missions and objectives

---

### 🟡 Priority 2: Enhanced Mechanics (6-8 weeks)

> **Improve gameplay accuracy and simulation depth**

| Feature                 | Effort    | Status | Impact                  |
| ----------------------- | --------- | ------ | ----------------------- |
| Advanced Terrain Rules  | 2-3 weeks | ❌     | Cover, vantage, obscure |
| Additional Actions      | 1 week    | ❌     | Traverse, Pick Up, etc. |
| Group Activation        | 1 week    | ⚠️     | Partially tracked       |
| Ready/Activated State   | 3-5 days  | ⚠️     | Better tracking         |
| Status Effects & Tokens | 1-2 weeks | ❌     | Stun, Confused, etc.    |

**Deliverable**: More accurate game simulation

---

### 🟢 Priority 3: Advanced Features (8-12 weeks)

> **Enhanced experience and quality of life**

| Feature                  | Effort    | Status | Impact                 |
| ------------------------ | --------- | ------ | ---------------------- |
| Spec Ops Campaign System | 4-6 weeks | ❌     | Persistent rosters, XP |
| Battle Honours           | (with ^)  | ❌     | Operative progression  |
| Fire Team Validation     | 1 week    | ❌     | Composition rules      |
| Rare Equipment           | 1-2 weeks | ❌     | Campaign equipment     |
| Dice Roller              | 1 week    | ❌     | In-app dice rolling    |
| Print/Export             | 1 week    | ❌     | PDF datacards          |

**Deliverable**: Campaign support and quality of life improvements

---

### 🔵 Priority 4: Content Expansion (Ongoing)

> **Add more factions and equipment**

| Feature             | Effort/Each | Status | Notes                    |
| ------------------- | ----------- | ------ | ------------------------ |
| Hunter Clade        | 1-2 weeks   | ❌     | Adeptus Mechanicus       |
| Pathfinder          | 1-2 weeks   | ❌     | T'au Empire              |
| Veteran Guardsmen   | 1-2 weeks   | ❌     | Astra Militarum          |
| Kommandos           | 1-2 weeks   | ❌     | Orks                     |
| Additional Factions | 1-2 weeks   | ❌     | 10+ more factions needed |
| Equipment Expansion | Ongoing     | ⚠️     | 2 factions have gear     |

**Deliverable**: Comprehensive faction coverage

---

## 📅 Implementation Timeline

### Phase 1: Core Game (Weeks 1-10)

**Goal**: Complete matched play support

```
Weeks 1-3:   Ploys System (Strategic + Tactical)
Weeks 4-7:   Mission Framework + Objectives
Weeks 8-9:   Tac Ops System
Week 10:     Testing & Refinement
```

**Key Deliverables:**

- ✅ Players can use faction ploys
- ✅ Games have missions with VP conditions
- ✅ Objectives can be placed and controlled
- ✅ Tac Ops provide secondary objectives
- ✅ VP automatically calculated

---

### Phase 2: Enhanced Mechanics (Weeks 11-18)

**Goal**: Improve gameplay simulation

```
Weeks 11-13: Advanced Terrain (Cover, Vantage, Traverse)
Weeks 14-15: Additional Actions & Status Effects
Weeks 16-17: Group Activation + Ready State
Week 18:     Testing & Polish
```

**Key Deliverables:**

- ✅ Terrain affects gameplay accurately
- ✅ All core actions available
- ✅ Status effects tracked properly
- ✅ Group activation implemented

---

### Phase 3: Advanced Features (Weeks 19-30)

**Goal**: Campaign support & UX improvements

```
Weeks 19-24: Spec Ops Campaign System (MAJOR)
Weeks 25-27: Fire Team + Rare Equipment
Weeks 28-30: QoL (Dice Roller, Print/Export)
```

**Key Deliverables:**

- ✅ Campaign rosters with XP
- ✅ Battle honours system
- ✅ Fire team validation
- ✅ Better UX and tools

---

### Phase 4: Content Expansion (Ongoing)

**Goal**: Add new factions quarterly

```
Q1 2026: Hunter Clade + Pathfinder
Q2 2026: Veteran Guardsmen + Kommandos
Q3 2026: Legionary + Warpcoven
Q4 2026: Additional factions as released
```

**Key Deliverables:**

- ✅ 2-3 new factions per quarter
- ✅ Equipment updates
- ✅ Balance updates from GW

---

## 🚀 Quick Wins (Fast to Implement)

> Features that provide high value with low effort

1. **Dice Roller** (1 week) - Frequently requested
2. **Additional Actions** (1 week) - Complete the action list
3. **Ready State Tracking** (3-5 days) - Better game flow
4. **Print Datacards** (1 week) - Export functionality

---

## 🎮 Feature Dependency Map

```
Mission System
  ├── Objective Markers
  │   └── Victory Point Tracking
  └── Deployment Zones

Ploys System
  └── Command Point Integration (✅ exists)

Campaign System
  ├── Spec Ops Rosters
  ├── Battle Honours
  ├── Requisitions
  └── Rare Equipment

Terrain System
  └── Advanced Movement Actions
```

---

## 📋 Implementation Checklist

### Before Starting Phase 1

- [ ] Review and approve feature roadmap
- [ ] Create GitHub issues for each feature
- [ ] Set up project board
- [ ] Define acceptance criteria
- [ ] Establish testing requirements

### During Implementation

- [ ] Write unit tests for all services (80%+ coverage)
- [ ] Document data models thoroughly
- [ ] Update ARCHITECTURE.md as components added
- [ ] Keep SPEC.md synchronized
- [ ] Regular user testing

### After Each Phase

- [ ] Run full validation suite
- [ ] Update documentation
- [ ] Create release notes
- [ ] Deploy to GitHub Pages
- [ ] Gather community feedback

---

## 🎯 Success Metrics

### Feature Completeness

- ✅ 100% of Priority 1 features implemented
- ✅ 80%+ of Priority 2 features implemented
- ✅ 5+ factions fully supported with ploys

### Quality Metrics

- ✅ 80%+ test coverage maintained
- ✅ Zero critical bugs in production
- ✅ Lighthouse score 90+
- ✅ Page load time < 2s

### User Satisfaction

- ✅ Positive GitHub stars/feedback
- ✅ Active community engagement
- ✅ Low bug report rate
- ✅ Feature requests addressed

---

## 💡 Future Vision

### Year 1 (2026)

- Complete all Priority 1 & 2 features
- Support 10+ factions
- Full matched play capability
- Campaign mode (Spec Ops)

### Year 2 (2027)

- Tournament mode
- Community features (team sharing)
- Advanced analytics
- Native mobile app consideration

### Long Term

- Real-time multiplayer
- User accounts & cloud sync
- Community content platform
- Official API integrations (if available)

---

## 📚 Related Documents

- [MISSING_FEATURES_PLAN.md](./MISSING_FEATURES_PLAN.md) - Detailed implementation plan
- [SPEC.md](./SPEC.md) - Technical specification
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guide

---

## 🤝 How to Contribute

Interested in helping implement these features? See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- Coding standards
- Testing requirements
- Pull request process

**High-impact areas needing help:**

1. Adding new factions (data entry + testing)
2. Ploy system implementation (TypeScript/React)
3. Mission framework (complex but well-defined)
4. UI/UX improvements (CSS/design)
5. Testing coverage (Vitest tests)

---

**Last Updated**: 2026-02-23
**Status**: All 3 core iterations complete, Priority 1 features pending
**Next Milestone**: Phase 1 - Ploys & Missions (10 weeks)
