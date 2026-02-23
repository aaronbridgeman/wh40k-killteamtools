/**
 * Auto-generated version information
 * Generated at build time by scripts/generate-version.js
 * DO NOT EDIT MANUALLY
 */

export const VERSION_INFO = {
  version: '0.1.3',
  major: 0,
  minor: 1,
  commit: 3,
  gitHash: '090a4f6',
  buildTimestamp: '2026-02-23T00:18:38.659Z',
} as const;

export function getVersionString(): string {
  return VERSION_INFO.version;
}

export function getFullVersionInfo(): string {
  return `v${VERSION_INFO.version} (${VERSION_INFO.gitHash})`;
}
