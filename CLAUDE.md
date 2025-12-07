# CLAUDE.md - Developer Documentation

This document provides technical context for AI assistants working on the Cube Timer codebase.

## Project Overview

A minimalist speedcubing timer web application built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. The app generates WCA-style scrambles, tracks solve times with millisecond precision, calculates rolling statistics, and persists data to localStorage.

## Architecture

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS v4 with custom color system
- **State Management**: React hooks (useState, useCallback, useMemo, useRef)
- **Data Persistence**: localStorage API
- **Runtime**: React 19

### Project Structure

```
cube-timer/
├── app/
│   ├── layout.tsx           # Root layout with fonts and metadata
│   ├── page.tsx             # Main timer page with 3-column desktop layout
│   ├── not-found.tsx        # 404 page
│   └── globals.css          # Tailwind config and custom styles
├── components/
│   ├── Timer.tsx            # Timer display with visual states
│   ├── Scramble.tsx         # Scramble display with manual refresh
│   ├── SolveList.tsx        # History list (sidebar on desktop)
│   ├── Statistics.tsx       # Stats panel with conditional visibility
│   ├── SolveActions.tsx     # DNF/+2/Delete buttons
│   ├── Settings.tsx         # Mobile settings dropdown
│   ├── SettingsPanel.tsx    # Desktop inline settings panel
│   ├── ToggleSwitch.tsx     # Reusable toggle component
│   ├── CubeTypeSelector.tsx # Cube type dropdown selector
│   └── StatsVisibilityToggles.tsx # Stats visibility checkboxes
├── hooks/
│   ├── useTimer.ts          # Timer state machine logic
│   ├── useScramble.ts       # Scramble generation (cube type aware)
│   └── useCloudStorage.ts   # Vercel KV cloud storage hook
├── lib/
│   ├── types.ts             # TypeScript interfaces (extended)
│   ├── scrambleGenerator.ts # 3x3 WCA-compliant algorithm
│   ├── scrambleGenerators/
│   │   └── index.ts         # Multi-puzzle scramble generator
│   └── statistics.ts        # WCA statistics (cube type filtered)
└── public/
    └── favicon.ico          # Rubik's cube favicon
```

### Layout Architecture (Desktop: 1024px+)

**3-Column Grid Layout** (`grid-cols-[280px_1fr_320px] gap-6`):

```
┌────────────────────────────────────────────────────────────────────┐
│                           HEADER (Full Width)                       │
├───────────────┬─────────────────────────────────┬──────────────────┤
│  LEFT PANEL   │         CENTER PANEL            │   RIGHT PANEL    │
│  (280px)      │         (Flexible)              │   (320px)        │
│               │                                 │                  │
│ SettingsPanel │ ┌───────────────────────┐       │ SolveList        │
│ (sticky)      │ │ Scramble              │       │ (sticky)         │
│               │ └───────────────────────┘       │                  │
│ • Cube Type   │                                 │ • History        │
│ • Inspection  │ ┌───────────────────────┐       │ • Scrollable     │
│ • Precision   │ │                       │       │ • Max-height     │
│ • Stat Vis.   │ │   TIMER (Hero)        │       │   calc(100vh-    │
│ • Account     │ │                       │       │   280px)         │
│ • Session     │ └───────────────────────┘       │                  │
│               │                                 │                  │
│               │ ┌───────────────────────┐       │                  │
│               │ │ Statistics            │       │                  │
│               │ └───────────────────────┘       │                  │
└───────────────┴─────────────────────────────────┴──────────────────┘
```

**Mobile Layout (<1024px)**: Vertical stack with collapsible sections
- Settings: Dropdown button (top-right)
- Scramble: Always visible
- Timer: Always visible (centered)
- Statistics: Collapsible accordion
- History: Collapsible accordion

### Responsive Strategy

| Breakpoint | Layout | Timer Size | Stats Grid | Side Panels |
|-----------|--------|-----------|-----------|-------------|
| < 640px   | Vertical | text-8rem | 2 cols | Hidden |
| 640-1023px | Vertical | text-10rem | 3 cols | Hidden |
| 1024px+   | 3-column | text-14-18rem | Dynamic | Visible (sticky) |

## Key Implementation Details

### Timer State Machine

**States**: `idle` → `ready` → `inspection` → `running` → `stopped`

- **idle**: Default state, no timer activity
- **ready**: Spacebar held for 300ms, green visual indicator
- **inspection**: Optional 15-second countdown (WCA-style)
- **running**: Timer actively counting (uses `performance.now()`)
- **stopped**: Timer finished, showing result

**Controls** (app/page.tsx:140-224):
- Hold SPACE for 300ms → `ready` state
- Release SPACE from `ready` → start inspection (if enabled) or timer
- Press SPACE or tap anywhere during `running` → stop timer
- Keyboard events ignored when typing in inputs

### Scramble Generation

**3x3 Algorithm** (lib/scrambleGenerator.ts):
- Generates 20 random moves for 3x3 cube
- Moves: R, L, U, D, F, B
- Modifiers: '', ' (prime), 2 (double)
- Prevents consecutive same-face moves (e.g., R R')
- Prevents three consecutive same-axis moves (e.g., R L R)

**Move Axes**:
- x-axis: R, L
- y-axis: U, D
- z-axis: F, B

**Multi-Puzzle Support** (lib/scrambleGenerators/index.ts):
- `generateScrambleForCubeType(type: CubeType): string`
- Supported cube types: 2x2, 3x3, 4x4, 5x5, 6x6, 7x7, Pyraminx, Megaminx, Skewb, Clock, Square-1, OH, BLD
- Currently: 3x3 and 2x2 have proper implementations, others use placeholder scrambles
- Future: Add WCA-compliant scrambles for all puzzle types

### Statistics Calculation (lib/statistics.ts)

All statistics follow WCA standards:

**Average of 5 (ao5)**:
- Takes last 5 solves
- Removes best and worst times
- Averages remaining 3 times
- Returns null if < 5 solves or if middle 3 contain DNF

**Average of 12 (ao12)**:
- Takes last 12 solves
- Removes best and worst times
- Averages remaining 10 times
- Returns null if < 12 solves or if middle 10 contain DNF

**Session Mean**:
- Simple average of all valid (non-DNF) times

**Effective Time Calculation**:
- DNF solves = `Infinity` (excluded from averages)
- +2 penalty adds 2000ms to time
- Time stored in milliseconds

**Cube Type Filtering**:
- `calculateStatistics(solves, cubeType?)` accepts optional cube type filter
- Statistics calculated only for solves matching the current cube type
- Backwards compatible: Solves without `cubeType` default to '3x3'

### Data Model (lib/types.ts)

```typescript
type CubeType =
  | '2x2' | '3x3' | '4x4' | '5x5' | '6x6' | '7x7'
  | 'pyraminx' | 'megaminx' | 'skewb' | 'clock' | 'sq1'
  | 'oh' | 'bld';

interface VisibleStats {
  best: boolean;
  worst: boolean;
  ao5: boolean;
  ao12: boolean;
  mean: boolean;
}

interface Solve {
  id: string;          // UUID
  time: number;        // milliseconds (raw time, no penalty)
  scramble: string;    // WCA notation
  date: string;        // ISO 8601 timestamp
  dnf: boolean;        // Did Not Finish flag
  plusTwo: boolean;    // +2 penalty flag (mutually exclusive with DNF)
  cubeType: CubeType;  // Puzzle type for this solve
}

interface Settings {
  inspectionEnabled: boolean;   // Toggle 15s inspection timer
  inspectionTime: number;       // Default: 15 seconds
  cubeType: CubeType;           // Current puzzle type
  showMilliseconds: boolean;    // Timer precision toggle
  visibleStats: VisibleStats;   // Which stats to display
  theme?: 'dark' | 'light' | 'auto'; // Theme preference (placeholder)
}
```

### Custom Hooks

**useTimer** (hooks/useTimer.ts):
- Manages timer state machine
- High-precision timing with `performance.now()`
- Handles inspection countdown
- Returns current time, state, and control functions

**useScramble** (hooks/useScramble.ts):
- Client-side scramble generation (avoids hydration mismatch)
- Tracks loading state for SSR compatibility
- Manual regeneration via `generateNewScramble()`

**useLocalStorage** (hooks/useLocalStorage.ts):
- Syncs React state with localStorage
- Handles JSON serialization/deserialization
- Returns tuple: `[value, setValue, clearValue]`

### Styling System

**Custom Colors** (app/globals.css):
```css
--cube-black: #0a0a0a
--cube-white: #f5f5f5
--cube-gray: #1a1a1a
--cube-cement: #666666
--cube-yellow: #ffd500
--cube-red: #e63946
--cube-blue: #1d3557
```

**Design Patterns**:
- Monospace font for timer (JetBrains Mono)
- "Brutal" display font for header (Inter with extreme tracking)
- Grid background pattern with CSS background-image
- Gradient accents and geometric decorative elements
- Responsive breakpoints: sm (640px), md (768px)

### Key Features

1. **Inspection Timer** (Settings.tsx, useTimer.ts):
   - Optional 15-second countdown before solve
   - Visual warning at 8 seconds (yellow), 12 seconds (red)
   - Hold space during inspection to ready timer

2. **Solve Modifications**:
   - DNF and +2 are mutually exclusive
   - Applying DNF clears +2, vice versa prohibited
   - Each solve has inline action buttons
   - Last solve has dedicated action bar below timer

3. **Session Management**:
   - All solves stored in single session
   - Clear session button with confirmation dialog
   - No multi-session support (out of MVP scope)

4. **Responsive Design**:
   - Mobile-first approach
   - Touch-friendly tap-to-stop
   - Click propagation stopped on interactive elements
   - Keyboard shortcuts work on desktop

## Development Guidelines

### Code Style
- Functional components with hooks
- TypeScript strict mode enabled
- Use `useCallback` for event handlers to prevent re-renders
- Use `useMemo` for expensive calculations (statistics)
- Prefer named exports over default exports (except page.tsx)

### State Management Patterns
- Lift state to page.tsx when shared across components
- Keep component-specific state local
- Use refs for values that don't trigger re-renders (holdTimeout, scrambleRef)
- Avoid prop drilling beyond 2 levels

### Testing Considerations
- Timer accuracy depends on `performance.now()` precision
- Scramble generation is deterministic given same random seed
- Statistics calculations match WCA formulas exactly
- localStorage persists across page refreshes

### Performance Optimizations
- Scramble generated client-side to avoid hydration mismatch
- Statistics memoized to prevent recalculation on every render
- Event listeners cleaned up in useEffect returns
- Click handlers use `stopPropagation` to prevent unwanted triggers

## Known Limitations

1. **Inspection Timer**: Currently 15 seconds only, not configurable in UI
2. **Single Session**: No support for multiple named sessions
3. **No Export**: Cannot export/import solve history
4. **3x3 Only**: No support for other puzzle types
5. **Local Only**: No cloud sync or user accounts

## Common Tasks

### Adding a New Statistic
1. Update `Statistics` interface in `lib/types.ts`
2. Add calculation function in `lib/statistics.ts`
3. Update `calculateStatistics()` to return new value
4. Display in `components/Statistics.tsx`

### Adding a New Timer State
1. Update `TimerState` type in `lib/types.ts`
2. Add state transitions in `hooks/useTimer.ts`
3. Update visual styles in `components/Timer.tsx`
4. Handle new state in keyboard handlers (`app/page.tsx`)

### Modifying Scramble Algorithm
1. Edit `generateScramble()` in `lib/scrambleGenerator.ts`
2. Adjust `MOVES`, `MODIFIERS`, or axis logic
3. Test for WCA compliance and randomness

## File-Specific Notes

### app/page.tsx:140-216
Complex keyboard event handling with spacebar hold detection. Be careful with timing dependencies and cleanup. The 300ms hold timeout is critical for UX.

### lib/statistics.ts:5-40
WCA-compliant average calculations. Removing best/worst is mandatory. DNF solves treated as Infinity for correct sorting behavior.

### components/Timer.tsx
Text sizing uses responsive classes (text-7xl → text-9xl). State determines text color (green = ready, white = idle/stopped, yellow = running).

### components/ToggleSwitch.tsx
Reusable toggle component with proper visual states. OFF state: black background with cement border and gray handle on left. ON state: green background with white handle translated 26px to the right. Uses overflow-hidden to prevent handle from escaping container bounds.

### components/ThemeToggle.tsx
Three-button toggle component for theme selection (DARK/LIGHT/AUTO). Active button shows white background with black text, inactive buttons have transparent background with gray text and border. Integrated in both desktop and mobile settings panels.

### hooks/useTheme.ts
Custom hook that applies theme classes to document root and handles system preference detection. Listens to system color scheme changes when in AUTO mode. Applies 'light-theme' class for light mode, no class for dark mode (default).

### hooks/useLocalStorage.ts
Handles SSR safety by checking for `window` object. Initial state must be serializable to JSON.

## Environment Variables

None currently used. All configuration in-code or via Settings UI.

## Build & Deployment

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

**Build Output**: Static and dynamic routes. App Router generates optimized bundles with automatic code splitting.

## Recent Changes

- **Dec 2025**: **Theme System** - Added dark/light/auto theme toggle with system preference support
- **Dec 2025**: Fixed toggle switch visual states and handle positioning
- **Dec 2025**: **Major Layout Redesign** - 3-column desktop layout (settings | timer | history)
- **Dec 2025**: **Multi-Puzzle Support** - Added 13 cube types (2x2-7x7, WCA puzzles, variations)
- **Dec 2025**: **Display Customization** - Stats visibility toggles, precision settings
- **Dec 2025**: **Mobile Enhancements** - Collapsible sections for statistics and history
- **Dec 2025**: Added optional 15-second WCA-style inspection timer
- **Dec 2025**: Added Rubik's cube favicon with proper metadata
- **Dec 2025**: Fixed Tailwind v4 PostCSS configuration
- **Dec 2025**: Fixed scramble hydration mismatch (client-side generation)
- **Dec 2025**: Initial MVP implementation with timer, scrambles, stats, and history

## Future Enhancements

### Immediate Next Steps
- Implement WCA-compliant scrambles for all puzzle types (currently only 3x3 and 2x2)
- Timer precision display formatting (currently just stores setting)

### Longer Term
- Multi-session support with named sessions per cube type
- Export/import solve data (CSV, JSON)
- Virtual cube visualization
- Training modes (F2L, OLL, PLL)
- Solve analytics and graphs
- Advanced statistics (rolling ao100, session graphs)

## Contributing

When modifying this codebase:
1. Maintain TypeScript strict type safety
2. Follow existing component patterns
3. Update this document if architecture changes
4. Test timer precision and statistics accuracy
5. Ensure localStorage compatibility across browsers
6. Verify responsive design on mobile and desktop

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Maintainer**: See package.json
