#!/bin/bash
# Branch Cleanup Script
# This script deletes branches that have been merged into main

set -e

echo "=== Kill Team Tools - Branch Cleanup ==="
echo ""

# Ensure we're in the repository root
cd "$(git rev-parse --show-toplevel)"

# Fetch the latest from origin
echo "Fetching latest from origin..."
git fetch origin --prune

# Get the default branch
DEFAULT_BRANCH="main"
echo "Default branch: $DEFAULT_BRANCH"
echo ""

# List of branches that have been merged (based on PR analysis)
# Note: Includes PR #15 which was closed without merge (superseded by #16)
BRANCHES_TO_DELETE=(
  "copilot/add-actions-costs-and-rules-page"
  "copilot/add-available-attacks-display"
  "copilot/add-dual-team-selection-ui"
  "copilot/add-game-management-tab"
  "copilot/add-game-management-tab-again"
  "copilot/add-team-view-toggle"
  "copilot/add-weapon-rule-reference-page"
  "copilot/build-to-docs-folder"
  "copilot/create-kill-team-dataslate"
  "copilot/fix-build-failure-issue"
  "copilot/fix-failed-build"
  "copilot/fix-weapon-rule-tags-legibility"
  "copilot/generate-faction-operative-lists"
  "copilot/improve-color-contrast"
  "copilot/move-game-management-tab-first"
  "copilot/set-up-copilot-instructions"
  "copilot/update-colour-scheme-and-cards"
  "copilot/update-faction-and-operative-info"
)

echo "The following ${#BRANCHES_TO_DELETE[@]} branches will be deleted:"
for branch in "${BRANCHES_TO_DELETE[@]}"; do
  echo "  - $branch"
done
echo ""

# Confirm before proceeding
read -p "Do you want to proceed with deletion? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Deleting branches..."
SUCCESS_COUNT=0
FAIL_COUNT=0

for branch in "${BRANCHES_TO_DELETE[@]}"; do
  echo -n "Deleting $branch... "
  if git push origin --delete "$branch" 2>/dev/null; then
    echo "✓ deleted"
    ((SUCCESS_COUNT++))
  else
    echo "✗ failed (may already be deleted)"
    ((FAIL_COUNT++))
  fi
done

echo ""
echo "=== Summary ==="
echo "Successfully deleted: $SUCCESS_COUNT branches"
echo "Failed/Already deleted: $FAIL_COUNT branches"
echo ""
echo "Branch cleanup complete!"
