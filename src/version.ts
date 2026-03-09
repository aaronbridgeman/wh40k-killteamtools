/**
 * Auto-generated version information
 * Generated at build time by scripts/generate-version.js
 * DO NOT EDIT MANUALLY
 */

export const VERSION_INFO = {
  "version": "0.1.3",
  "major": 0,
  "minor": 1,
  "commit": 3,
  "gitHash": "f1a2c87",
  "buildTimestamp": "2026-03-09T13:29:46.145Z"
} as const;

export function getVersionString(): string {
  return VERSION_INFO.version;
}

export function getFullVersionInfo(): string {
  return `v${VERSION_INFO.version} (${VERSION_INFO.gitHash})`;
}
