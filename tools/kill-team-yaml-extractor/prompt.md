Act as a data engineer. Extract the content of the attached Warhammer 40,000
Kill Team reference sheet into YAML format following the provided schema.

Specific Parsing Rules:

- Header Identification: `A HTD WR` or `A WS D WR` in the PDF corresponds to
  `Attacks, Hit/Skill, Damage, Weapon Rules`.
- Stat Conversion: Ensure `APL`, `MV` (Move), `SV` (Save), and `W` (Wounds) are
  placed in the `stats` block.
- Ploys: Distinguish between Strategy Ploys (usually first) and Firefight
  Ploys.
- Text Cleaning: Remove page numbers and decorative text (for example,
  `[Image 1]`, page footers, or similar non-rules content).
- Output: Provide valid YAML only.
