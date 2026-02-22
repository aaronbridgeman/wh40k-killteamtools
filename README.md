# Kill Team Dataslate

A client-side web application for Warhammer 40K Kill Team gameplay assistance, providing comprehensive faction rules, operative datacards, and team building tools.

## 🎯 Features

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
│   └── images/          # Operative images by faction
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

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment workflow:

1. Runs type checking
2. Runs linting
3. Runs all tests
4. Builds the application
5. Deploys to GitHub Pages

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

- [Quick Start Guide](./QUICKSTART.md) - 5-minute developer setup and common tasks
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture, diagrams, and design patterns
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project
- [Technical Specification](./SPEC.md) - Detailed technical requirements and roadmap
- [Branch Cleanup Documentation](./BRANCH_CLEANUP.md) - Repository maintenance guidelines
- [GitHub Pages Setup](./GITHUB_PAGES_SETUP.md) - Deployment configuration
- [Version Management](./VERSION_MANAGEMENT.md) - Version control and release process
- [GitHub Repository](https://github.com/aaronbridgeman/wh40k-killteamtools)
- [Live Application](https://aaronbridgeman.github.io/wh40k-killteamtools/)
