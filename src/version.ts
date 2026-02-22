/**
 * Auto-generated version information
 * Generated at build time by scripts/generate-version.js
 * DO NOT EDIT MANUALLY
 */

export const VERSION_INFO = {
  version: '0.1.2',
  major: 0,
  minor: 1,
  commit: 2,
  gitHash: 'e537192',
  buildTimestamp: '2026-02-22T14:03:40.840Z',
} as const;

export function getVersionString(): string {
  return VERSION_INFO.version;
}

export function getFullVersionInfo(): string {
  return `v${VERSION_INFO.version} (${VERSION_INFO.gitHash})`;
}
