This directory is intended to hold the original PDF sources for rule extraction.

Guidance:
- Do NOT commit PDFs to the repository; this folder is ignored by `.gitignore`.
- Use this folder locally as the input for your extraction script.
- The extraction script should write JSON/TS output into `src/data/` or `data/`.

Example workflow:
1. Place PDFs here (local only).
2. Run `npm run extract-rules` to convert PDFs into JSON/TS rule files.
3. Commit only the generated JSON/TS files, not the PDFs.

If you need to track large PDFs in the repository, consider using Git LFS.
