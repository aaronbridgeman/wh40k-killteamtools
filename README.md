# Kill Team Dataslate

A Progressive Web App (PWA) for Warhammer 40K Kill Team gameplay assistance, providing comprehensive faction rules, operative datacards, and team building tools with offline support.

## 🔗 Live Application

| Link                                                                                                          | Description                                                                               |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [**🎮 Full App**](https://aaronbridgeman.github.io/wh40k-killteamtools/)                                      | Solo/Joint Ops + reference pages (Actions, Rules, Weapon Rules); Single Team mode removed |

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

**Solo / Joint Ops**

- **Game Runner**: Default tab with a setup-status gate (warning state until configured), popup Team Setup UI, a reset/draw activation deck flow, current-activation operative lists, and operative runner cards shown only for activated operatives
- **Operative Status Datacard Popup**: In Game Runner, clicking an NPO operative in the Operative Status panel opens a datacard popup for quick Save/Wounds/weapon inspection while keeping Active/Incapacitated as a separate control
- **Operative Card Detail UX**: Runner cards show boxed stat chips (APL or Control / Move / Save / Wounds), detailed ranged/melee weapon profile cards (including Normal/Critical damage and special rules), and auto-formatted behavior steps for numbered instruction text
- **List Builder**: Build and persist player/NPO lists as model pools, with each list entry carrying a profile assignment (defaulting to Datacard for player entries); Nemesis operatives can be added to either side
- **Datacard Preview in Builder**: Selecting a model/profile now shows the resolved datacard summary immediately before adding the operative
- **List Entry Datacard Popup**: In added operative rows, clicking the profile opens a popup datacard view for quick inspection
- **Model + Profile Workflow**: Select a model first, then optionally override its profile; custom model descriptions are supported and require an explicit profile assignment
- **NPO Profile Overrides**: NPO profile override selection includes built-in NPO catalog profiles (for example Marksman/Brawler roles) alongside custom profiles
- **Team Builder (in Game Runner)**: Configure Player or NPO teams in focused setup panes; manual selection uses a dual-list transfer UI (available -> selected) while NPO teams also support automatic rule-driven selection up to a wounds limit
- **Activation Deck Editor**: Compact deck summary with popup deck setup; per-card edit mode supports operative links and card instance counts (duplicates). Default generation gives NPO Nemesis operatives two cards
- **NPO Selection Rules**: Manual, Random, Melee-heavy, Ranged-heavy, Elite (higher wounds first), and Horde (lower wounds first)
- **Datacard Default Option**: Player list entries default to a `Datacard` profile option
- **NPO Profile Manager**: Top-level tab for creating/editing/deleting profile stat blocks with ranged/melee weapon profiles and behavior rules, including selectable default behavior profiles (BRAWLER, MARKSMAN, BATTLER, GUARDIAN) with custom text fallback
- **Nemesis Profile Manager**: Top-level tab for creating and managing Nemesis operatives
- **Nemesis Manager**: Select an existing Nemesis operative by name to edit it, or pick `Add new` to create one. Size presets (Small/Medium/Large/Custom) set Control, Move, Save, and Wounds automatically with datacard-style stat chips
- **Nemesis Behavior Profiles**: Nemesis operatives support the same default behavior profile presets (BRAWLER, MARKSMAN, BATTLER, GUARDIAN) with editable custom behavior text
- **Nemesis Weapon Selection Rules**: Size sets recommended weapon selection limits (Small 2, Medium 2, Large 3; Custom 2 default). Over-limit manual overrides are allowed with warning messages
- **Nemesis Weapon Picker UX**: Ranged and melee editors are collapsed by default, edited independently, and use toggle buttons for selection (selected items are highlighted and sorted to the top)
- **Default/Extended Weapon Sources**: `Default` shows official weapon tables only; `Extended` additionally includes auto-generated consolidated ranged/melee pools from operative profiles
- **Nemesis Traits**: Select allegiance and nemesis traits for each Nemesis operative. Allegiance options are shown with faction-prefixed labels (for example `Necrons - Living Metal`) to make selection clearer. One from each category is recommended, but over-selection is allowed with warning messages (matching weapon-limit behavior), and selected traits are shown on datacard summaries
- **Nemesis Datacard PDF Export**: Export print-ready Nemesis datacards from Nemesis Profile Manager with both **Export All** and **Export Selected** actions; layout targets 2 readable datacards per A4 page
- **Backup/Restore**: Import and export lists and profiles as JSON backup files

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

### Optional Google Drive Sync Setup

Google login and Drive API access can be enabled while keeping GitHub Pages
hosting.

1. Create a Google Cloud project and enable the Google Drive API
2. Create an OAuth 2.0 Web Application credential
3. Add Authorized JavaScript origins:
	- `http://localhost:5173`
	- `https://aaronbridgeman.github.io`
4. Create `.env.local` in the project root with:

```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here
```

With this variable set, the app can show an optional Login with Google control.

For GitHub Pages deployment, also add a repository variable named
`VITE_GOOGLE_OAUTH_CLIENT_ID` under Settings -> Secrets and variables -> Actions -> Variables.

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

## 🤖 AI YAML Extraction Workspace

For AI-assisted reference sheet extraction, use the local workspace at
`tools/kill-team-yaml-extractor/`.

- Put source PDFs in `tools/kill-team-yaml-extractor/input-pdfs/` (ignored by git)
- Use `tools/kill-team-yaml-extractor/prompt.md` as the extraction prompt
- Use `tools/kill-team-yaml-extractor/schema.yaml` as the target YAML schema
- Save generated files in `tools/kill-team-yaml-extractor/output-yaml/`

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

If you're setting up this repository for the first time or if deployments are failing with a 404 error, GitHub Pages needs to be enabled in the repository settings.

**Quick Setup:**

1. Go to [Repository Settings → Pages](https://github.com/aaronbridgeman/wh40k-killteamtools/settings/pages)
2. Set **Source** to `GitHub Actions`
3. Save and push to `main` branch

## 🧹 Repository Maintenance

### Branch Cleanup

The repository includes automated tools for cleaning up merged branches:

- **Automated workflow**: Runs weekly to delete merged branches (see `.github/workflows/cleanup-branches.yml`)
- **Manual script**: Run `./scripts/cleanup-branches.sh` to clean up branches on-demand

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
- [Technical Specification](./SPEC.md) - Detailed technical requirements and roadmap

### Development Documentation

- [Quick Start Guide](./QUICKSTART.md) - 5-minute developer setup and common tasks
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture, diagrams, and design patterns
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project
- [AI YAML Extraction Workspace](./tools/kill-team-yaml-extractor/README.md) - Local PDF-to-YAML workflow for kill team reference sheets

### Operations & Deployment

- [Version Management](./VERSION_MANAGEMENT.md) - Version control and release process

### External Links

- [GitHub Repository](https://github.com/aaronbridgeman/wh40k-killteamtools)
- [Live Application](https://aaronbridgeman.github.io/wh40k-killteamtools/)
