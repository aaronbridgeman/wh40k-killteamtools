# AI Kill Team YAML Extractor Workspace

This workspace is a local-only companion to the web app for extracting Kill
Team reference sheet data from PDFs into YAML with AI assistance.

## Folder Layout

- `input-pdfs/` - local PDF inputs; ignored by git
- `output-yaml/` - generated YAML files, one per kill team
- `prompt.md` - reusable AI extraction prompt
- `schema.yaml` - target YAML schema and field guidance

## Recommended Workflow

1. Copy a reference sheet PDF into `input-pdfs/`.
2. Attach the PDF to your AI tool of choice.
3. Paste in `prompt.md`.
4. Ask the AI to return YAML only using `schema.yaml`.
5. Save the result in `output-yaml/<kill-team-id>.yaml`.
6. Review the YAML for accuracy.
7. Convert the reviewed YAML into the app's `faction.json` structure before
   wiring it into `src/data/factions/`.

## Automated Extraction

You can run a best-effort local parser across all PDFs in `input-pdfs/`:

```bash
python tools/kill-team-yaml-extractor/extract_yaml.py
```

This writes per-team YAML files into `output-yaml/`.

Special handling implemented:
- PDFs with `NPO` in their filename are merged into a single file:
   `output-yaml/npo-operatives.yaml`
- `Inquisitorial Agents` includes all referenced operatives from the selection
   section as potential operatives. If a referenced operative has no parsed
   datacard in that PDF, a placeholder entry is added.

The automated parser is intentionally heuristic and still requires review.

## Notes

- Keep official PDFs local; they are intentionally ignored by git.
- Remove decorative content, page numbers, and image placeholders from outputs.
- Split ploys into `strategy_ploys` and `firefight_ploys`.
- Map headers like `A HTD D WR`, `A BS D WR`, or `A WS D WR` to `a`,
  `bs_ws`, `d`, and `rules`.
