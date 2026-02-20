# Copilot Instructions for Kill Team Dataslate

## Repository Overview

This is a **client-side web application** for Warhammer 40K Kill Team gameplay assistance. It's a React + TypeScript + Vite project that provides faction rules, operative datacards, and team building tools. The app is deployed to GitHub Pages at https://aaronbridgeman.github.io/wh40k-killteamtools/.

**Key Information:**
- **Language:** TypeScript (strict mode enabled)
- **Framework:** React 18+ with hooks
- **Build Tool:** Vite 5
- **Testing:** Vitest with React Testing Library
- **Styling:** CSS Modules with modern CSS
- **Deployment:** GitHub Pages (builds to `/docs` directory)
- **Node Version:** 18.0.0 or higher required

## Build & Validation Commands

**ALWAYS run these commands in this exact order when making code changes:**

### Development
```bash
npm install          # Install dependencies - run this first on fresh clone
npm run dev         # Start dev server at http://localhost:5173 with HMR
```

### Validation (Run ALL before committing)
```bash
npm run type-check   # TypeScript type checking (must pass, no errors allowed)
npm run lint         # ESLint checks (must pass with 0 warnings)
npm run format:check # Prettier format validation
npm run test         # Run Vitest unit tests (must all pass)
```

### Quick Validation
```bash
npm run validate     # Runs type-check + lint + format:check + test in sequence
```

### Fixing Issues
```bash
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Auto-format code with Prettier
```

### Building
```bash
npm run build        # Production build - outputs to /docs directory
npm run preview      # Preview production build locally
```

### Testing Options
```bash
npm run test         # Run tests once
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Generate coverage report (target: 80%+)
```

## Important Build Notes

- **Build output goes to `/docs` directory**, NOT `/dist`. This is configured in `vite.config.ts` for GitHub Pages deployment.
- **Base path is `/wh40k-killteamtools/`** - all routes and assets must account for this in production.
- **Always run `npm ci` in CI/CD**, not `npm install`, for reproducible builds.
- **Type checking is separate from build** - run `npm run type-check` explicitly as build has `noEmit: true`.
- The build creates a `.nojekyll` file automatically for GitHub Pages compatibility.

## Project Structure

```
/
├── .github/workflows/
│   └── deploy.yml           # CI/CD: type-check → lint → test → build → deploy
├── public/
│   └── images/operatives/   # Operative images by faction (e.g., angels-of-death/)
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Reusable UI components
│   │   ├── datacard/       # Operative datacard display
│   │   ├── faction/        # Faction selection & display
│   │   └── rules/          # Rule expansion & tooltips
│   ├── data/               # Configuration data (JSON/TS)
│   │   ├── constants/      # Constants and enums
│   │   ├── factions/       # Faction configs (angels-of-death/, plague-marines/)
│   │   ├── rules/          # General game rules
│   │   └── weapons/        # Weapon rule definitions
│   ├── services/           # Business logic
│   │   ├── dataLoader.ts   # Load and validate faction data
│   │   ├── ruleExpander.ts # Expand rule abbreviations
│   │   └── teamBuilder.ts  # Team composition logic
│   ├── types/              # TypeScript type definitions
│   │   ├── faction.ts
│   │   ├── operative.ts
│   │   ├── weapon.ts
│   │   └── ability.ts
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── tests/
│   ├── setup.ts            # Vitest setup (imports @testing-library/jest-dom)
│   └── unit/               # Unit tests (co-located with source preferred)
├── docs/                    # Build output (committed to git for GitHub Pages)
├── package.json
├── vite.config.ts          # Vite config (base path, aliases, build output)
├── vitest.config.ts        # Test config
└── tsconfig.json           # TypeScript config (strict mode, path aliases)
```

## Key Architecture Patterns

### Type System
- **Strict TypeScript** - all code must be fully typed, no `any` unless absolutely necessary
- **Interfaces over types** - use `interface` for object shapes
- **Export types** from `src/types/` barrel exports
- Path alias `@/` maps to `src/` - use it: `import { Faction } from '@/types'`

### React Patterns
- **Functional components only** with hooks
- **Props interfaces** should be defined inline or in the same file
- **CSS Modules** for styling - import as `import styles from './Component.module.css'`
- **No inline styles** unless absolutely necessary

### Data Management
- Faction data is stored in `src/data/factions/{faction-id}/`
- Each faction has a `faction.json` with metadata and operative configs
- Images stored in `public/images/operatives/{faction-id}/`
- Data is loaded via `dataLoader.ts` service

### Testing
- **Vitest** for unit tests with jsdom environment
- **React Testing Library** for component tests
- Tests should be in `tests/unit/` or co-located with source
- Use `describe` and `it` blocks
- Coverage target: 80%+

## CI/CD Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on push to `main`:

1. **Setup:** Checkout code, setup Node 18, run `npm ci`
2. **Type Check:** `npm run type-check` (must pass)
3. **Lint:** `npm run lint` (must pass with 0 warnings)
4. **Test:** `npm run test` (all tests must pass)
5. **Build:** `npm run build` (outputs to `/docs`)
6. **Deploy:** Upload `/docs` artifact and deploy to GitHub Pages

**If any step fails, deployment is blocked.** Always validate locally before pushing.

## Common Tasks

### Adding a New Faction
1. Create directory: `src/data/factions/{faction-id}/`
2. Create `faction.json` with faction metadata and operative data
3. Add operative images to `public/images/operatives/{faction-id}/`
4. Update faction registry in data loader
5. Write unit tests for new faction data
6. Validate with `npm run validate`

### Adding a New Component
1. Create component in appropriate directory under `src/components/`
2. Use TypeScript with proper prop types
3. Create CSS Module if styling needed
4. Write unit tests in `tests/unit/` or co-located
5. Export from index file if creating a new directory

### Fixing Linting Issues
```bash
npm run lint          # See all issues
npm run lint:fix      # Auto-fix what's possible
npm run format        # Format code
```

### Debugging Build Issues
- Check TypeScript errors: `npm run type-check`
- Check for console errors in dev mode: `npm run dev`
- Check production build: `npm run build && npm run preview`
- Ensure paths are correct (remember base path: `/wh40k-killteamtools/`)

## Code Style Guidelines

### TypeScript
- Use `const` over `let`, avoid `var`
- Prefer arrow functions
- Use optional chaining `?.` and nullish coalescing `??`
- Destructure props and objects
- Use template literals over string concatenation

### React
- Functional components with explicit return types
- Props destructured in function signature
- Use semantic HTML elements
- Proper WCAG 2.1 AA accessibility (aria labels, semantic markup)

### Testing
- Test user behavior, not implementation details
- Use `screen.getByRole()` over `getByTestId()`
- Mock external dependencies
- Keep tests focused and readable

## Troubleshooting

### "Module not found" errors
- Check path alias configuration in `vite.config.ts`, `vitest.config.ts`, and `tsconfig.json`
- Ensure you're using `@/` for src imports

### Build fails but dev works
- Run `npm run type-check` to catch TypeScript errors
- Check for console.logs or debug code left in

### Tests fail in CI but pass locally
- Ensure you committed all files
- Check Node version (should be 18+)
- Run `npm ci` instead of `npm install` locally to match CI

### GitHub Pages 404
- Verify Pages is enabled in repo settings (Source: GitHub Actions)
- Check base path is correct in `vite.config.ts`
- Ensure `/docs` directory is committed

## Legal & Copyright

- This is an **unofficial fan-made tool** for personal use
- Uses game mechanics only (not copyrightable)
- **Do not include** official Games Workshop artwork, logos, or copyrighted text
- **Do not copy** flavor text from rulebooks
- Keep all disclaimers about unofficial nature

## Additional Notes

- The project is in **Iteration 1** - basic dataslate viewer functionality
- See `SPEC.md` for detailed technical specification and future roadmap
- Currently supports: Angels of Death and Plague Marines factions
- Future iterations will add team building and game tracking features
