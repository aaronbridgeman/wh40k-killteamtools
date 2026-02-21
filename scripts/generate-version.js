#!/usr/bin/env node

/**
 * Version Generation Script
 * Generates version information using major.minor.commit structure
 * - Major version: set manually in package.json
 * - Minor version: read from version.json (incremented on minor updates)
 * - Commit count: number of commits in current branch
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read major version from package.json
const packageJson = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf-8')
);
const [major] = packageJson.version.split('.');

// Read or initialize version metadata
const versionFilePath = join(rootDir, 'version.json');
let versionData = { major: parseInt(major), minor: 0 };

try {
  const existingVersion = JSON.parse(readFileSync(versionFilePath, 'utf-8'));
  versionData = existingVersion;
  // Update major if it changed in package.json
  if (versionData.major !== parseInt(major)) {
    versionData.major = parseInt(major);
    versionData.minor = 0; // Reset minor on major version change
  }
} catch (error) {
  // File doesn't exist, use defaults
  console.log('Creating new version.json');
}

// Get commit count for current branch
let commitCount = 0;
try {
  const countStr = execSync('git rev-list --count HEAD', {
    encoding: 'utf-8',
    cwd: rootDir,
  }).trim();
  commitCount = parseInt(countStr);
} catch (error) {
  console.warn('Warning: Could not get git commit count, using 0');
}

// Get current git hash
let gitHash = 'unknown';
try {
  gitHash = execSync('git rev-parse --short HEAD', {
    encoding: 'utf-8',
    cwd: rootDir,
  }).trim();
} catch (error) {
  console.warn('Warning: Could not get git hash');
}

// Get build timestamp
const buildTimestamp = new Date().toISOString();

// Generate version string
const version = `${versionData.major}.${versionData.minor}.${commitCount}`;

// Create version info object
const versionInfo = {
  version,
  major: versionData.major,
  minor: versionData.minor,
  commit: commitCount,
  gitHash,
  buildTimestamp,
};

// Write to version.json for tracking
writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2) + '\n');

// Write to src/version.ts for use in app
const versionTsContent = `/**
 * Auto-generated version information
 * Generated at build time by scripts/generate-version.js
 * DO NOT EDIT MANUALLY
 */

export const VERSION_INFO = ${JSON.stringify(versionInfo, null, 2)} as const;

export function getVersionString(): string {
  return VERSION_INFO.version;
}

export function getFullVersionInfo(): string {
  return \`v\${VERSION_INFO.version} (\${VERSION_INFO.gitHash})\`;
}
`;

writeFileSync(join(rootDir, 'src', 'version.ts'), versionTsContent);

console.log(`Generated version: ${version}`);
console.log(`Git hash: ${gitHash}`);
console.log(`Build timestamp: ${buildTimestamp}`);
