# Feature Spec: PDF Export for Team Datacards

## Overview
Export team datacards as a professionally formatted PDF document for printing and offline reference during games.

## Priority
**High** - Essential for tabletop gameplay, frequently requested feature

## User Stories
1. As a player, I want to print my team datacards for use during games
2. As a tournament player, I want to submit my list as a PDF
3. As a player without internet at the game store, I want offline datacards
4. As a tournament organizer, I want standardized team list format for validation

## Requirements

### Functional Requirements

#### PDF Generation
1. **Export Button**: "Export as PDF" button in SelectedTeamView
2. **PDF Content**:
   - Team name and faction
   - Each operative datacard with:
     - Name, type, and stats (M, APL, GA, DF, SV, W)
     - All weapons with profiles
     - Abilities and keywords
     - Optional operative image
   - Faction rules summary
   - Selected faction rule choices
3. **Page Layout**:
   - Letter/A4 size support
   - Portrait and landscape options
   - 2-4 operatives per page
   - Page numbers and team name in footer
4. **Styling**:
   - Professional black & white for printing
   - Optional color mode
   - Faction-themed headers (optional)

#### Export Options
1. **Format Options**:
   - Include/exclude images
   - Include/exclude faction rules
   - Compact vs detailed layout
   - Color vs black & white
2. **File Naming**: `{teamName}-{factionId}-{date}.pdf`
3. **Preview**: Show PDF preview before download

### Non-Functional Requirements
1. **Quality**: 300 DPI for printing quality
2. **File Size**: < 5MB for teams with images, < 500KB without
3. **Performance**: Generate PDF in < 5 seconds
4. **Browser Compatibility**: Works in all modern browsers

## Technical Design

### PDF Generation Library
**Choice**: jsPDF + jsPDF-AutoTable
- Mature, well-maintained library
- Good documentation
- Small bundle size (~200KB gzipped)
- Client-side generation (no backend needed)

**Alternative**: PDFKit (if need more control)

### Service Architecture
```typescript
// src/services/pdfExportService.ts
export interface PDFExportOptions {
  teamName: string;
  includeImages: boolean;
  includeFactionRules: boolean;
  layout: 'compact' | 'detailed';
  colorMode: 'color' | 'bw';
  pageSize: 'letter' | 'a4';
  orientation: 'portrait' | 'landscape';
}

export async function generateTeamPDF(
  teamState: TeamState,
  faction: Faction,
  options: PDFExportOptions
): Promise<Blob>;

export async function downloadTeamPDF(
  teamState: TeamState,
  faction: Faction,
  options: PDFExportOptions
): Promise<void>;

export function previewTeamPDF(
  teamState: TeamState,
  faction: Faction,
  options: PDFExportOptions
): string; // Returns data URL for preview
```

### PDF Layout Templates
```typescript
// src/services/pdfLayouts.ts
export abstract class PDFLayout {
  abstract renderHeader(pdf: jsPDF, teamName: string, faction: Faction): void;
  abstract renderOperativeCard(pdf: jsPDF, operative: Operative, weapons: Weapon[]): void;
  abstract renderFactionRules(pdf: jsPDF, faction: Faction): void;
  abstract renderFooter(pdf: jsPDF, pageNumber: number, totalPages: number): void;
}

export class CompactLayout extends PDFLayout {
  // 4 operatives per page, minimal spacing
}

export class DetailedLayout extends PDFLayout {
  // 2 operatives per page, full weapon profiles
}
```

### Component Integration
```typescript
// src/components/team/PDFExportDialog.tsx
interface PDFExportDialogProps {
  teamState: TeamState;
  faction: Faction;
  isOpen: boolean;
  onClose: () => void;
}

export function PDFExportDialog({
  teamState,
  faction,
  isOpen,
  onClose
}: PDFExportDialogProps) {
  const [options, setOptions] = useState<PDFExportOptions>(defaultOptions);
  const [preview, setPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      await downloadTeamPDF(teamState, faction, options);
      onClose();
    } catch (error) {
      // Show error toast
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Options form */}
      {/* PDF preview iframe */}
      {/* Export button */}
    </Modal>
  );
}
```

## PDF Layout Design

### Header (Portrait, Detailed Layout)
```
┌────────────────────────────────────────────────┐
│  KILL TEAM DATACARD                            │
│  Tournament Angels | Angels of Death           │
└────────────────────────────────────────────────┘
```

### Operative Card
```
┌────────────────────────────────────────────────┐
│  ASSAULT INTERCESSOR SERGEANT    [Leader] ⚔️   │
├────────────────────────────────────────────────┤
│  M: 6"  APL: 2  GA: 1  DF: 3  SV: 3+  W: 18   │
├────────────────────────────────────────────────┤
│  WEAPONS                                        │
│  Bolt pistol (Ranged)                          │
│    A: 4  BS: 3+  Damage: 3/4  Range: 6"       │
│                                                │
│  Heavy bolt pistol (Ranged)                    │
│    A: 4  BS: 3+  Damage: 4/5  Range: 6"       │
│    Rules: Balanced, Piercing 1                 │
│                                                │
│  ABILITIES                                     │
│  • Angels of Death (1 AP): Re-roll attack die  │
│  • Combat Master: +1 attack in melee           │
│                                                │
│  KEYWORDS: ADEPTUS ASTARTES, INTERCESSOR       │
└────────────────────────────────────────────────┘
```

### Footer
```
┌────────────────────────────────────────────────┐
│  Tournament Angels | Page 1 of 3               │
└────────────────────────────────────────────────┘
```

### Compact Layout (4 per page)
```
┌─────────────────────┬─────────────────────┐
│  Operative 1 Card   │  Operative 2 Card   │
│  (Condensed)        │  (Condensed)        │
├─────────────────────┼─────────────────────┤
│  Operative 3 Card   │  Operative 4 Card   │
│  (Condensed)        │  (Condensed)        │
└─────────────────────┴─────────────────────┘
```

## Testing Strategy

### Unit Tests
```typescript
// tests/unit/pdfExportService.test.ts
- Should generate PDF blob
- Should include all operatives
- Should respect layout options
- Should handle missing images gracefully
- Should generate valid PDF structure
- Should calculate correct page count
```

### Visual Tests
- Manual review of generated PDFs
- Check alignment and spacing
- Verify text doesn't overflow
- Ensure print quality
- Test with various team sizes (1-20 operatives)

### Integration Tests
- Export team → Open PDF → Verify content
- Export with images → Check file size
- Export without faction rules → Verify omission
- Preview → Export → Files match

### Print Tests
- Physical print test on multiple printers
- Verify margins are correct
- Check color vs B&W output
- Test Letter vs A4 page sizes

## Implementation Plan

### Phase 1: Core PDF Generation (Week 1)
- [ ] Add jsPDF and jsPDF-AutoTable dependencies
- [ ] Create pdfExportService with basic generation
- [ ] Implement CompactLayout template
- [ ] Test basic operative card rendering
- [ ] Add download functionality

### Phase 2: Enhanced Layouts (Week 2)
- [ ] Implement DetailedLayout template
- [ ] Add weapon profiles rendering
- [ ] Add abilities rendering
- [ ] Add faction rules section
- [ ] Handle page breaks intelligently

### Phase 3: Options & UI (Week 3)
- [ ] Create PDFExportDialog component
- [ ] Add export options form
- [ ] Implement PDF preview
- [ ] Add "Export as PDF" button to team view
- [ ] Style options form

### Phase 4: Polish & Testing (Week 4)
- [ ] Add loading indicators
- [ ] Optimize file size
- [ ] Add error handling
- [ ] Test with all factions
- [ ] Physical print testing
- [ ] Documentation

## Dependencies
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.6.0"
}
```

## Considerations & Edge Cases

### 1. Large Teams
**Problem**: 20+ operative team creates huge PDF
**Solution**: 
- Warn user about file size
- Offer compact layout option
- Paginate intelligently

### 2. Missing Images
**Problem**: Operative images not loaded or unavailable
**Solution**: 
- Gracefully omit images
- Use placeholder or initials
- Don't break PDF generation

### 3. Long Ability Text
**Problem**: Ability descriptions overflow card
**Solution**:
- Use smaller font for long text
- Truncate with "..." and page reference
- Auto-adjust card height

### 4. Browser Memory
**Problem**: Large PDF generation uses lots of memory
**Solution**:
- Stream generation (page by page)
- Compress images before embedding
- Clean up after generation

### 5. Font Licensing
**Problem**: Custom fonts may not be licensed for PDF embedding
**Solution**: Use web-safe fonts or embed licensed fonts

### 6. Print Margins
**Problem**: Printers have unprintable margins
**Solution**:
- Add 0.25" margin to all sides
- Test with common printers
- Document recommended settings

## Future Enhancements
- Custom PDF templates (user-designed)
- Export multiple teams to one PDF
- Generate QR code for digital version
- Faction-themed watermarks
- PDF form fields for wound tracking
- Export to PNG/JPEG images instead
- Cloud storage integration
- Email PDF directly from app
- Multi-language support for PDF content

## Success Metrics
- 50%+ of users export at least one PDF
- < 3% report PDF generation errors
- Average PDF file size < 2MB
- 95%+ say PDF is usable for games
- Positive feedback on print quality

## Related Features
- Team Export (JSON)
- Team Library
- Printable CSS stylesheet (web print alternative)
- Image optimization service
