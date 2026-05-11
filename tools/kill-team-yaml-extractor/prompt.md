Act as a data engineer. Extract the content of the attached Warhammer 40,000
Kill Team reference sheet into YAML format following the provided schema.

Specific Parsing Rules:

- Header Identification: the hit/skill column may be labeled as either `HTD`
  or `WS` in different sheets; both map to `bs_ws`. The full mapping is
  `A` → `a` (attacks), `HTD`/`WS` → `bs_ws`, `D` → `d` (damage), and
  `WR` → `rules` (weapon rules).
- Stat Conversion: Ensure `APL`, `MV` (Move), `SV` (Save), and `W` (Wounds) are
  placed in the `stats` block.
- Ploys: Distinguish between Strategy Ploys (usually first) and Firefight
  Ploys.
- Text Cleaning: Remove page numbers and decorative text (for example,
  `[Image 1]`, page footers, or similar non-rules content).
- Output: Provide valid YAML only.
