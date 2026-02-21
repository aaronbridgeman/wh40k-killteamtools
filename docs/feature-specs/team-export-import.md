# Feature Spec: Team Export/Import System

## Overview
Allow users to export their created Kill Teams to JSON format for backup, sharing, and import them back into the application.

## Priority
**High** - Enables team sharing and backup, addressing data loss concerns

## User Stories
1. As a player, I want to export my team to a JSON file so I can back it up
2. As a player, I want to share my team composition with friends
3. As a player, I want to import a team from a JSON file my friend shared
4. As a tournament organizer, I want players to submit teams as JSON files for validation

## Requirements

### Functional Requirements

#### Export Functionality
1. **Export Button Location**: Add "Export Team" button to SelectedTeamView component
2. **Export Format**: 
   ```json
   {
     "version": "1.0",
     "exportDate": "2026-02-21T02:00:00.000Z",
     "factionId": "angels-of-death",
     "factionName": "Angels of Death",
     "teamName": "My Kill Team",
     "selectedOperatives": [...],
     "ruleChoices": {...}
   }
   ```
3. **Filename Convention**: `killteam-{factionId}-{timestamp}.json`
4. **Validation**: Ensure team is valid before export (at least one operative selected)

#### Import Functionality
1. **Import Button Location**: Add "Import Team" button to home view when no faction selected
2. **File Picker**: HTML file input accepting `.json` files only
3. **Validation Steps**:
   - Verify JSON structure matches expected schema
   - Check version compatibility
   - Validate faction exists in app
   - Validate all operative IDs exist
   - Validate all weapon IDs exist
   - Check team composition rules
4. **Error Handling**:
   - Display clear error messages for each validation failure
   - Offer to partially import if some operatives are missing
5. **Confirmation**: Show preview of team before confirming import

### Non-Functional Requirements
1. **Security**: Sanitize imported data to prevent XSS
2. **Performance**: Handle large team files (100+ operatives) gracefully
3. **Compatibility**: Support future version upgrades with schema migrations
4. **Accessibility**: Ensure file picker and buttons are keyboard accessible

## Technical Design

### New Components
```typescript
// src/components/team/TeamExport.tsx
interface TeamExportProps {
  teamState: TeamState;
  faction: Faction;
  onExport: () => void;
}

// src/components/team/TeamImport.tsx  
interface TeamImportProps {
  onImport: (teamState: TeamState) => void;
  onError: (error: string) => void;
}
```

### New Services
```typescript
// src/services/teamExportService.ts
export function exportTeamToJSON(
  teamState: TeamState, 
  faction: Faction,
  teamName?: string
): string;

export function downloadTeamJSON(
  teamState: TeamState,
  faction: Faction
): void;

// src/services/teamImportService.ts
export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  teamState: TeamState | null;
}

export function validateImportedTeam(
  jsonContent: string
): ImportValidationResult;

export function importTeamFromJSON(
  jsonContent: string
): TeamState;
```

### Schema Validation
```typescript
// src/schemas/teamExportSchema.ts
export const TEAM_EXPORT_SCHEMA = {
  version: "1.0",
  required: ["version", "factionId", "selectedOperatives"],
  properties: {
    version: { type: "string" },
    exportDate: { type: "string", format: "date-time" },
    factionId: { type: "string" },
    factionName: { type: "string" },
    teamName: { type: "string" },
    selectedOperatives: { type: "array" },
    ruleChoices: { type: "object", nullable: true }
  }
};
```

## UI/UX Mockup

### Export Flow
```
[SelectedTeamView]
  ├── Team Summary
  ├── Operative Cards
  └── Actions Bar
      ├── [Clear Team]
      └── [Export Team] ← NEW
          └── Click → Downloads JSON file
```

### Import Flow
```
[Home View - No Faction Selected]
  ├── Faction Selector
  └── Quick Actions
      ├── [Start New Team]
      └── [Import Team] ← NEW
          └── Click → File Picker
              └── Select JSON → Preview → Confirm → Load Team
```

## Testing Strategy

### Unit Tests
- `teamExportService.test.ts`: Test JSON generation
- `teamImportService.test.ts`: Test validation logic
- Each validation rule should have dedicated test cases

### Integration Tests
- End-to-end export → import cycle
- Import with missing faction
- Import with invalid operative IDs
- Import with corrupted JSON

### Manual Testing
- Export team, edit JSON manually, reimport
- Export from one browser, import to another
- Test with large teams (20+ operatives)

## Implementation Plan

### Phase 1: Export (Week 1)
- [ ] Create TeamExport component
- [ ] Implement exportTeamToJSON service
- [ ] Add download functionality
- [ ] Write unit tests
- [ ] Update SelectedTeamView to include export button

### Phase 2: Import (Week 2)
- [ ] Create TeamImport component
- [ ] Implement importTeamFromJSON service
- [ ] Add validation logic
- [ ] Create import preview UI
- [ ] Write unit tests
- [ ] Add import button to home view

### Phase 3: Polish (Week 3)
- [ ] Add error handling and user feedback
- [ ] Improve validation messages
- [ ] Add integration tests
- [ ] Update documentation
- [ ] Add keyboard shortcuts (Ctrl+E for export, Ctrl+I for import)

## Dependencies
- None - pure client-side feature

## Considerations & Edge Cases
1. **Version Compatibility**: What if user imports team from future version?
   - Solution: Check version number, warn if newer, attempt best-effort import
2. **Faction Not Available**: What if imported faction doesn't exist yet?
   - Solution: Show error, suggest closest faction, or create placeholder
3. **Operative Changed**: What if operative stats changed since export?
   - Solution: Import with warning, show differences
4. **Large Files**: What if team JSON is very large?
   - Solution: Stream parsing for files > 1MB
5. **Browser Compatibility**: File download API support?
   - Solution: Use blob URLs, fallback to data URLs

## Future Enhancements
- Export to PDF (separate spec)
- Cloud sync with GitHub Gists
- QR code generation for quick team sharing
- Team versioning/history
- Batch import multiple teams
- Export with embedded images

## Success Metrics
- Users successfully export at least one team per session
- Import success rate > 95%
- No data loss during export/import cycle
- < 5 support requests about export/import per month

## Related Features
- Team Library (save multiple teams locally)
- Team Sharing (URL-based)
- PDF Export
