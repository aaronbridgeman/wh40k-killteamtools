#!/usr/bin/env python3
"""Schema validation and quality report for extracted kill team YAML files.

Checks each team YAML file in output-yaml/ and prints a summary of:
  - Missing required fields
  - Operatives with empty weapons lists
  - Ploys missing descriptions
  - Stat anomalies

Usage:
    python tools/kill-team-yaml-extractor/validate_yaml.py
    python tools/kill-team-yaml-extractor/validate_yaml.py --min-weapons 1
    python tools/kill-team-yaml-extractor/validate_yaml.py --verbose
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml


OUTPUT_DIR = Path(__file__).resolve().parent / "output-yaml"

REQUIRED_TEAM_FIELDS = ["name", "version", "archetypes", "strategy_ploys", "firefight_ploys", "operatives"]
REQUIRED_OPERATIVE_FIELDS = ["name", "stats", "weapons", "rules"]
REQUIRED_STAT_FIELDS = ["apl", "mv", "sv", "w"]


def check_team(path: Path, verbose: bool, min_weapons: int) -> list[str]:
    """Return a list of issue strings for this file, empty if clean."""
    issues: list[str] = []

    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"YAML parse error: {exc}"]

    # Handle npo-operatives.yaml which has a different top-level key
    if "npo_operatives" in data:
        operatives = data["npo_operatives"]
        for op in operatives:
            name = op.get("name", "<unnamed>")
            if not op.get("weapons"):
                issues.append(f"  NPO operative '{name}': no weapons")
        return issues

    team = data.get("team")
    if not team:
        return ["Missing top-level 'team' key"]

    team_name = team.get("name", path.stem)

    for field in REQUIRED_TEAM_FIELDS:
        if field not in team:
            issues.append(f"  Missing team field: '{field}'")

    if team.get("version", "unknown") == "unknown":
        issues.append("  version is 'unknown' - PDF parsing may have missed it")

    for ploy_kind in ("strategy_ploys", "firefight_ploys"):
        for ploy in team.get(ploy_kind, []):
            if not ploy.get("description", "").strip():
                issues.append(f"  {ploy_kind} '{ploy.get('name', '?')}': empty description")

    operatives = team.get("operatives", [])
    if not operatives:
        issues.append("  No operatives found - likely a parsing failure")

    for op in operatives:
        op_name = op.get("name", "<unnamed>")

        for field in REQUIRED_OPERATIVE_FIELDS:
            if field not in op:
                issues.append(f"  Operative '{op_name}': missing field '{field}'")

        stats = op.get("stats", {})
        for stat in REQUIRED_STAT_FIELDS:
            if stat not in stats:
                issues.append(f"  Operative '{op_name}': missing stat '{stat}'")

        # Highlight operatives with no weapons if they're expected to have some
        is_placeholder = any(
            r.get("name") == "Referenced Operative"
            for r in op.get("rules", [])
        )
        weapons = op.get("weapons", [])
        if not weapons and not is_placeholder and min_weapons > 0:
            issues.append(f"  Operative '{op_name}': weapons list is empty")

        # Validate each weapon
        for weapon in weapons:
            w_name = weapon.get("name", "<unnamed>")
            for wf in ("name", "type", "a", "bs_ws", "d"):
                if wf not in weapon:
                    issues.append(f"  Operative '{op_name}' weapon '{w_name}': missing field '{wf}'")
            if weapon.get("type") not in ("Ranged", "Melee", None):
                issues.append(f"  Operative '{op_name}' weapon '{w_name}': unexpected type '{weapon.get('type')}'")

    return issues


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate extracted Kill Team YAML files.")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show all issues, not just summary counts")
    parser.add_argument("--min-weapons", type=int, default=1, metavar="N",
                        help="Flag operatives with fewer than N weapons (default: 1, set 0 to disable)")
    parser.add_argument("--file", "-f", help="Validate only this YAML file (relative to output-yaml/)")
    args = parser.parse_args()

    if args.file:
        files = [OUTPUT_DIR / args.file]
    else:
        files = sorted(OUTPUT_DIR.glob("*.yaml"))

    if not files:
        print(f"No YAML files found in {OUTPUT_DIR}")
        sys.exit(1)

    total_files = 0
    clean_files = 0
    total_issues = 0

    print(f"Validating {len(files)} file(s) in {OUTPUT_DIR}/\n")

    for path in files:
        if not path.exists():
            print(f"[NOT FOUND] {path.name}")
            continue

        issues = check_team(path, args.verbose, args.min_weapons)
        total_files += 1

        if issues:
            total_issues += len(issues)
            print(f"[WARN] {path.name} ({len(issues)} issue(s))")
            if args.verbose:
                for issue in issues:
                    print(issue)
        else:
            clean_files += 1
            if args.verbose:
                print(f"[ OK ] {path.name}")

    print(f"\n--- Summary ---")
    print(f"Files checked : {total_files}")
    print(f"Clean files   : {clean_files}")
    print(f"Files w/ issues: {total_files - clean_files}")
    print(f"Total issues  : {total_issues}")

    if total_issues > 0 and not args.verbose:
        print("\nRe-run with --verbose to see detailed issue list per file.")

    sys.exit(0 if total_issues == 0 else 1)


if __name__ == "__main__":
    main()
