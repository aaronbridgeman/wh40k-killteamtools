#!/usr/bin/env python3
"""Generate src/data/solo/operativeCatalog.json from extractor YAML outputs.

Mapping rules for NPO YAML files:
- npo-operatives.yaml -> Mission Pack NPO Operatives
- core-rules-npo-operatives.yaml (or standard-npo-operatives.yaml) -> Core Rules NPO Operatives
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parent.parent
INPUT_DIR = ROOT / "tools" / "kill-team-yaml-extractor" / "output-yaml"
OUTPUT_FILE = ROOT / "src" / "data" / "solo" / "operativeCatalog.json"

MISSION_PACK_NPO_TEAM = {
    "id": "mission-pack-npo-operatives",
    "name": "Mission Pack NPO Operatives",
    "side": "npo",
}

CORE_RULES_NPO_TEAM = {
    "id": "core-rules-npo-operatives",
    "name": "Core Rules NPO Operatives",
    "side": "npo",
}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value)
    return value.strip("-") or "item"


def split_damage(value: Any) -> tuple[str, str]:
    raw = str(value or "").strip()
    if not raw:
        return "0", "0"

    if "/" in raw:
        normal, critical = raw.split("/", 1)
        return normal.strip() or "0", critical.strip() or "0"

    return raw, raw


def to_int(value: Any, default: int = 0) -> int:
    if isinstance(value, int):
        return value

    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return default


def get_behavior_rules(operative: dict[str, Any]) -> str:
    rules = operative.get("rules") or []
    for rule in rules:
        name = str(rule.get("name", "")).strip().lower()
        if "behaviour" in name or "behavior" in name:
            return str(rule.get("description", "")).strip()
    return ""


def resolve_npo_team_for_file(file_stem: str) -> dict[str, str]:
    normalized = file_stem.strip().lower()

    if normalized in {"core-rules-npo-operatives", "standard-npo-operatives"}:
        return CORE_RULES_NPO_TEAM

    if normalized.startswith("core-rules-npo"):
        return CORE_RULES_NPO_TEAM

    return MISSION_PACK_NPO_TEAM


def operative_to_profile(
    team_id: str,
    team_name: str,
    operative: dict[str, Any],
    index: int,
) -> dict[str, Any]:
    operative_name = str(operative.get("name", "Unnamed Operative")).strip() or "Unnamed Operative"
    profile_id = f"{team_id}--{slugify(operative_name)}--{index}"

    ranged_weapons: list[dict[str, Any]] = []
    melee_weapons: list[dict[str, Any]] = []

    for weapon_index, weapon in enumerate(operative.get("weapons") or []):
        damage, critical_damage = split_damage(weapon.get("d"))
        mapped = {
            "id": f"{profile_id}--w{weapon_index}",
            "name": str(weapon.get("name", "Unnamed Weapon")).strip() or "Unnamed Weapon",
            "attacks": to_int(weapon.get("a"), 0),
            "skill": str(weapon.get("bs_ws", "")).strip(),
            "damage": damage,
            "criticalDamage": critical_damage,
            "specialRules": ", ".join(str(rule).strip() for rule in (weapon.get("rules") or []) if str(rule).strip()),
        }

        if str(weapon.get("type", "")).strip().lower() == "melee":
            melee_weapons.append(mapped)
        else:
            ranged_weapons.append(mapped)

    stats = operative.get("stats") or {}
    profile = {
        "id": profile_id,
        "name": operative_name,
        "apl": to_int(stats.get("apl"), 0),
        "move": str(stats.get("mv", "")).strip(),
        "save": str(stats.get("sv", "")).strip(),
        "wounds": to_int(stats.get("w"), 0),
        "rangedWeapons": ranged_weapons,
        "meleeWeapons": melee_weapons,
        "behaviorRules": get_behavior_rules(operative),
    }

    return {
        "id": profile_id,
        "teamId": team_id,
        "teamName": team_name,
        "name": operative_name,
        "profile": profile,
    }


def build_catalog() -> dict[str, Any]:
    teams: list[dict[str, Any]] = [MISSION_PACK_NPO_TEAM, CORE_RULES_NPO_TEAM]
    operatives: list[dict[str, Any]] = []
    seen_team_ids = {MISSION_PACK_NPO_TEAM["id"], CORE_RULES_NPO_TEAM["id"]}

    for yaml_file in sorted(INPUT_DIR.glob("*.yaml")):
        data = yaml.safe_load(yaml_file.read_text(encoding="utf-8")) or {}
        if not isinstance(data, dict):
            continue

        if "team" in data and isinstance(data["team"], dict):
            team = data["team"]
            team_name = str(team.get("name", yaml_file.stem)).strip() or yaml_file.stem
            team_id = slugify(yaml_file.stem)

            if team_id not in seen_team_ids:
                teams.append({"id": team_id, "name": team_name, "side": "both"})
                seen_team_ids.add(team_id)

            for idx, operative in enumerate(team.get("operatives") or []):
                if isinstance(operative, dict):
                    operatives.append(
                        operative_to_profile(team_id, team_name, operative, idx)
                    )
            continue

        if "npo_operatives" in data:
            npo_team = resolve_npo_team_for_file(yaml_file.stem)
            team_id = npo_team["id"]
            team_name = npo_team["name"]

            for idx, operative in enumerate(data.get("npo_operatives") or []):
                if isinstance(operative, dict):
                    operatives.append(
                        operative_to_profile(team_id, team_name, operative, idx)
                    )

    teams.sort(key=lambda item: item["name"])
    return {"teams": teams, "operatives": operatives}


def main() -> int:
    catalog = build_catalog()
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(catalog, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_FILE.relative_to(ROOT)}")
    print(f"Teams: {len(catalog['teams'])} Operatives: {len(catalog['operatives'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
