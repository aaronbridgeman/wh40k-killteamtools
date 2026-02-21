#!/usr/bin/env node

/**
 * Increment Minor Version Script
 * Increments the minor version number in version.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const versionFilePath = join(rootDir, 'version.json');

try {
  const versionData = JSON.parse(readFileSync(versionFilePath, 'utf-8'));
  versionData.minor += 1;
  writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
  console.log(`Minor version incremented to: ${versionData.major}.${versionData.minor}`);
} catch (error) {
  console.error('Error incrementing minor version:', error.message);
  process.exit(1);
}
