/**
 * Auto-generated version information
 * Generated at build time by scripts/generate-version.js
 * DO NOT EDIT MANUALLY
 */

export const VERSION_INFO = {
  "version": "0.1.377",
  "major": 0,
  "minor": 1,
  "commit": 377,
  "gitHash": "26c0a1e",
  "buildTimestamp": "2026-05-31T03:52:28.175Z"
} as const;

export function getVersionString(): string {
  return VERSION_INFO.version;
}

export function getFullVersionInfo(): string {
  return `v${VERSION_INFO.version} (${VERSION_INFO.gitHash})`;
}
