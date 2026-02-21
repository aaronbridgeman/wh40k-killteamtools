# Feature Spec: Team Library (Multiple Saved Teams)

## Overview
Allow users to save, manage, and switch between multiple team configurations for the same or different factions.

## Priority
**High** - Core feature for players who maintain multiple teams

## User Stories
1. As a player with multiple lists, I want to save each configuration separately
2. As a player, I want to quickly switch between my saved teams
3. As a player, I want to name my teams (e.g., "Tournament List", "Casual Play")
4. As a player preparing for a tournament, I want to compare different team configurations
5. As a player, I want to delete old teams I no longer use

## Requirements

### Functional Requirements

#### Save Team
1. **Save Button**: Add "Save Team" button in SelectedTeamView
2. **Team Naming**: Prompt user for team name (required)
3. **Metadata**: Store creation date, last modified date, faction
4. **Validation**: Team must have at least one operative
5. **Duplicate Names**: Allow but append number (e.g., "My Team (2)")

#### Team Library View
1. **Library Access**: New "My Teams" button in header navigation
2. **Team List Display**:
   - Team name
   - Faction name and icon
   - Operative count
   - Last modified date
   - Quick actions (Load, Edit, Duplicate, Delete)
3. **Sorting Options**:
   - Recently modified (default)
   - Alphabetical
   - By faction
4. **Filtering**: Filter by faction
5. **Search**: Search teams by name

#### Load Team
1. **Load Confirmation**: If current team has unsaved changes, confirm before loading
2. **Load Behavior**: Replace current team with loaded team
3. **Faction Loading**: Auto-load faction if not already loaded

#### Team Management
1. **Edit Name**: Inline editing of team names
2. **Duplicate Team**: Create copy with "(Copy)" suffix
3. **Delete Team**: Confirmation dialog before deletion
4. **Export Team**: Quick export from library (see team-export-import spec)

### Non-Functional Requirements
1. **Storage Limit**: Support at least 50 saved teams
2. **Performance**: Library should load instantly (< 100ms)
3. **Data Integrity**: Validate team data on load, handle corrupted entries gracefully
4. **Responsive Design**: Library view works on mobile devices

## Technical Design

### Data Model
```typescript
// src/types/teamLibrary.ts
export interface SavedTeam {
  id: string; // UUID
  name: string;
  factionId: string;
  teamState: TeamState;
  metadata: {
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
    operativeCount: number;
    version: string; // App version when saved
  };
}

export interface TeamLibrary {
  teams: SavedTeam[];
  version: string; // Schema version
}
```

### Storage Service
```typescript
// src/services/teamLibraryService.ts
export function loadTeamLibrary(): TeamLibrary;
export function saveTeamLibrary(library: TeamLibrary): void;

export function addTeamToLibrary(
  name: string,
  factionId: string,
  teamState: TeamState
): SavedTeam;

export function updateTeamInLibrary(
  teamId: string,
  updates: Partial<SavedTeam>
): void;

export function deleteTeamFromLibrary(teamId: string): void;

export function duplicateTeam(teamId: string): SavedTeam;

export function getTeamById(teamId: string): SavedTeam | null;

export function searchTeams(query: string): SavedTeam[];

export function filterTeamsByFaction(factionId: string): SavedTeam[];
```

### Components
```typescript
// src/components/library/TeamLibrary.tsx
interface TeamLibraryProps {
  onLoadTeam: (team: SavedTeam) => void;
  onClose: () => void;
}

// src/components/library/TeamCard.tsx
interface TeamCardProps {
  team: SavedTeam;
  onLoad: () => void;
  onEdit: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
}

// src/components/library/SaveTeamDialog.tsx
interface SaveTeamDialogProps {
  teamState: TeamState;
  faction: Faction;
  existingTeamId?: string; // If updating existing team
  onSave: (name: string) => void;
  onCancel: () => void;
}
```

### localStorage Structure
```json
{
  "kill-team-library": {
    "version": "1.0",
    "teams": [
      {
        "id": "uuid-1",
        "name": "Tournament Angels",
        "factionId": "angels-of-death",
        "teamState": { ... },
        "metadata": {
          "createdAt": "2026-02-20T10:00:00Z",
          "updatedAt": "2026-02-21T15:30:00Z",
          "operativeCount": 8,
          "version": "0.1.2"
        }
      }
    ]
  }
}
```

## UI/UX Design

### Team Library View
```
┌────────────────────────────────────────────────┐
│  My Teams                          [✕] Close   │
├────────────────────────────────────────────────┤
│  [🔍 Search teams...]    Sort: ▼Recently Mod   │
│  Filter: [All Factions ▼]                      │
├────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │  Tournament Angels          [Angels ⚔️]  │  │
│  │  8 operatives • Updated 2 hours ago      │  │
│  │  [Load] [Edit] [Duplicate] [Delete] [...] │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Casual Plague Marines    [Death Guard]  │  │
│  │  6 operatives • Updated yesterday        │  │
│  │  [Load] [Edit] [Duplicate] [Delete] [...] │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  No teams found matching your search.         │
└────────────────────────────────────────────────┘
```

### Save Team Dialog
```
┌──────────────────────────────────┐
│  Save Team                   [✕] │
├──────────────────────────────────┤
│  Team Name:                      │
│  [My Kill Team____________]      │
│                                  │
│  Faction: Angels of Death        │
│  Operatives: 8                   │
│                                  │
│  [Cancel]           [Save Team]  │
└──────────────────────────────────┘
```

### Integration Points
```
App Header:
  [Single Team] [Game Mode] [My Teams] ← NEW

Single Team View → Team Selection:
  [Clear Team] [Save Team] ← NEW [Export Team]
```

## Testing Strategy

### Unit Tests
```typescript
// tests/unit/teamLibraryService.test.ts
- Should save team to library
- Should load library from storage
- Should update existing team
- Should delete team
- Should duplicate team with new ID
- Should search teams by name
- Should filter teams by faction
- Should handle corrupted library data
- Should enforce storage limits
```

### Integration Tests
- Complete save → load → edit → save cycle
- Library with 50+ teams performance
- Search and filter operations
- Delete team that's currently loaded
- Load team while another team is unsaved

### Manual Testing
- Save team with special characters in name
- Library behavior with empty state
- Sorting and filtering combinations
- Mobile responsiveness
- Keyboard navigation (Tab through teams)

## Implementation Plan

### Phase 1: Core Storage (Week 1)
- [ ] Define data models and types
- [ ] Implement teamLibraryService
- [ ] Add localStorage persistence
- [ ] Write service unit tests
- [ ] Add migration from old single-team storage

### Phase 2: UI Components (Week 2)
- [ ] Create TeamLibrary component
- [ ] Create TeamCard component
- [ ] Create SaveTeamDialog component
- [ ] Add "My Teams" navigation button
- [ ] Add "Save Team" button to team view

### Phase 3: Features & Polish (Week 3)
- [ ] Implement search functionality
- [ ] Add sorting and filtering
- [ ] Add duplicate and delete with confirmations
- [ ] Keyboard shortcuts (Ctrl+S to save)
- [ ] Mobile responsive design
- [ ] Integration tests

## Dependencies
- UUID library for generating team IDs: `npm install uuid`

## Considerations & Edge Cases

### 1. Storage Limits
**Problem**: localStorage has 5-10MB limit
**Solution**: 
- Limit to 50 teams
- Show storage usage indicator
- Offer export before deletion
- Compress stored data with LZ-string if needed

### 2. Name Collisions
**Problem**: User creates team with existing name
**Solution**: Append number: "My Team", "My Team (2)", "My Team (3)"

### 3. Orphaned Factions
**Problem**: User saves team for faction, then faction is removed from app
**Solution**: 
- Keep team data
- Show "Faction unavailable" warning
- Allow viewing but not loading
- Offer export option

### 4. Version Compatibility
**Problem**: Team saved in old version has outdated structure
**Solution**:
- Store version number with each team
- Implement migration functions
- Fallback to safe defaults for missing fields

### 5. Concurrent Edits
**Problem**: User opens app in multiple tabs
**Solution**:
- Listen to storage events
- Show notification when library changes in another tab
- Offer to reload library

### 6. Performance
**Problem**: Large library (50+ teams) slow to load/render
**Solution**:
- Virtual scrolling for team list
- Lazy load team thumbnails
- Cache search/filter results
- Debounce search input

## Migration Strategy

### From Single Team Storage
```typescript
// On first load, check for old storage format
const oldTeam = loadTeamState(); // old single-team format
if (oldTeam && oldTeam.selectedOperatives.length > 0) {
  // Migrate to library
  addTeamToLibrary("Imported Team", oldTeam.factionId, oldTeam);
  clearTeamState(); // Remove old format
}
```

## Future Enhancements
- Cloud sync with GitHub/Google Drive
- Team categories/folders
- Team tags (e.g., "competitive", "casual", "themed")
- Team sharing with URLs
- Team comparison view (side-by-side)
- Team notes/strategy field
- Import multiple teams at once
- Auto-save drafts
- Version history (undo/redo for teams)
- Team templates/presets

## Success Metrics
- Average user has 3+ saved teams
- 70%+ of users use team library feature
- < 2% data corruption/loss incidents
- < 100ms library load time
- Positive user feedback on team management

## Related Features
- Team Export/Import (enables sharing)
- Team Comparison View
- Cloud Sync
- Team Versioning
