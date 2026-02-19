# Kill Team Dataslate

A client-side web application for Warhammer 40K Kill Team gameplay assistance, providing comprehensive faction rules, operative datacards, and team building tools.

## 🎯 Features

### Iteration 1 (Current)
- **Faction Selection**: Browse and select from available Kill Team factions
- **Faction Rules**: View complete faction-specific rules and abilities
- **Operative Datacards**: Display detailed stats for all operatives (M, APL, GA, DF, SV, W)
- **Rule Expansion**: Interactive tooltips explaining weapon special rules
- **Responsive Design**: Mobile-friendly interface with print support

### Future Iterations
- **Iteration 2**: Custom team building with operative and weapon selection
- **Iteration 3**: Full game tracking with command points, turning points, and operative states

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm (comes with Node.js)

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

## 🤝 Contributing

Contributions are welcome! Please ensure:
- All tests pass
- Code follows the style guide (use `npm run lint` and `npm run format`)
- TypeScript types are correct
- New features include tests

## ⚖️ Legal Notice

This is an unofficial fan-made tool for personal use. Warhammer 40,000 and Kill Team are registered trademarks of Games Workshop Ltd. This project is not affiliated with, endorsed by, or sponsored by Games Workshop.

The tool uses game mechanics (which are not copyrightable) and does not include any copyrighted content such as official artwork or flavor text.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Technical Specification](./SPEC.md)
- [GitHub Repository](https://github.com/aaronbridgeman/wh40k-killteamtools)
- [Live Application](https://aaronbridgeman.github.io/wh40k-killteamtools/)
