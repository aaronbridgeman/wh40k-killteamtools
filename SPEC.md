# Kill Team Dataslate - Technical Specification

## 1. Overview

The Kill Team Dataslate is a client-side web application designed to assist players with Warhammer 40K Kill Team gameplay and learning. The application is hosted on GitHub Pages and has been built incrementally across three major iterations.

### Vision
Provide a comprehensive digital toolset for Kill Team players to:
- Access complete faction rules and operative datacards ✅
- Build and customize Kill Teams ✅
- Track game state during matches ✅
- Learn rules through expanded explanations ✅

### Implementation Status

**Iteration 1: Basic Dataslate Viewer** - ✅ **COMPLETE**
- Faction selection and display
- Operative datacards with full stats
- Rule expansion and tooltips
- Responsive design

**Iteration 2: Team Customization** - ✅ **COMPLETE**
- Team builder with operative selection
- Weapon loadout customization
- Equipment selection
- Faction rules selection
- Team validation and persistence

**Iteration 3: Game Tracker** - ✅ **COMPLETE**
- Game mode with two-team tracking
- Turning point management
- Command point tracking
- Operative wound and status tracking
- Game state persistence

## 2. Technical Architecture

### 2.1 Technology Stack

**Frontend Framework**: React 18+ with TypeScript
- Modern, component-based architecture
- Strong typing for data models
- Excellent ecosystem and community support

**Build Tool**: Vite
- Fast development server with HMR
- Optimized production builds
- Native ESM support

**Testing**: Vitest + React Testing Library
- Fast unit and integration tests
- Component testing support
- Compatible with Vite

**Styling**: CSS Modules + Modern CSS
- Scoped styling to prevent conflicts
- CSS custom properties for theming
- Responsive design with mobile-first approach

**Data Format**: JSON/YAML
- Human-readable configuration files
- Schema validation with JSON Schema
- Version-controlled faction data

**Deployment**: GitHub Pages
- Static site hosting
- Automatic deployment via GitHub Actions
- Custom domain support

### 2.2 Project Structure

```
/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
├── docs/                        # GitHub Pages output directory
├── public/                      # Static assets
│   ├── images/
│   │   └── operatives/         # Operative images by faction
│   └── pdfs/                   # Official rule PDFs (future)
├── src/
│   ├── components/             # React components
│   │   ├── common/            # Reusable UI components
│   │   ├── datacard/          # Operative datacard components
│   │   ├── faction/           # Faction selection and display
│   │   └── rules/             # Rule expansion components
│   ├── data/                   # Configuration data
│   │   ├── factions/          # Faction-specific configs
│   │   │   ├── angels-of-death/
│   │   │   │   ├── faction.json
│   │   │   │   ├── operatives/
│   │   │   │   └── rules.ts    # Faction-specific logic
│   │   │   └── plague-marines/
│   │   │       ├── faction.json
│   │   │       ├── operatives/
│   │   │       └── rules.ts
│   │   ├── schemas/           # JSON schemas for validation
│   │   └── weapons/           # Weapon rule definitions
│   ├── hooks/                  # Custom React hooks
│   ├── services/              # Business logic services
│   │   ├── dataLoader.ts      # Load and validate data
│   │   ├── ruleExpander.ts    # Expand rule abbreviations
│   │   └── teamBuilder.ts     # Team composition logic
│   ├── types/                  # TypeScript type definitions
│   │   ├── faction.ts
│   │   ├── operative.ts
│   │   ├── weapon.ts
│   │   └── game.ts
│   ├── utils/                  # Utility functions
│   ├── App.tsx                # Main application component
│   └── main.tsx               # Application entry point
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/           # Integration tests
│   └── fixtures/              # Test data
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── README.md
└── SPEC.md
```

## 3. Data Model

### 3.1 Core Types

#### Faction
```typescript
interface Faction {
  id: string;                    // Unique identifier (e.g., "angels-of-death")
  name: string;                  // Display name
  description: string;           // Faction description
  rules: FactionRule[];          // Faction-specific rules
  operatives: Operative[];       // Available operatives
  restrictions: TeamRestrictions; // Team building restrictions
  metadata: {
    version: string;             // Data version
    source: string;              // Source rulebook
    lastUpdated: string;         // ISO date
  };
}
```

#### Operative
```typescript
interface Operative {
  id: string;                    // Unique identifier
  name: string;                  // Operative name
  type: string;                  // e.g., "Trooper", "Leader"
  stats: OperativeStats;         // Core stats
  weapons: Weapon[];             // Available weapons
  abilities: Ability[];          // Special abilities
  keywords: string[];            // Operative keywords
  cost: number;                  // Points or fire team slots
  image?: string;                // Path to operative image
}

interface OperativeStats {
  movement: number;              // M (inches)
  actionPointLimit: number;      // APL
  groupActivation: number;       // GA
  defense: number;               // DF (dice)
  save: number;                  // SV (target number)
  wounds: number;                // W
}
```

#### Weapon
```typescript
interface Weapon {
  id: string;
  name: string;
  type: 'ranged' | 'melee';
  profiles: WeaponProfile[];     // Multiple profiles (e.g., different modes)
}

interface WeaponProfile {
  name?: string;                 // Profile name (if multiple)
  attacks: number;               // A (dice)
  ballisticSkill?: number;       // BS (for ranged, target number)
  weaponSkill?: number;          // WS (for melee, target number)
  damage: number | string;       // Normal damage
  criticalDamage: number | string; // Critical damage
  specialRules: WeaponRule[];    // e.g., Piercing 1, Lethal 5
}

interface WeaponRule {
  name: string;                  // Rule name
  value?: number | string;       // Rule parameter
  description: string;           // Full rule text
}
```

#### Ability
```typescript
interface Ability {
  id: string;
  name: string;
  type: 'action' | 'passive' | 'unique';
  cost?: string;                 // AP cost (e.g., "1AP", "2AP")
  description: string;           // Full ability text
  restrictions?: string[];       // Usage restrictions
}
```

### 3.2 Configuration Schema

JSON Schema will validate all configuration files to ensure:
- Required fields are present
- Data types are correct
- Values are within valid ranges
- References to rules and abilities are valid

## 4. Feature Specifications

### 4.1 Iteration 1: Basic Dataslate Viewer

**Goal**: Display complete faction information and datacards for all operatives with expanded rule explanations.

#### Features

1. **Faction Selection**
   - Dropdown or card-based faction selector
   - Display faction name and description
   - Show faction-specific rules

2. **Operative Datacards**
   - Display all operatives for selected faction
   - Show complete stats (M, APL, GA, DF, SV, W)
   - List all weapons with full profiles
   - Display abilities and keywords
   - Expandable sections for detailed information

3. **Rule Expansion**
   - Weapon special rules show full descriptions
   - Hover/click to view expanded rule text
   - Consistent formatting for all rules
   - Search/filter rules glossary

4. **Responsive Design**
   - Mobile-first approach
   - Print-friendly layout
   - Accessible (WCAG 2.1 AA)

#### Technical Requirements

- Load faction data from JSON configuration
- Validate data against schema on load
- Cache loaded data for performance
- Error handling for missing/invalid data
- Unit tests for data loading and validation
- Component tests for UI rendering

### 4.2 Iteration 2: Team Customization

**Goal**: Build custom Kill Teams by selecting operatives and their loadouts.

#### Features

1. **Team Builder Interface**
   - Select faction
   - Choose operatives from available pool
   - Customize operative weapons
   - Validate team composition rules
   - Save/load team configurations

2. **Customized Datacards**
   - Show only selected operatives
   - Display only equipped weapons
   - Calculate team totals (wounds, fire teams, etc.)
   - Export to PDF or print

3. **Validation**
   - Enforce team composition rules
   - Check fire team requirements
   - Validate operative counts
   - Weapon availability checking

#### Technical Requirements

- Implement team state management
- Create validation service
- LocalStorage for team persistence
- Export functionality
- Unit tests for validation logic
- Integration tests for team builder flow

### 4.3 Iteration 3: Game Tracker

**Goal**: Track game state for matches between two Kill Teams.

#### Features

1. **Game Setup**
   - Load two teams (home/away)
   - Select mission
   - Track initial command points

2. **Game State Tracking**
   - Current turning point
   - Active team/operative
   - Command point pools
   - Victory points

3. **Operative Tracking**
   - Current wounds
   - Status effects (injured, incapacitated)
   - Activated state
   - Token tracking (objective markers, etc.)

4. **Turn Management**
   - Initiative phase tracking
   - Strategy phase
   - Firefight phase with activation tracking
   - End phase

#### Technical Requirements

- Game state management (Context API or state library)
- Undo/redo functionality
- Auto-save game state
- Game history/log
- Comprehensive testing of game rules
- E2E tests for complete game flow

## 5. Data Extraction Strategy

### 5.1 PDF Processing Workflow

1. **Manual Extraction** (Initial)
   - Create structured JSON from official PDFs
   - Validate against schema
   - Peer review for accuracy

2. **Future Automation** (Optional)
   - PDF parsing tools (pdf.js, pdfplumber)
   - OCR for text extraction
   - Manual verification step

### 5.2 Image Extraction

1. **Operative Images**
   - Extract from PDFs or scan separately
   - Standard dimensions (e.g., 512x512)
   - WebP format for size optimization
   - Fallback to placeholder if unavailable

2. **Icon Extraction**
   - Weapon type icons
   - Status effect icons
   - Faction symbols

### 5.3 Configuration Management

1. **Version Control**
   - All configs in git
   - Semantic versioning for data
   - Changelog for rule updates

2. **Validation**
   - CI/CD validation on commit
   - Schema validation in application
   - Unit tests for all configurations

## 6. Quality Assurance

### 6.1 Testing Strategy

**Unit Tests**
- All utility functions
- Data validation logic
- Rule expansion logic
- State management

**Component Tests**
- React component rendering
- User interactions
- Accessibility

**Integration Tests**
- Complete user flows
- Data loading and display
- Team building workflow

**E2E Tests** (Future)
- Full application workflows
- Multi-page interactions

**Coverage Target**: 80%+ code coverage

### 6.2 Code Quality

- TypeScript strict mode
- ESLint with recommended rules
- Prettier for code formatting
- Husky for pre-commit hooks
- Conventional commits

### 6.3 Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Screen reader testing

## 7. Performance

### 7.1 Optimization Strategies

- Code splitting by faction
- Lazy loading of operative images
- Memoization of expensive calculations
- Virtual scrolling for large lists
- Service Worker for offline support (future)

### 7.2 Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 90+

## 8. Deployment

### 8.1 GitHub Pages Setup

- Build output to `/docs` directory
- Custom domain configuration
- HTTPS enforcement
- SPA routing with 404.html fallback

### 8.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
- Trigger on push to main
- Run tests
- Run linting
- Build production bundle
- Deploy to GitHub Pages
```

### 8.3 Versioning

- Semantic versioning for releases
- Git tags for versions
- Changelog generation
- Release notes

## 9. Development Workflow

### 9.1 Getting Started

```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run test        # Run tests
npm run build       # Build for production
npm run preview     # Preview production build
```

### 9.2 Adding New Factions

1. Create faction directory in `src/data/factions/{faction-id}/`
2. Create `faction.json` with faction metadata
3. Create operative configs in `operatives/` subdirectory
4. Create faction-specific logic in `rules.ts` if needed
5. Add faction images to `public/images/operatives/{faction-id}/`
6. Write unit tests for faction data
7. Update faction registry

### 9.3 Code Review Checklist

- [ ] TypeScript types are correct
- [ ] Unit tests are included
- [ ] Accessibility is maintained
- [ ] Code is documented
- [ ] No console errors
- [ ] Responsive design works
- [ ] Data is validated

## 10. Future Enhancements

### 10.1 Potential Features

- **Community Content**: User-submitted teams and strategies
- **Analytics**: Track game statistics and win rates
- **Army List Builder**: Expand to full army management
- **Digital Dice Roller**: Integrated dice rolling
- **Mission Generator**: Random mission selection
- **Printable Datacards**: Customized PDF exports
- **Mobile App**: Native iOS/Android versions
- **Multiplayer**: Real-time game state sharing
- **Tournament Mode**: Bracket management and scoring

### 10.2 Technology Evolution

- Progressive Web App (PWA) capabilities
- WebAssembly for performance-critical code
- GraphQL for future backend integration
- Real-time sync with WebSockets or WebRTC

## 11. Initial Factions

### 11.1 Angels of Death
- Space Marine operatives
- Chapter-specific rules and abilities
- Diverse weapon options
- Elite unit mechanics

### 11.2 Plague Marines
- Death Guard operatives  
- Resilience and disease mechanics
- Unique weapons and abilities
- Contagion rules

## 12. Success Metrics

- **Functionality**: All features work as specified
- **Performance**: Meets performance targets
- **Quality**: 80%+ test coverage
- **Accessibility**: WCAG 2.1 AA compliance
- **Usability**: Positive user feedback
- **Maintainability**: Clear code structure and documentation

## 13. Risks and Mitigations

### 13.1 Risks

1. **Copyright Issues**: Using official content
   - Mitigation: Use only game rules (not copyrightable), avoid copying flavor text

2. **Data Accuracy**: Rules transcription errors
   - Mitigation: Peer review, validation, community feedback

3. **Complexity**: Feature scope creep
   - Mitigation: Strict iteration boundaries, MVP approach

4. **Performance**: Large data files
   - Mitigation: Code splitting, lazy loading, optimization

### 13.2 Legal Considerations

- This is a fan-made tool for personal use
- Uses game mechanics (not copyrightable)
- No official artwork or copyrighted content
- Clear disclaimers about unofficial nature
- Respects Games Workshop's IP guidelines

## 14. Timeline Estimate

**Iteration 1**: 2-3 weeks
- Week 1: Setup, architecture, data model
- Week 2: Core components, data loading
- Week 3: Polish, testing, deployment

**Iteration 2**: 2-3 weeks
- Week 1: Team builder UI and logic
- Week 2: Validation and customization
- Week 3: Testing and refinement

**Iteration 3**: 3-4 weeks
- Week 1-2: Game state management
- Week 3: Tracking UI and features
- Week 4: Testing and polish

**Total**: 7-10 weeks for all three iterations

## 15. Conclusion

This specification provides a comprehensive roadmap for building the Kill Team Dataslate application. The modular architecture and iterative approach ensure that each phase delivers value while building toward a complete solution. By following web development best practices and maintaining high code quality, the project will be maintainable and extensible for future enhancements.
