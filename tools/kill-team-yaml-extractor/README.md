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

## Notes

- Keep official PDFs local; they are intentionally ignored by git.
- Remove decorative content, page numbers, and image placeholders from outputs.
- Split ploys into `strategy_ploys` and `firefight_ploys`.
- Map `A HTD WR` or `A WS D WR` to `a`, `bs_ws`, `d`, and `rules`.
