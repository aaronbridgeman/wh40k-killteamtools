from pypdf import PdfReader
import json
import pathlib
import re
from typing import Optional


SOURCES = [
    pathlib.Path('tools/rule-pdfs/Core Rules/eng_jul25_kt_lite_rules-jmjv4hdamy-qlsqxdf83p.pdf'),
    pathlib.Path('tools/rule-pdfs/Core Rules/eng_28-01_kt_universal_equipment-bpc0wzzhk6-vilyhiv7kk.pdf'),
]

OUT_PATH = pathlib.Path('src/data/rules/core-rules.json')
OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

existing: dict[str, dict[str, str]] = {}
if OUT_PATH.exists():
    try:
        existing = json.loads(OUT_PATH.read_text())
    except Exception:
        existing = {}

entries: dict[str, dict[str, str]] = {}

heading_re = re.compile(r"^(?:[0-9]+X\s+)?[A-Z][A-Z0-9 \-–'\":/()\+]+$")
skip_tokens = {"UNIVERSAL EQUIPMENT", "LITE RULES"}


def flush_rule(name: Optional[str], parts: list[str]):
    """Store rule if we have one; prefer longer descriptions on duplicates."""
    if not name:
        return
    desc = ' '.join(chunk.strip() for chunk in parts if chunk.strip())
    if not desc:
        return
    prev = entries.get(name, {}).get('description', '')
    if len(desc) > len(prev):
        entries[name] = {'name': name, 'description': desc}


for src in SOURCES:
    reader = PdfReader(str(src))
    text = ''.join(page.extract_text() or '' for page in reader.pages)
    lines = [ln.strip() for ln in text.splitlines()]

    current_name: Optional[str] = None
    current_parts: list[str] = []

    for raw in lines:
        if not raw:
            continue
        if (
            heading_re.match(raw)
            and raw.upper() == raw
            and raw not in skip_tokens
            and len(raw) <= 80
        ):
            flush_rule(current_name, current_parts)
            clean = re.sub(r'^[0-9]+X\s+', '', raw).strip()
            current_name = clean.title()
            current_parts = []
        else:
            current_parts.append(raw)

    flush_rule(current_name, current_parts)

for key, value in existing.items():
    if key not in entries:
        entries[key] = value

ordered = {key: entries[key] for key in sorted(entries.keys())}
OUT_PATH.write_text(json.dumps(ordered, indent=2))
print(f"Wrote {len(entries)} entries to {OUT_PATH}")
