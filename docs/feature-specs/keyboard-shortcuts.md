# Feature Spec: Keyboard Shortcuts

## Overview
Add keyboard shortcuts for common actions to improve power user efficiency and accessibility.

## Priority
**Medium** - Quality of life improvement for frequent users

## User Stories
1. As a power user, I want keyboard shortcuts so I can work faster
2. As a keyboard-only user, I want to navigate without a mouse
3. As a tournament organizer, I want quick access to common functions during events
4. As a player, I want to discover shortcuts through visual hints

## Keyboard Shortcuts List

### Global Shortcuts
| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl/Cmd + K` | Quick search / Command palette | Anywhere |
| `Ctrl/Cmd + S` | Save current team | Team editing |
| `Ctrl/Cmd + E` | Export current team | Team with operatives |
| `Ctrl/Cmd + I` | Import team | Home view |
| `Ctrl/Cmd + L` | Open team library | Anywhere |
| `Ctrl/Cmd + Shift + D` | Toggle dark mode | Anywhere |
| `Ctrl/Cmd + /` or `?` | Show keyboard shortcuts help | Anywhere |
| `Esc` | Close modal/dialog | When modal open |

### Navigation Shortcuts
| Shortcut | Action | Context |
|----------|--------|---------|
| `Alt + 1` | Single Team view | Anywhere |
| `Alt + 2` | Game Mode view | Anywhere |
| `Alt + 3` | Actions reference | Anywhere |
| `Alt + 4` | Rules reference | Anywhere |
| `Alt + 5` | Weapon Rules reference | Anywhere |
| `Tab` | Navigate forward | Anywhere |
| `Shift + Tab` | Navigate backward | Anywhere |

### Team Building Shortcuts
| Shortcut | Action | Context |
|----------|--------|---------|
| `A` | Add operative | Operative list |
| `R` | Remove operative | Selected team view |
| `C` | Clear team (with confirmation) | Team editing |
| `F` | Focus faction selector | Home view |
| `O` | Focus operative filter | Faction loaded |

### Game Mode Shortcuts
| Shortcut | Action | Context |
|----------|--------|---------|
| `Space` | Toggle initiative | Game mode |
| `+` / `=` | Increment turning point | Game mode |
| `-` / `_` | Decrement turning point | Game mode |
| `1` | Focus Alpha team | Game mode |
| `2` | Focus Bravo team | Game mode |

## Technical Design

### Shortcut Manager Service
```typescript
// src/services/keyboardShortcuts.ts
export interface KeyboardShortcut {
  keys: string[]; // e.g., ['Control', 'k'] or ['Alt', '1']
  description: string;
  action: () => void;
  context?: string; // Optional context restriction
  preventDefault?: boolean;
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut>;
  
  register(shortcut: KeyboardShortcut): void;
  unregister(keys: string[]): void;
  handleKeyPress(event: KeyboardEvent): boolean;
  getShortcutsByContext(context?: string): KeyboardShortcut[];
  
  // Platform-specific key mapping
  private normalizeKey(key: string): string;
  private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean;
}
```

### React Hook
```typescript
// src/hooks/useKeyboardShortcut.ts
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options?: {
    context?: string;
    preventDefault?: boolean;
    enabled?: boolean;
  }
): void {
  useEffect(() => {
    if (!options?.enabled && options?.enabled !== undefined) {
      return;
    }

    const manager = getKeyboardShortcutManager();
    const shortcut = {
      keys,
      description: '',
      action: callback,
      ...options,
    };

    manager.register(shortcut);

    return () => manager.unregister(keys);
  }, [keys, callback, options]);
}
```

### Keyboard Shortcuts Help Modal
```typescript
// src/components/common/KeyboardShortcutsHelp.tsx
interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const shortcuts = getKeyboardShortcutManager().getShortcutsByContext();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Keyboard Shortcuts</h2>
      <ShortcutList shortcuts={shortcuts} />
    </Modal>
  );
}
```

### Visual Hint System
```typescript
// src/components/common/ShortcutHint.tsx
interface ShortcutHintProps {
  shortcut: string; // e.g., "Ctrl+S"
  children: ReactNode;
}

export function ShortcutHint({ shortcut, children }: ShortcutHintProps) {
  return (
    <div className="shortcut-hint-container">
      {children}
      <kbd className="shortcut-hint">{shortcut}</kbd>
    </div>
  );
}
```

## UI/UX Design

### Visual Hints on Buttons
```
┌──────────────────────────┐
│  [Save Team]     Ctrl+S  │  ← Subtle hint
└──────────────────────────┘
```

### Keyboard Shortcuts Help Modal
```
┌────────────────────────────────────────────┐
│  Keyboard Shortcuts                   [✕]  │
├────────────────────────────────────────────┤
│  Global                                    │
│  ⌘K / Ctrl+K    Quick search               │
│  ⌘S / Ctrl+S    Save team                  │
│  ⌘E / Ctrl+E    Export team                │
│  ⌘/ / Ctrl+/    Show shortcuts             │
│                                            │
│  Navigation                                │
│  Alt+1          Single Team view           │
│  Alt+2          Game Mode view             │
│  Tab            Next element               │
│  Shift+Tab      Previous element           │
│                                            │
│  Team Building                             │
│  A              Add operative              │
│  C              Clear team                 │
│  F              Focus faction selector     │
│                                            │
│  [Close]                                   │
└────────────────────────────────────────────┘
```

### Command Palette (Ctrl+K)
```
┌────────────────────────────────────────────┐
│  🔍 [Search commands or teams...___]       │
├────────────────────────────────────────────┤
│  📁 My Teams                               │
│     • Tournament Angels                    │
│     • Casual Plague Marines                │
│                                            │
│  ⚡ Actions                                 │
│     • Save current team            Ctrl+S  │
│     • Export team                  Ctrl+E  │
│     • Clear team                   C       │
│     • Toggle dark mode    Ctrl+Shift+D     │
│                                            │
│  🧭 Navigate                               │
│     • Single Team view             Alt+1   │
│     • Game Mode                    Alt+2   │
└────────────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests
```typescript
// tests/unit/keyboardShortcuts.test.ts
- Should register shortcuts
- Should trigger callback on key press
- Should handle platform-specific modifiers (Cmd vs Ctrl)
- Should respect context restrictions
- Should unregister shortcuts on cleanup
- Should prevent default when specified
- Should handle key combinations
- Should ignore shortcuts when inputs are focused
```

### Integration Tests
- Shortcut works across all relevant views
- Shortcuts don't conflict
- Modal closes on Esc in all contexts
- Command palette opens and filters correctly

### Accessibility Tests
- Keyboard shortcuts don't interfere with screen readers
- Shortcuts are discoverable
- All interactive elements reachable by keyboard
- Focus indicators visible

## Implementation Plan

### Phase 1: Infrastructure (Week 1, Day 1-2)
- [ ] Create KeyboardShortcutManager service
- [ ] Implement useKeyboardShortcut hook
- [ ] Add global event listener
- [ ] Handle platform differences (Mac vs Windows/Linux)
- [ ] Write service unit tests

### Phase 2: Core Shortcuts (Week 1, Day 3)
- [ ] Implement global shortcuts (save, export, theme toggle)
- [ ] Implement navigation shortcuts (Alt+1-5)
- [ ] Add Esc to close modals
- [ ] Add Tab navigation improvements

### Phase 3: Help System (Week 1, Day 4)
- [ ] Create KeyboardShortcutsHelp modal
- [ ] Add `?` or `Ctrl+/` to open help
- [ ] Style modal with shortcuts list
- [ ] Add visual hints to buttons

### Phase 4: Command Palette (Week 2)
- [ ] Design command palette UI
- [ ] Implement fuzzy search
- [ ] Add recent commands
- [ ] Add team quick-switch
- [ ] Keyboard navigation in palette

### Phase 5: Polish (Week 2, Day 4-5)
- [ ] Add tooltips with shortcuts
- [ ] Improve focus management
- [ ] Add shortcut customization (future)
- [ ] Integration tests
- [ ] Documentation update

## Dependencies
- Fuzzy search library for command palette: `fuse.js` or `fuzzy`

## Considerations & Edge Cases

### 1. Platform Differences
**Problem**: Mac uses Cmd, Windows/Linux use Ctrl
**Solution**: Detect platform, display correct modifier in UI
```typescript
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modifierKey = isMac ? '⌘' : 'Ctrl';
```

### 2. Input Focus
**Problem**: Shortcuts trigger while typing in input fields
**Solution**: Check if active element is input/textarea, skip shortcuts
```typescript
const activeElement = document.activeElement;
const isInput = activeElement?.tagName === 'INPUT' || 
                activeElement?.tagName === 'TEXTAREA';
if (isInput) return; // Don't trigger shortcut
```

### 3. Browser Conflicts
**Problem**: Shortcuts conflict with browser defaults
**Solution**:
- Avoid Ctrl+T, Ctrl+W, Ctrl+N (browser tabs)
- Use less common combinations
- Allow preventDefault for safe shortcuts

### 4. Shortcut Conflicts
**Problem**: Two features want same shortcut
**Solution**: Priority system, context-specific shortcuts

### 5. Accessibility
**Problem**: Shortcuts might confuse screen reader users
**Solution**:
- Don't interfere with screen reader shortcuts
- Announce shortcut actions to screen readers
- Make shortcuts discoverable through help modal

### 6. Mobile Devices
**Problem**: No keyboard on mobile
**Solution**: Gracefully degrade, shortcuts simply don't work on touch devices

## Future Enhancements
- User-customizable shortcuts
- Vim-style key bindings option
- Shortcut training mode (shows hints first-time)
- Shortcut analytics (most-used shortcuts)
- Multi-key sequences (e.g., `g` then `m` for Game Mode)
- Chord shortcuts (press two keys simultaneously)
- Voice commands integration
- Gamepad support for gaming setups

## Success Metrics
- 30%+ of desktop users use at least one shortcut
- Command palette (Ctrl+K) used 20+ times per session by power users
- Positive feedback on discoverability
- Zero conflicts with critical browser shortcuts
- Accessibility score maintains 100/100

## Related Features
- Command Palette
- Quick Search
- Team Library (quick-switch teams)
- Dark Mode Toggle
