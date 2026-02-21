# Feature Spec: Dark Mode Toggle

## Overview
Add a dark mode theme toggle to improve user experience in low-light conditions and reduce eye strain during extended play sessions.

## Priority
**Medium** - Quality of life improvement, high user demand

## User Stories
1. As a player, I want to enable dark mode so I can use the app comfortably at night
2. As a player, I want the app to remember my theme preference across sessions
3. As a player, I want the app to automatically use my system's dark mode preference
4. As a tournament organizer hosting evening events, I want all displays to use dark mode

## Requirements

### Functional Requirements

#### Theme Toggle
1. **Toggle Location**: Add theme toggle button to app header (top-right corner)
2. **Toggle States**: 
   - Light Mode
   - Dark Mode  
   - Auto (follow system preference)
3. **Persistence**: Save preference to localStorage
4. **Default Behavior**: Auto mode (respects `prefers-color-scheme` media query)

#### Visual Design
1. **Light Mode Colors**:
   - Background: `#f5f5f5`
   - Surface: `#ffffff`
   - Primary: `#d84315` (orange)
   - Text: `#1a1a1a`
2. **Dark Mode Colors**:
   - Background: `#0a0a0a`
   - Surface: `#1a1a1a`
   - Primary: `#ff6b3d` (lighter orange)
   - Text: `#e0e0e0`
3. **Smooth Transition**: 200ms ease-in-out transition between themes

#### System Preference Detection
1. Listen to `prefers-color-scheme` media query
2. Update theme when system preference changes
3. Allow manual override of system preference

### Non-Functional Requirements
1. **Performance**: Theme switch should be instant (< 50ms)
2. **Accessibility**: 
   - WCAG AA contrast ratios in both modes
   - Clear visual indicators for current theme
   - Keyboard accessible toggle (Tab + Enter/Space)
3. **Browser Support**: All modern browsers (Chrome 76+, Firefox 67+, Safari 12.1+)

## Technical Design

### Theme System Architecture
```typescript
// src/theme/ThemeProvider.tsx
type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextValue {
  mode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Implementation
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### CSS Variables Approach
```css
/* src/theme/themes.css */
:root {
  --theme-background: #f5f5f5;
  --theme-surface: #ffffff;
  --theme-primary: #d84315;
  --theme-text-primary: #1a1a1a;
  --theme-text-secondary: #666666;
  --theme-border: #e0e0e0;
  --theme-shadow: rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  --theme-background: #0a0a0a;
  --theme-surface: #1a1a1a;
  --theme-primary: #ff6b3d;
  --theme-text-primary: #e0e0e0;
  --theme-text-secondary: #999999;
  --theme-border: #333333;
  --theme-shadow: rgba(0, 0, 0, 0.5);
}

* {
  transition: background-color 0.2s ease-in-out, 
              color 0.2s ease-in-out,
              border-color 0.2s ease-in-out;
}
```

### Theme Toggle Component
```typescript
// src/components/common/ThemeToggle.tsx
interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, effectiveTheme, setMode } = useTheme();
  
  const cycleTheme = () => {
    const modes: ThemeMode[] = ['auto', 'light', 'dark'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
  };

  return (
    <button
      onClick={cycleTheme}
      className={className}
      aria-label={`Current theme: ${mode}. Click to cycle.`}
      title={`Theme: ${mode} (${effectiveTheme})`}
    >
      {/* Icon based on current mode */}
    </button>
  );
}
```

### Storage Service
```typescript
// src/services/themeStorage.ts
const THEME_STORAGE_KEY = 'kill-team-theme-mode';

export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.error('Failed to save theme mode:', error);
  }
}

export function loadThemeMode(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
    return null;
  } catch (error) {
    console.error('Failed to load theme mode:', error);
    return null;
  }
}
```

## UI/UX Design

### Toggle Button Design
```
┌─────────────────────────────────────┐
│  Kill Team Dataslate        [🌙] ← │  Theme Toggle
│                                     │
│  [Single Team] [Game Mode] ...     │
└─────────────────────────────────────┘

Icons:
- Auto: 🌗 (half moon)
- Light: ☀️ (sun)
- Dark: 🌙 (moon)
```

### Toggle Behavior
- **Click**: Cycles through Auto → Light → Dark → Auto
- **Shows tooltip**: "Theme: Auto (Dark)" or "Theme: Light"
- **Smooth animation**: Fade between icons, no jarring transitions

### Accessibility
- Keyboard navigable with Tab
- Activatable with Enter or Space
- Announces theme change to screen readers
- High contrast in both modes

## Testing Strategy

### Unit Tests
```typescript
// tests/unit/ThemeProvider.test.tsx
- Should default to 'auto' mode
- Should respect system preference in auto mode
- Should persist mode to localStorage
- Should load saved mode on mount
- Should update when system preference changes
- Should allow manual override of system preference
```

### Visual Regression Tests
- Screenshot comparison of key pages in both themes
- Ensure all components render correctly in dark mode
- Verify contrast ratios meet WCAG AA standards

### Manual Testing Checklist
- [ ] Toggle works in all browsers
- [ ] Theme persists after page reload
- [ ] System preference detection works
- [ ] All text is readable in both modes
- [ ] All interactive elements are visible
- [ ] Images/icons look good in both modes
- [ ] Print view works in both modes
- [ ] No flash of unstyled content on load

## Implementation Plan

### Phase 1: Infrastructure (Week 1, Day 1-2)
- [ ] Create theme system with CSS variables
- [ ] Implement ThemeProvider context
- [ ] Add theme detection hook
- [ ] Create storage service for theme preference

### Phase 2: Component & Integration (Week 1, Day 3-4)
- [ ] Design and implement ThemeToggle component
- [ ] Add toggle to app header
- [ ] Update all existing CSS to use theme variables
- [ ] Test theme switching across all views

### Phase 3: Polish & Testing (Week 1, Day 5)
- [ ] Add smooth transitions
- [ ] Implement keyboard shortcuts (Ctrl+Shift+D for dark mode toggle)
- [ ] Write unit tests
- [ ] Perform accessibility audit
- [ ] Update documentation

## Dependencies
- None - pure CSS and React implementation

## Considerations & Edge Cases

### 1. FOUC (Flash of Unstyled Content)
**Problem**: Theme might flash on page load
**Solution**: Inject inline script in HTML head to set theme before render
```html
<script>
  (function() {
    const theme = localStorage.getItem('kill-team-theme-mode') || 'auto';
    if (theme === 'dark' || (theme === 'auto' && 
        window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
</script>
```

### 2. Image Assets
**Problem**: Some images may not look good in dark mode
**Solution**:
- Use SVG icons with `currentColor` fill
- Add filter CSS for images that need inversion
- Provide dark-mode specific image variants

### 3. Print Stylesheet
**Problem**: Dark mode shouldn't apply to printed output
**Solution**: Use `@media print` to override dark theme with light colors

### 4. Third-Party Components
**Problem**: External components may not respect theme
**Solution**: Wrap in containers with theme-specific overrides

### 5. Performance
**Problem**: Theme switch might cause layout thrashing
**Solution**: Use CSS variables which are GPU-accelerated

## Migration Strategy

### Update Existing Styles
1. **Audit all CSS files**: Identify hardcoded colors
2. **Create variable mapping**: Map each color to theme variable
3. **Update incrementally**: One component at a time
4. **Test each migration**: Ensure no visual regressions

### Rollback Plan
- Keep old CSS as comments during migration
- Feature flag to disable dark mode if issues arise
- Document manual override: Add `?theme=light` query param

## Future Enhancements
- Custom color schemes (user-defined)
- High contrast mode for accessibility
- Per-faction themes (Space Marines = blue, Death Guard = green)
- Scheduled theme switching (auto-dark after 8 PM)
- Theme sync across devices (with cloud storage)

## Success Metrics
- 40%+ of users enable dark mode
- < 1% report theme-related bugs
- Accessibility score maintains 100/100
- No performance degradation from theme system
- Positive user feedback on dark mode quality

## Related Features
- Accessibility improvements
- Custom color palettes
- High contrast mode
- Faction-themed UI
