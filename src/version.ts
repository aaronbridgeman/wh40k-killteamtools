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
  gitHash: '605e852',
  buildTimestamp: '2026-02-21T11:02:58.221Z',
} as const;

export function getVersionString(): string {
  return VERSION_INFO.version;
}

export function getFullVersionInfo(): string {
  return `v${VERSION_INFO.version} (${VERSION_INFO.gitHash})`;
}
