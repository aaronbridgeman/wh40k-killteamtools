/**
 * Auto-generated version information
 * Generated at build time by scripts/generate-version.js
 * DO NOT EDIT MANUALLY
 */

export const VERSION_INFO = {
  version: '0.1.369',
  major: 0,
  minor: 1,
  commit: 369,
  gitHash: 'b858288',
  buildTimestamp: '2026-05-20T11:56:44.973Z',
} as const;

export function getVersionString(): string {
  return VERSION_INFO.version;
}

export function getFullVersionInfo(): string {
  return `v${VERSION_INFO.version} (${VERSION_INFO.gitHash})`;
}
