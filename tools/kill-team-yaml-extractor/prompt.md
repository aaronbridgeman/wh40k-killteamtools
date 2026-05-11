Act as a data engineer. Extract the content of the attached Warhammer 40,000
Kill Team reference sheet into YAML format following the provided schema.

Specific Parsing Rules:

- Header Identification: some sheets label the skill column as `BS`, `WS`, or
  `HTD`; the schema normalizes all of them into the same `bs_ws` field
  (`bs_ws` = ballistic skill / weapon skill). The full mapping is
  `A` → `a` (attacks), `BS`/`WS`/`HTD` → `bs_ws`, `D` → `d` (damage), and
  `WR` → `rules` (weapon rules).
- Stat Conversion: Ensure `APL`, `MV` (Move), `SV` (Save), and `W` (Wounds) are
  placed in the `stats` block.
- Ploys: Distinguish between Strategy Ploys (usually first) and Firefight
  Ploys.
- Text Cleaning: Remove page numbers and decorative text (for example,
  `[Image 1]`, page footers, or similar non-rules content).
- Output: Provide valid YAML only.
