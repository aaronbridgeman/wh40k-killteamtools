# Developer Quick Start Guide

A fast-track guide to get you developing on Kill Team Dataslate quickly.

## 🚀 5-Minute Setup

```bash
# 1. Clone and install
git clone https://github.com/aaronbridgeman/wh40k-killteamtools.git
cd wh40k-killteamtools
npm ci

# 2. Verify everything works
npm run validate

# 3. Start development
npm run dev
# Visit http://localhost:5173/wh40k-killteamtools/
```

## 📁 Key Directories

```
src/
├── components/     # React UI components
│   ├── datacard/  # Operative cards
│   ├── faction/   # Faction selection
│   ├── team/      # Team builder
│   └── game/      # Game tracking
├── services/      # Business logic
├── data/          # JSON configs
│   └── factions/  # Faction data
└── types/         # TypeScript types
```

## 🔧 Essential Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Quality Checks (run before committing!)
npm run validate         # Run all checks (type, lint, format, test)
npm run type-check       # TypeScript type checking
npm run lint             # ESLint checks
npm run format           # Auto-fix formatting
npm run test             # Run tests

# Build
npm run build            # Production build
npm run preview          # Preview build locally
```

## 📝 Common Tasks

### Adding a Component

```typescript
// src/components/myfeature/MyComponent.tsx
import styles from './MyComponent.module.css';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      <button onClick={onAction}>Click Me</button>
    </div>
  );
}
```

### Adding a Service

```typescript
// src/services/myService.ts
/**
 * Description of what this service does
 */

import { SomeType } from '@/types';

/**
 * Function description
 * @param input - Parameter description
 * @returns Return value description
 */
export function doSomething(input: string): SomeType {
  // Implementation
}
```

### Adding Tests

```typescript
// tests/unit/myService.test.ts
import { describe, it, expect } from 'vitest';
import { doSomething } from '@/services/myService';

describe('doSomething', () => {
  it('should do the thing', () => {
    const result = doSomething('test');
    expect(result).toBeDefined();
  });
});
```

### Adding a New Faction

1. Create `src/data/factions/my-faction/faction.json`
2. Update `src/services/dataLoader.ts` - add to `AVAILABLE_FACTIONS`
3. Add images to `public/images/operatives/my-faction/`
4. Write tests in `tests/unit/myFactionIntegration.test.ts`

## 🐛 Debugging Tips

### Dev Server Issues
```bash
# Clear cache and restart
rm -rf node_modules .vite
npm ci
npm run dev
```

### Type Errors
```bash
# Check types without building
npm run type-check
```

### Test Failures
```bash
# Run specific test file
npm run test -- tests/unit/myTest.test.ts

# Run with UI for debugging
npm run test:ui
```

### Build Errors
```bash
# Clean build
rm -rf docs
npm run build
```

## 📚 Code Style Quick Reference

### TypeScript
```typescript
// ✅ Good
export function loadFaction(id: FactionId): Promise<Faction> {
  return import(`@/data/factions/${id}/faction.json`);
}

// ❌ Bad - no types, no explicit return type
export function loadFaction(id) {
  return import(`@/data/factions/${id}/faction.json`);
}
```

### React Components
```typescript
// ✅ Good - functional, typed, destructured
interface Props {
  name: string;
}

export function Component({ name }: Props) {
  return <div>{name}</div>;
}

// ❌ Bad - class component, untyped
export class Component extends React.Component {
  render() {
    return <div>{this.props.name}</div>;
  }
}
```

### Imports
```typescript
// ✅ Good - use path alias
import { Faction } from '@/types';
import { loadFaction } from '@/services/dataLoader';

// ❌ Bad - relative paths
import { Faction } from '../../types';
import { loadFaction } from '../services/dataLoader';
```

## 🎯 Before You Commit Checklist

- [ ] `npm run validate` passes
- [ ] Added/updated tests
- [ ] Updated documentation if needed
- [ ] No console.log statements (use console.warn/error if needed)
- [ ] Commit message follows format: `type: description`

## 🔍 Understanding the Codebase

### Data Flow
```
User Action → Component → Service → Data/Storage → Component → UI Update
```

### State Management
- App-level state in `App.tsx`
- Passed down via props
- LocalStorage for persistence

### Type System
All types in `src/types/`:
- `Faction` - Faction data
- `Operative` - Operative stats
- `Weapon` - Weapon profiles
- `TeamState` - Application state

## 📖 Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture overview with diagrams
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Full contribution guidelines
- [SPEC.md](./SPEC.md) - Technical specification
- [README.md](./README.md) - User documentation

## 💡 Pro Tips

1. **Use TypeScript Strict**: Helps catch bugs early
2. **Test As You Go**: Write tests alongside code
3. **Keep Components Small**: Easier to test and maintain
4. **Use Path Aliases**: `@/` is cleaner than `../../`
5. **Run Validate Often**: Catch issues before committing
6. **Check Examples**: Look at existing code for patterns

## 🆘 Getting Help

- Check existing code for examples
- Read the [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
- Open an issue on GitHub
- Look at closed PRs for similar changes

---

Happy coding! 🎉
