/**
 * Auto-generated version information
 * Generated at build time by scripts/generate-version.js
 * DO NOT EDIT MANUALLY
 */

export const VERSION_INFO = {
  "version": "0.1.383",
  "major": 0,
  "minor": 1,
  "commit": 383,
  "gitHash": "7f197e3",
  "buildTimestamp": "2026-06-06T02:28:30.738Z"
} as const;

export function getVersionString(): string {
  return VERSION_INFO.version;
}

export function getFullVersionInfo(): string {
  return `v${VERSION_INFO.version} (${VERSION_INFO.gitHash})`;
}
