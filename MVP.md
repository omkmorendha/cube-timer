# Cube Timer MVP - Product Requirements Document

## Overview

A minimalist speedcubing timer web application built with Next.js that generates scrambles, tracks solve times, and stores data locally. Designed for cubers who want a clean, fast, and reliable timing experience.

---

## Core Features

### 1. Timer
- **Spacebar activation**: Hold spacebar to ready (turns green), release to start
- **Tap/click to stop**: Any input stops the timer
- **Precision**: Display to milliseconds (e.g., 12.345)
- **Visual states**: Idle → Ready (green) → Running → Stopped

### 2. Scramble Generator
- Generate random 3x3 scrambles (20 moves, WCA-style notation)
- Moves: R, L, U, D, F, B with modifiers (', 2)
- New scramble auto-generated after each solve
- Manual "New Scramble" button available

### 3. Solve Modifiers
- **DNF (Did Not Finish)**: Marks solve as invalid, excluded from averages
- **+2 Penalty**: Adds 2 seconds for cube misalignment
- **Delete**: Remove a solve from history
- Toggle buttons appear after each solve

### 4. Statistics
- **Current session**:
  - Best single
  - Worst single
  - Average of 5 (ao5) - current rolling average
  - Average of 12 (ao12) - current rolling average
  - Session mean
- Averages exclude best and worst times (WCA standard)

### 5. Solve History
- List of all solves with: time, scramble, date, penalties
- Stored in localStorage
- Clear session option
- Click to expand and see scramble used

---

## Technical Architecture

```
cube-timer/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main timer page
│   └── globals.css         # Tailwind styles
├── components/
│   ├── Timer.tsx           # Timer display & logic
│   ├── Scramble.tsx        # Scramble display
│   ├── SolveList.tsx       # History list
│   ├── Statistics.tsx      # Stats panel
│   └── SolveActions.tsx    # DNF/+2/Delete buttons
├── hooks/
│   ├── useTimer.ts         # Timer state management
│   ├── useScramble.ts      # Scramble generation
│   └── useLocalStorage.ts  # Persist solves
├── lib/
│   ├── scrambleGenerator.ts # WCA-style scramble logic
│   ├── statistics.ts        # ao5, ao12 calculations
│   └── types.ts             # TypeScript interfaces
└── package.json
```

---

## Data Model

```typescript
interface Solve {
  id: string;
  time: number;          // milliseconds
  scramble: string;
  date: string;          // ISO timestamp
  dnf: boolean;
  plusTwo: boolean;
}

interface Session {
  solves: Solve[];
  createdAt: string;
}
```

---

## User Flow

```
1. User lands on page
   └── See: Large timer (0.00), scramble above, empty stats

2. User holds spacebar
   └── Timer turns green (ready state)

3. User releases spacebar
   └── Timer starts counting

4. User presses any key / taps screen
   └── Timer stops, time recorded
   └── Action buttons appear: [DNF] [+2] [Delete]
   └── New scramble generated

5. User can modify solve
   └── Click DNF → time shows "DNF"
   └── Click +2 → time shows "12.34+2" (14.34 effective)

6. Stats update automatically
   └── ao5, ao12, best, session mean
```

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  R U2 F' D R2 B U' L2 D F2 R' U2 ...    │  ← Scramble
├─────────────────────────────────────────┤
│                                         │
│              12.345                     │  ← Timer (large, centered)
│                                         │
│         [DNF] [+2] [Delete]             │  ← Actions (after solve)
├─────────────────────────────────────────┤
│  Best: 9.82  │  ao5: 12.45  │  ao12: -  │  ← Stats bar
├─────────────────────────────────────────┤
│  1. 12.34    R U2 F' D...    [DNF][+2]  │  ← Solve history
│  2. 11.87    L' B2 U R...               │
│  3. DNF      F R2 D' U...               │
│  ...                                    │
└─────────────────────────────────────────┘
```

---

## Key Implementation Details

### Timer Logic
- Use `performance.now()` for high precision
- State machine: `idle` → `ready` → `running` → `stopped`
- Prevent spacebar scroll with `e.preventDefault()`

### Scramble Generation
- Avoid consecutive same-face moves (R R')
- Avoid three consecutive same-axis moves (R L R)
- 20 random moves for 3x3

### Statistics Calculation
```typescript
// ao5: best and worst excluded, average remaining 3
function calculateAo5(solves: Solve[]): number | null {
  if (solves.length < 5) return null;
  const last5 = solves.slice(-5);
  const times = last5.map(s => s.dnf ? Infinity : getEffectiveTime(s));
  const sorted = [...times].sort((a, b) => a - b);
  const middle3 = sorted.slice(1, 4);
  if (middle3.includes(Infinity)) return null; // DNF average
  return middle3.reduce((a, b) => a + b) / 3;
}
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State | React hooks + Context |
| Storage | localStorage API |
| Language | TypeScript |

---

## MVP Scope Boundaries

### In Scope ✅
- Single cube type (3x3)
- Keyboard timer controls
- DNF and +2 penalties
- Local storage persistence
- Basic statistics (ao5, ao12, best, mean)
- Responsive design

### Out of Scope (Future) ❌
- Multiple cube types (2x2, 4x4, etc.)
- User accounts / cloud sync
- Inspection time (15 sec countdown)
- Session management (multiple sessions)
- Export/import data
- Themes/customization
- Virtual cube visualization

---

## Success Metrics

- Timer accuracy within 1ms of actual time
- Solves persist across browser refresh
- Statistics calculate correctly per WCA standards
- Works on desktop and mobile browsers

---
