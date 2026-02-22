/**
 * Auto-generated version information
 * Generated at build time by scripts/generate-version.js
 * DO NOT EDIT MANUALLY
 */

export const VERSION_INFO = {
  "version": "0.1.4",
  "major": 0,
  "minor": 1,
  "commit": 4,
  "gitHash": "3b5483c",
  "buildTimestamp": "2026-02-22T12:14:33.676Z"
} as const;

export function getVersionString(): string {
  return VERSION_INFO.version;
}

export function getFullVersionInfo(): string {
  return `v${VERSION_INFO.version} (${VERSION_INFO.gitHash})`;
}
