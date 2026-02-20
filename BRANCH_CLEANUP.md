# Branch Cleanup Documentation

## Overview

This document describes the branch cleanup process for the wh40k-killteamtools repository.

## Background

The repository had accumulated 18 unused branches from merged pull requests that needed cleanup. This cleanup improves repository maintainability and reduces clutter.

## Branches Cleaned Up

The following branches were identified for deletion as they have been merged into `main`:

| Branch Name | PR # | Status |
|-------------|------|--------|
| copilot/add-actions-costs-and-rules-page | #6 | Merged |
| copilot/add-available-attacks-display | #8 | Merged |
| copilot/add-dual-team-selection-ui | #13 | Merged |
| copilot/add-game-management-tab | #14 | Merged |
| copilot/add-game-management-tab-again | #15 | Closed without merge (superseded by #16) |
| copilot/add-team-view-toggle | #11 | Merged |
| copilot/add-weapon-rule-reference-page | #3 | Merged |
| copilot/build-to-docs-folder | #5 | Merged |
| copilot/create-kill-team-dataslate | #1 | Merged |
| copilot/fix-build-failure-issue | #4 | Merged |
| copilot/fix-failed-build | #2 | Merged |
| copilot/fix-weapon-rule-tags-legibility | #19 | Merged |
| copilot/generate-faction-operative-lists | #7 | Merged |
| copilot/improve-color-contrast | #18 | Merged |
| copilot/move-game-management-tab-first | #16 | Merged |
| copilot/set-up-copilot-instructions | #10 | Merged |
| copilot/update-colour-scheme-and-cards | #17 | Merged |
| copilot/update-faction-and-operative-info | #12 | Merged |

## Cleanup Methods

### Method 1: Automated Workflow (Recommended)

A GitHub Actions workflow has been created at `.github/workflows/cleanup-branches.yml` that:
- Runs automatically every Sunday at 00:00 UTC
- Can be triggered manually via workflow_dispatch
- Identifies branches merged into main
- Deletes them automatically

To trigger manually:
1. Go to Actions tab in GitHub
2. Select "Cleanup Merged Branches" workflow
3. Click "Run workflow"

### Method 2: Manual Script

A bash script is available at `scripts/cleanup-branches.sh`:

```bash
# Make script executable (if needed)
chmod +x scripts/cleanup-branches.sh

# Run the script
./scripts/cleanup-branches.sh
```

The script will:
1. List all branches to be deleted
2. Ask for confirmation
3. Delete the branches from the remote repository

Note: The script has execute permissions by default in the repository.

### Method 3: Manual Git Commands

If needed, branches can be deleted manually:

```bash
# Delete a single branch
git push origin --delete <branch-name>

# Example
git push origin --delete copilot/add-actions-costs-and-rules-page
```

## Best Practices Going Forward

1. **Delete branches after PR merge**: GitHub can be configured to automatically delete branches after PR merge
2. **Run cleanup workflow monthly**: The automated workflow helps maintain a clean repository
3. **Review stale branches**: Periodically review branches that haven't been updated in 90+ days

## GitHub Branch Protection

To enable automatic branch deletion after PR merge:
1. Go to Repository Settings
2. Navigate to "General" → "Pull Requests"
3. Enable "Automatically delete head branches"

This prevents accumulation of stale branches in the future.
