# Version Management

This project uses a semantic versioning system with the format: `major.minor.commit`

## Version Components

- **Major**: Set manually in `package.json` - increment for breaking changes or major features
- **Minor**: Set in `version.json` - increment for new features or improvements
- **Commit**: Automatically calculated from git commit count - increments on every commit

## How It Works

The version is automatically generated during the build process by `scripts/generate-version.js`.

### Build Process

When you run `npm run build`, the following happens:
1. `generate-version.js` script runs first
2. Reads major version from `package.json`
3. Reads minor version from `version.json`
4. Counts commits from git history
5. Gets current git commit hash
6. Generates `src/version.ts` with all version info
7. TypeScript compilation and Vite build proceed as normal

### Version Display

The version is displayed in the footer of the application using:
```typescript
import { getFullVersionInfo } from './version';

// Returns: "v0.1.3 (f43a0f1)"
const versionString = getFullVersionInfo();
```

## Manual Version Updates

### Increment Major Version (Breaking Changes)

1. Update version in `package.json`:
   ```json
   "version": "1.0.0"
   ```
2. The minor version in `version.json` will automatically reset to 0

### Increment Minor Version (New Features)

Run the increment script:
```bash
npm run version:increment-minor
```

This updates `version.json` and increments the minor version number.

## Files

- `version.json` - Tracks major and minor version (committed to git)
- `src/version.ts` - Auto-generated version info (ignored by git, generated on build)
- `scripts/generate-version.js` - Version generation script
- `scripts/increment-minor.js` - Helper to increment minor version

## Example Workflow

### For a New Feature
```bash
npm run version:increment-minor
git add version.json
git commit -m "feat: add new feature"
npm run build
```

### For a Bug Fix
```bash
# Just commit - commit number will auto-increment
git commit -m "fix: resolve issue"
npm run build
```

### For a Breaking Change
```bash
# Update package.json version from 0.1.0 to 1.0.0
npm run build
```

## CI/CD Integration

The GitHub Actions workflow automatically runs `npm run build`, which:
1. Generates the version file
2. Builds the application with the correct version
3. Deploys to GitHub Pages

The version info is embedded in the built files and displayed in the footer.
