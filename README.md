# Kill Team Dataslate

A Progressive Web App (PWA) for Warhammer 40K Kill Team gameplay assistance, providing comprehensive faction rules, operative datacards, and team building tools with offline support.

## 🔗 Live Application

| Link | Description |
|------|-------------|
| [**🎮 Full App**](https://aaronbridgeman.github.io/wh40k-killteamtools/) | Complete tool — all tabs and features |
| [**☠️ Quick Play (Standalone)**](https://aaronbridgeman.github.io/wh40k-killteamtools/?view=quick-play-event) | Focused Plague Marines tournament tracker — no other tabs, maximized for play |

## 🎯 Features

### Progressive Web App

- **📱 Installable**: Add to home screen on mobile and desktop devices
- **🔌 Offline Support**: Full functionality without internet connection after first load
- **⚡ Fast Loading**: Service worker caching for instant access
- **🎨 Native Feel**: Standalone display mode with custom theme colors
- **📲 App Shortcuts**: Quick access to common features from app launcher

### Current Implementation (All Iterations Complete)

**Iteration 1: Dataslate Viewer** ✅

- **Faction Selection**: Browse and select from available Kill Team factions
- **Faction Rules**: View complete faction-specific rules and abilities
- **Operative Datacards**: Display detailed stats for all operatives (M, APL, GA, DF, SV, W)
- **Rule Expansion**: Interactive tooltips explaining weapon special rules
- **Responsive Design**: Mobile-friendly interface with print support

**Iteration 2: Team Building** ✅

- **Custom Team Builder**: Select operatives and build your Kill Team
- **Weapon Loadout Selection**: Choose weapons for each operative
- **Equipment Selection**: Add universal and faction-specific equipment
- **Faction Rules**: Select Chapter Tactics and other faction rules
- **Team Validation**: Enforce team composition rules and restrictions
- **Team Persistence**: Automatically save and restore your team

**Iteration 3: Game Tracking** ✅

- **Game Mode**: Track matches between two teams (Alpha/Bravo)
- **Turning Point Management**: Track game progression
- **Command Point Tracking**: Manage CP for both teams
- **Operative Tracking**: Monitor wounds, injured status, and activations
- **State Persistence**: Game state saved automatically

**Quick Play Event** ☠️ *(Plague Marines — Tournament Companion)*

- **3-Game Event Tracker**: Purpose-built for Plague Marines quick play tournaments
- **"Remove One" Roster Mechanic**: Display all 7 operatives; remove exactly one non-leader per game
- **Bombardier Grenade Augmentation**: When Blight Grenades are equipped, the Bombardier's card shows the grenade weapon with +1 Hit stat (4+ → 3+) per the Grenadier ability
- **Strategic Ploy Selection**: Choose one strategic ploy per turning point; displayed prominently throughout
- **Firefight Ploy Tracking**: All 4 firefight ploys shown with CP affordability highlighting and used-ploy markers
- **Command Point Tracker**: Per-game CP with +/− controls
- **Blight Grenade Usage**: Track remaining uses (max 2 per game; Bombardier exempt)
- **Learnings & Notes**: Shared free-text field at the bottom for recording observations
- **Nurgle Green Theme**: Immersive green palette; sacred numbers 3 and 7 featured throughout
- **Offline Persistence**: All state saved automatically to localStorage

### Reference Pages

- **Actions Reference**: Complete list of game actions with costs
- **General Rules**: Core game mechanics and rules
- **Weapon Rules Glossary**: Comprehensive weapon special rules reference

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)

### Quick Start

For a fast-track developer setup, see [QUICKSTART.md](./QUICKSTART.md).

### Installation

```bash
# Clone the repository
git clone https://github.com/aaronbridgeman/wh40k-killteamtools.git
cd wh40k-killteamtools

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Check TypeScript types
- `npm run validate` - Run all checks (type-check, lint, format, test)

## 🏗️ Project Structure

```
/
├── .github/workflows/    # GitHub Actions CI/CD
├── public/              # Static assets
│   ├── icons/          # PWA icons (192x192, 512x512)
│   ├── icon.svg        # Source icon for PWA
│   └── images/         # Operative images by faction
├── scripts/             # Build and utility scripts
│   └── generate-icons.mjs  # PWA icon generation
├── src/
│   ├── components/      # React components
│   │   ├── common/     # Reusable UI components
│   │   ├── datacard/   # Operative datacard components
│   │   ├── faction/    # Faction selection and display
│   │   └── rules/      # Rule expansion components
│   ├── data/           # Configuration data
│   │   ├── factions/   # Faction-specific configs
│   │   └── weapons/    # Weapon rule glossary
│   ├── services/       # Business logic
│   ├── types/          # TypeScript definitions
│   └── App.tsx         # Main application
├── tests/              # Unit and integration tests
├── docs/               # Build output (deployed to GitHub Pages)
│   ├── manifest.webmanifest  # PWA manifest
│   ├── sw.js           # Service worker
│   └── assets/         # Compiled JS/CSS
└── SPEC.md            # Detailed technical specification
```

## 🎮 Currently Supported Factions

- **Angels of Death** - Elite Space Marine operatives
- **Plague Marines** - Resilient Death Guard warriors

More factions will be added in future updates!

## 📚 Adding New Factions

See [SPEC.md](./SPEC.md) for detailed instructions on adding new factions, including:

- Creating faction configuration files
- Adding operative data
- Extracting images from PDFs
- Implementing faction-specific rules

## 🧪 Testing

The project uses Vitest for unit testing with comprehensive coverage:

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🚢 Deployment

The application is automatically deployed to GitHub Pages as a Progressive Web App (PWA) when changes are pushed to the main branch. The deployment workflow:

1. Generates PWA icons from the source SVG
2. Runs type checking
3. Runs linting
4. Runs all tests
5. Builds the application with PWA assets (manifest, service worker)
6. Deploys to GitHub Pages at https://aaronbridgeman.github.io/wh40k-killteamtools/

### PWA Features

Once deployed, users can:

- **Install the app** on mobile devices by tapping "Add to Home Screen"
- **Install on desktop** browsers via the install prompt or browser menu
- **Use offline** after the first visit - all data cached for offline access
- **Receive automatic updates** when new versions are deployed
- **Access app shortcuts** for quick navigation to common features

The PWA configuration includes:

- Web manifest with app metadata and icons (192x192, 512x512)
- Service worker with Workbox for intelligent caching
- Runtime caching strategies for optimal performance
- Offline fallback support

### First-Time Setup

If you're setting up this repository for the first time or if deployments are failing with a 404 error, GitHub Pages needs to be enabled in the repository settings. See [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md) for detailed setup instructions.

**Quick Setup:**

1. Go to [Repository Settings → Pages](https://github.com/aaronbridgeman/wh40k-killteamtools/settings/pages)
2. Set **Source** to `GitHub Actions`
3. Save and push to `main` branch

## 🧹 Repository Maintenance

### Branch Cleanup

The repository includes automated tools for cleaning up merged branches:

- **Automated workflow**: Runs weekly to delete merged branches (see `.github/workflows/cleanup-branches.yml`)
- **Manual script**: Run `./scripts/cleanup-branches.sh` to clean up branches on-demand
- See [BRANCH_CLEANUP.md](./BRANCH_CLEANUP.md) for detailed documentation

To prevent branch accumulation:

1. Enable "Automatically delete head branches" in repository settings
2. Or manually trigger the cleanup workflow from the Actions tab

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Development workflow
- Code standards and style guide
- Testing requirements
- Pull request process
- How to add new factions

Before contributing, ensure:

- All tests pass (`npm run validate`)
- Code follows the style guide
- TypeScript types are correct
- New features include tests
- Documentation is updated

## ⚖️ Legal Notice

This is an unofficial fan-made tool for personal use. Warhammer 40,000 and Kill Team are registered trademarks of Games Workshop Ltd. This project is not affiliated with, endorsed by, or sponsored by Games Workshop.

The tool uses game mechanics (which are not copyrightable) and does not include any copyrighted content such as official artwork or flavor text.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

### Planning & Roadmap

- [Feature Roadmap](./FEATURE_ROADMAP.md) - Visual roadmap and quick reference for future features
- [Missing Features Plan](./MISSING_FEATURES_PLAN.md) - Comprehensive implementation plan for missing Kill Team features
- [Technical Specification](./SPEC.md) - Detailed technical requirements and roadmap

### Development Documentation

- [Quick Start Guide](./QUICKSTART.md) - 5-minute developer setup and common tasks
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture, diagrams, and design patterns
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project

### Operations & Deployment

- [Branch Cleanup Documentation](./BRANCH_CLEANUP.md) - Repository maintenance guidelines
- [GitHub Pages Setup](./GITHUB_PAGES_SETUP.md) - Deployment configuration
- [Version Management](./VERSION_MANAGEMENT.md) - Version control and release process

### External Links

- [GitHub Repository](https://github.com/aaronbridgeman/wh40k-killteamtools)
- [Live Application](https://aaronbridgeman.github.io/wh40k-killteamtools/)
- [☠️ Quick Play — Standalone View](https://aaronbridgeman.github.io/wh40k-killteamtools/?view=quick-play-event) *(Plague Marines tournament tracker, no navigation tabs)*
