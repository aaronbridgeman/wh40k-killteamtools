# Contributing to Kill Team Dataslate

Thank you for your interest in contributing to Kill Team Dataslate! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Submitting Changes](#submitting-changes)
7. [Adding New Factions](#adding-new-factions)
8. [Documentation](#documentation)

## Code of Conduct

This project follows a code of conduct that we expect all contributors to adhere to:

- Be respectful and inclusive
- Focus on constructive feedback
- Keep discussions relevant to the project
- Help create a welcoming environment for new contributors

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)
- Git
- A GitHub account

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/wh40k-killteamtools.git
   cd wh40k-killteamtools
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/aaronbridgeman/wh40k-killteamtools.git
   ```

4. **Install dependencies**:
   ```bash
   npm ci
   ```

5. **Verify setup**:
   ```bash
   npm run validate
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### 2. Make Changes

- Follow the [Code Standards](#code-standards)
- Write or update tests as needed
- Update documentation if you change behavior
- Keep commits focused and atomic

### 3. Test Your Changes

Run the full validation suite before submitting:

```bash
npm run validate
```

This runs:
- Type checking (`npm run type-check`)
- Linting (`npm run lint`)
- Formatting checks (`npm run format:check`)
- All tests (`npm run test`)

### 4. Commit Changes

Write clear, descriptive commit messages:

```bash
git commit -m "feat: add new faction selector component"
# or
git commit -m "fix: resolve weapon tooltip display issue"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or fixes
- `chore:` - Maintenance tasks

### 5. Keep Your Branch Updated

Regularly sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

## Code Standards

### TypeScript

- **Strict Mode**: All code must compile in strict TypeScript mode
- **Type Safety**: Avoid `any` types; use proper interfaces and types
- **Explicit Return Types**: Functions should have explicit return types
- **No Implicit Any**: All parameters and variables should be typed

Example:
```typescript
// Good
function calculateCost(operatives: Operative[]): number {
  return operatives.reduce((total, op) => total + op.cost, 0);
}

// Bad
function calculateCost(operatives) {
  return operatives.reduce((total, op) => total + op.cost, 0);
}
```

### React Components

- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define interfaces for all component props
- **Destructuring**: Destructure props in function signature
- **CSS Modules**: Use CSS Modules for component styling

Example:
```typescript
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  );
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `OperativeCard`, `FactionSelector`)
- **Functions**: camelCase (e.g., `loadFaction`, `validateTeam`)
- **Types/Interfaces**: PascalCase (e.g., `Faction`, `WeaponProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_OPERATIVES`)
- **Files**: Match the main export (e.g., `OperativeCard.tsx`)

### Code Formatting

The project uses Prettier for code formatting:

```bash
npm run format        # Auto-format code
npm run format:check  # Check formatting
```

Configuration is in `.prettierrc`.

### Linting

The project uses ESLint for code quality:

```bash
npm run lint      # Check for issues
npm run lint:fix  # Auto-fix issues
```

Configuration is in `.eslintrc.cjs`.

## Testing Guidelines

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Maintain or improve test coverage
- Tests must pass before PR approval

### Test Types

**Unit Tests**
- Test individual functions and services
- Use Vitest
- Mock external dependencies

**Component Tests**
- Test React component rendering
- Test user interactions
- Use React Testing Library

**Integration Tests**
- Test complete workflows
- Test data loading and processing

### Writing Tests

Example unit test:
```typescript
import { describe, it, expect } from 'vitest';
import { calculateTeamCost } from './teamBuilder';

describe('calculateTeamCost', () => {
  it('should calculate total cost of operatives', () => {
    const operatives = [
      { id: '1', cost: 10 },
      { id: '2', cost: 15 },
    ];
    
    expect(calculateTeamCost(operatives)).toBe(25);
  });
});
```

Example component test:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render title', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
npm run test              # Run all tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

## Submitting Changes

### Pull Request Process

1. **Ensure all checks pass**: Run `npm run validate`
2. **Update documentation**: If you changed behavior
3. **Add tests**: For new features or bug fixes
4. **Write a clear description**: Explain what and why
5. **Link related issues**: Use "Fixes #123" or "Closes #123"

### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

- All PRs require at least one approval
- Address review comments promptly
- Keep PR scope focused and manageable
- Be responsive to feedback

## Adding New Factions

See [SPEC.md](./SPEC.md#92-adding-new-factions) for detailed instructions.

Quick checklist:
1. Create faction directory in `src/data/factions/{faction-id}/`
2. Create `faction.json` with complete faction data
3. Add operative images to `public/images/operatives/{faction-id}/`
4. Update `AVAILABLE_FACTIONS` in `src/services/dataLoader.ts`
5. Write unit tests for faction data
6. Update documentation

## Documentation

### Documentation Standards

- **README.md**: User-facing documentation
- **SPEC.md**: Technical specification
- **ARCHITECTURE.md**: System architecture
- **CONTRIBUTING.md**: This file
- **JSDoc Comments**: Document all public functions and complex logic

### JSDoc Guidelines

Example:
```typescript
/**
 * Load faction data by ID
 * 
 * @param factionId - The unique identifier for the faction
 * @returns Promise resolving to the faction data
 * @throws Error if faction cannot be loaded
 */
export async function loadFaction(factionId: FactionId): Promise<Faction> {
  // Implementation
}
```

### Updating Documentation

When you change functionality:
1. Update relevant markdown files
2. Update JSDoc comments
3. Update type definitions if needed
4. Consider adding examples

## Accessibility

All contributions must maintain WCAG 2.1 AA compliance:

- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers when possible
- Maintain sufficient color contrast
- Provide alternative text for images

## Performance

Consider performance implications:
- Avoid unnecessary re-renders
- Use memoization for expensive calculations
- Lazy load when appropriate
- Keep bundle size reasonable

## Questions?

If you have questions:
- Check existing documentation
- Review closed PRs for similar changes
- Open a discussion on GitHub
- Ask in your PR if working on something specific

## Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

## Additional Resources

- [README.md](./README.md) - Project overview
- [SPEC.md](./SPEC.md) - Technical specification
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture documentation
- [GitHub Issues](https://github.com/aaronbridgeman/wh40k-killteamtools/issues)
- [Pull Requests](https://github.com/aaronbridgeman/wh40k-killteamtools/pulls)
