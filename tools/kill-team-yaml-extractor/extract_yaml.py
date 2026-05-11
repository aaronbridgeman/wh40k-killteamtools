#!/usr/bin/env python3
"""Best-effort PDF -> YAML extractor for Kill Team reference sheets.

Special handling:
- Any PDF with "NPO" in the filename is merged into one output file:
  output-yaml/npo-operatives.yaml
- Inquisitorial Agents keeps every referenced operative from the selection
  section as potential operatives, adding placeholders if no datacard was found.
"""

from __future__ import annotations

from dataclasses import dataclass
import re
from pathlib import Path
from typing import Any

import yaml
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent
INPUT_DIR = ROOT / "input-pdfs"
OUTPUT_DIR = ROOT / "output-yaml"


@dataclass
class OperativeBlock:
    name: str
    apl: int
    mv: str
    sv: str
    w: int
    body_lines: list[str]


HEADER_RE = re.compile(
    r"^(.+?)\s+APL\s+(\d+)\s+MV\s+([^\s]+)\s+SV\s+([0-9+]+)\s+W\s+(\d+)$"
)
# After clean_line() all multi-spaces collapse to single spaces, so use \s+ not \s{2,}.
# ATK: 1-2 digits; HIT: digit(s)+; DMG: digit/digit or '-'; WR: rest of line.
WEAPON_LINE_RE = re.compile(
    r"^(?:-\s*)?(.+?)\s+(\d{1,2})\s+(\d+\+)\s+(\d+/\d+|-)\s+(.+)$"
)

RANGED_NAME_HINTS = frozenset({
    "pistol", "carbine", "rifle", "gun", "cannon", "launcher", "bolter",
    "flamer", "las", "plasma", "melta", "grenade", "bow", "crossbow",
    "lascarbine", "laspistol", "lasgun", "boltgun", "autogun", "shotgun",
    "crossbow", "autocannon", "missile", "mortar", "sniper", "reaper",
    "gauss", "tesla", "blaster", "caster", "sprayer", "thrower",
})


def guess_weapon_type(name: str, rules: list[str]) -> str:
    if any("Rng" in r for r in rules):
        return "Ranged"
    name_lower = name.lower()
    if any(hint in name_lower for hint in RANGED_NAME_HINTS):
        return "Ranged"
    return "Melee"
# Matches both "Version 1.3 (updated 25 June 2025)" and "v1.3 (updated 28 Jan 2026)"
VERSION_RE = re.compile(
    r"(?:Version\s+|v)([0-9]+\.[0-9.]+)\s+\(updated\s+([^\)]+)\)",
    re.IGNORECASE,
)
ARCHETYPE_RE = re.compile(r"^ARCHETYPE:\s*(.+)$", re.IGNORECASE)


def clean_line(text: str) -> str:
    line = text.replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"')
    line = line.replace("\u2013", "-").replace("\u2014", "-")
    line = line.replace("\u201d", '"').replace("\u2022", "-")
    line = re.sub(r"\s+", " ", line).strip()
    return line


def extract_lines(pdf_path: Path) -> list[str]:
    reader = PdfReader(str(pdf_path))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    lines = [clean_line(line) for line in text.splitlines()]
    return [line for line in lines if line]


def slugify(filename: str) -> str:
    stem = Path(filename).stem
    stem = re.sub(r"\bv[0-9][^\)]*", "", stem, flags=re.IGNORECASE)
    stem = stem.replace("(A4)", "")
    stem = re.sub(r"\([^\)]*\)", "", stem)
    stem = re.sub(r"[^a-zA-Z0-9]+", "-", stem).strip("-").lower()
    return stem


def normalize_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip(" -")
    if name.isupper():
        return name.title()
    return name


def team_name_from_lines(lines: list[str], pdf_path: Path) -> str:
    for line in lines[:20]:
        if line.isupper() and "KILL TEAM" not in line and "REFERENCE SHEET" not in line:
            if len(line.split()) <= 6:
                return normalize_name(line)
    return normalize_name(slugify(pdf_path.name).replace("-", " "))


def extract_version_and_date(lines: list[str]) -> tuple[str, str]:
    for line in lines:
        match = VERSION_RE.search(line)
        if match:
            return f"v{match.group(1)}", match.group(2)
    return "unknown", "unknown"


def extract_archetypes(lines: list[str]) -> list[str]:
    for line in lines:
        match = ARCHETYPE_RE.match(line)
        if not match:
            continue
        raw = match.group(1)
        items = [item.strip().title() for item in raw.split("/") if item.strip()]
        return items
    return []


def find_section(lines: list[str], start: str, ends: list[str]) -> list[str]:
    try:
        start_index = lines.index(start)
    except ValueError:
        return []

    end_index = len(lines)
    for idx in range(start_index + 1, len(lines)):
        if lines[idx] in ends:
            end_index = idx
            break

    return lines[start_index + 1 : end_index]


def is_probable_heading(line: str) -> bool:
    if ":" in line:
        return False
    if any(token in line for token in ["APL", " MV ", " SV ", " W "]):
        return False
    if len(line) > 60:
        return False
    if line.startswith("-"):
        return False
    if line in {"STRATEGY PLOYS", "FIREFIGHT PLOYS", "OPERATIVES", "FACTION RULES", "FACTION EQUIPMENT"}:
        return False
    letters = [ch for ch in line if ch.isalpha()]
    if not letters:
        return False
    upper_ratio = sum(1 for ch in letters if ch.isupper()) / len(letters)
    return upper_ratio > 0.65


def parse_ploys(lines: list[str]) -> list[dict[str, str]]:
    ploys: list[dict[str, str]] = []
    current_name: str | None = None
    current_desc: list[str] = []

    def flush() -> None:
        nonlocal current_name, current_desc
        if not current_name:
            return
        description = " ".join(current_desc).strip()
        if description:
            ploys.append({"name": normalize_name(current_name), "cost": "1CP", "description": description})
        current_name = None
        current_desc = []

    for line in lines:
        if is_probable_heading(line):
            flush()
            current_name = line
            continue
        if current_name:
            current_desc.append(line)

    flush()
    return ploys


def parse_operatives(lines: list[str]) -> list[dict[str, Any]]:
    blocks: list[OperativeBlock] = []
    current: OperativeBlock | None = None

    for line in lines:
        match = HEADER_RE.match(line)
        if match:
            if current:
                blocks.append(current)
            current = OperativeBlock(
                name=normalize_name(match.group(1)),
                apl=int(match.group(2)),
                mv=match.group(3),
                sv=match.group(4),
                w=int(match.group(5)),
                body_lines=[],
            )
            continue

        if current:
            current.body_lines.append(line)

    if current:
        blocks.append(current)

    return [block_to_operative(block) for block in blocks]


def block_to_operative(block: OperativeBlock) -> dict[str, Any]:
    weapons: list[dict[str, Any]] = []
    rules: list[dict[str, str]] = []

    in_weapon_table = False
    weapon_prefix = ""
    current_rule_name: str | None = None
    current_rule_desc: list[str] = []

    def flush_rule(cost: str = "0AP") -> None:
        nonlocal current_rule_name, current_rule_desc
        if not current_rule_name:
            return
        description = " ".join(current_rule_desc).strip()
        if description:
            rules.append(
                {
                    "name": normalize_name(current_rule_name),
                    "description": description,
                    "cost": cost,
                }
            )
        current_rule_name = None
        current_rule_desc = []

    for line in block.body_lines:
        # Weapon table header: "A HT D WR" (clean_line collapses whitespace)
        if line in {"A HT D WR", "A WT D WR"} or (line.startswith("A ") and " WR" in line and len(line) < 20):
            in_weapon_table = True
            continue

        if in_weapon_table:
            is_sub_profile = line.startswith("- ")
            weapon_match = WEAPON_LINE_RE.match(line)
            if weapon_match:
                raw_name = weapon_match.group(1).strip().lstrip("- ").strip()
                a = int(weapon_match.group(2))
                bs_ws = weapon_match.group(3)
                d = weapon_match.group(4)
                raw_rules = weapon_match.group(5).strip()

                if is_sub_profile and weapon_prefix:
                    full_name = f"{weapon_prefix} ({raw_name})"
                else:
                    full_name = raw_name
                    weapon_prefix = ""  # clear prefix when a non-sub weapon appears

                weapon_rules = [] if raw_rules == "-" else [part.strip() for part in raw_rules.split(",") if part.strip()]
                weapon_type = guess_weapon_type(full_name, weapon_rules)

                weapons.append(
                    {
                        "name": normalize_name(full_name),
                        "type": weapon_type,
                        "a": a,
                        "bs_ws": bs_ws,
                        "d": d,
                        "rules": weapon_rules,
                    }
                )
                continue

            # Continuation of previous weapon's rules (multi-line rule text)
            if weapons and (
                line.startswith("(")
                or line.lower().startswith("piercing")
                or (weapons[-1]["rules"] and weapons[-1]["rules"][-1].endswith(","))
            ):
                extra = line.strip()
                if extra:
                    if weapons[-1]["rules"] and weapons[-1]["rules"][-1].endswith(","):
                        # Append to the incomplete last rule rather than adding a new entry
                        weapons[-1]["rules"][-1] = weapons[-1]["rules"][-1] + " " + extra
                    else:
                        weapons[-1]["rules"].append(extra)
                continue

            # Short line with no colon = weapon group prefix for sub-profiles
            if not is_sub_profile and ":" not in line and len(line) < 45:
                weapon_prefix = line
                continue

            in_weapon_table = False

        action_match = re.match(r"^([A-Z][A-Z'\-\s]+)\s+([0-9]AP)$", line)
        if action_match:
            flush_rule(cost=action_match.group(2))
            current_rule_name = action_match.group(1)
            continue

        rule_match = re.match(r"^([^:]{2,}):\s*(.*)$", line)
        if rule_match and len(rule_match.group(1)) <= 60:
            flush_rule()
            current_rule_name = rule_match.group(1)
            tail = rule_match.group(2).strip()
            if tail:
                current_rule_desc.append(tail)
            continue

        if current_rule_name:
            if line in {"Kill Team Reference Sheet by James And The Giant Squig", "INQUISITORIAL AGENTS"}:
                continue
            current_rule_desc.append(line)

    flush_rule()

    return {
        "name": block.name,
        "stats": {"apl": block.apl, "mv": block.mv, "sv": block.sv, "w": block.w},
        "weapons": weapons,
        "rules": rules,
    }


def parse_referenced_inquisitorial_operatives(lines: list[str]) -> set[str]:
    names: set[str] = set()
    operative_markers = [idx for idx, line in enumerate(lines) if line == "OPERATIVES"]
    if operative_markers:
        selection_start = operative_markers[0]
        selection_end = operative_markers[1] if len(operative_markers) > 1 else len(lines)
        selection_lines = lines[selection_start:selection_end]

        for line in selection_lines:
            if line.startswith("-"):
                candidate = line.strip("- ")
                candidate = re.sub(r"\s+with\s+.*$", "", candidate, flags=re.IGNORECASE)
                candidate = candidate.replace("operatives", "").strip()
                if not candidate or any(ch.isdigit() for ch in candidate):
                    continue
                names.add(normalize_name(candidate))
                continue

            plain_match = re.search(r"INQUISITORIAL\s+AGENT\s+([A-Z\- ]+?)\s+operative", line)
            if plain_match:
                names.add(normalize_name(plain_match.group(1)))

    req_start = None
    req_end = None
    for idx, line in enumerate(lines):
        if line == "INQUISITORIAL REQUISITION":
            req_start = idx
        if req_start is not None and line == "OPERATIVES":
            req_end = idx
            break

    if req_start is not None and req_end is not None:
        for line in lines[req_start:req_end]:
            if not line.startswith("-"):
                continue
            candidate = line.strip("- ")
            if candidate and not any(ch.isdigit() for ch in candidate):
                names.add(normalize_name(candidate))

    return names


def extract_team_data(pdf_path: Path) -> dict[str, Any]:
    lines = extract_lines(pdf_path)
    team_name = team_name_from_lines(lines, pdf_path)
    version, last_updated = extract_version_and_date(lines)
    archetypes = extract_archetypes(lines)

    strategy_lines = find_section(lines, "STRATEGY PLOYS", ["FIREFIGHT PLOYS"])
    firefight_lines = find_section(
        lines,
        "FIREFIGHT PLOYS",
        ["FACTION EQUIPMENT", "FACTION RULES", "OPERATIVES", "Version 1.3 (updated 25 June 2025)"]
    )

    operatives = parse_operatives(lines)

    if team_name.lower() == "inquisitorial agents":
        referenced = parse_referenced_inquisitorial_operatives(lines)
        existing = {op["name"] for op in operatives}

        def canonical(name: str) -> str:
            value = name.lower().strip()
            value = re.sub(r"\s+agent$", "", value)
            value = re.sub(r"[^a-z0-9]+", "", value)
            return value

        existing_canonical = {canonical(name) for name in existing}
        for missing in sorted(referenced):
            if canonical(missing) in existing_canonical:
                continue
            operatives.append(
                {
                    "name": missing,
                    "stats": {"apl": 0, "mv": '0"', "sv": "-", "w": 0},
                    "weapons": [],
                    "rules": [
                        {
                            "name": "Referenced Operative",
                            "description": "Included from Inquisitorial Agents selection/requisition references; parse corresponding source team sheet for full datacard.",
                            "cost": "0AP",
                        }
                    ],
                }
            )

    return {
        "team": {
            "name": team_name,
            "version": version,
            "last_updated": last_updated,
            "archetypes": archetypes,
            "strategy_ploys": parse_ploys(strategy_lines),
            "firefight_ploys": parse_ploys(firefight_lines),
            "operatives": operatives,
        }
    }


def write_yaml(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(yaml.safe_dump(payload, sort_keys=False, allow_unicode=False), encoding="utf-8")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Remove stale YAML files before regenerating so old mission-pack files etc. don't linger
    for stale in OUTPUT_DIR.glob("*.yaml"):
        stale.unlink()

    pdfs = sorted([path for path in INPUT_DIR.glob("*.pdf") if path.is_file()])
    if not pdfs:
        print(f"No PDF files found in {INPUT_DIR}")
        return

    npo_operatives: list[dict[str, Any]] = []
    generated = 0
    used_output_names: dict[str, int] = {}

    for pdf_path in pdfs:
        data = extract_team_data(pdf_path)
        team_name = data["team"]["name"]

        # Route NPO PDFs and Mission Pack PDFs to npo-operatives.yaml
        pdf_upper = pdf_path.name.upper()
        if "NPO" in pdf_upper or "MISSION PACK" in pdf_upper:
            npo_operatives.extend(data["team"].get("operatives", []))
            print(f"Merged NPO/mission profiles from {pdf_path.name}")
            continue

        base_output_name = slugify(pdf_path.name)
        suffix_count = used_output_names.get(base_output_name, 0)
        used_output_names[base_output_name] = suffix_count + 1
        output_name = (
            f"{base_output_name}.yaml"
            if suffix_count == 0
            else f"{base_output_name}-{suffix_count + 1}.yaml"
        )
        output_path = OUTPUT_DIR / output_name
        write_yaml(output_path, data)
        generated += 1
        print(f"Wrote {output_path.name} ({team_name})")

    if npo_operatives:
        dedup: dict[str, dict[str, Any]] = {}
        for operative in npo_operatives:
            key = operative.get("name", "").strip().lower()
            if not key:
                continue
            existing = dedup.get(key)
            if not existing or len(operative.get("weapons", [])) > len(existing.get("weapons", [])):
                dedup[key] = operative

        npo_payload = {
            "npo_operatives": sorted(dedup.values(), key=lambda item: item.get("name", ""))
        }
        write_yaml(OUTPUT_DIR / "npo-operatives.yaml", npo_payload)
        print(f"Wrote npo-operatives.yaml ({len(npo_payload['npo_operatives'])} profiles)")

    print(f"Generated {generated} kill team YAML files")


if __name__ == "__main__":
    main()
