# Cube Timer

A minimalist speedcubing timer web application with WCA-compliant scrambles, rolling statistics, and persistent solve history.

## Features

- **High-Precision Timer**: Millisecond-accurate timing using `performance.now()`
- **WCA Scrambles**: Random 3x3 scramble generation following WCA notation standards
- **Optional Inspection**: 15-second countdown timer (WCA-style) with visual warnings
- **Statistics**: Auto-calculated best, worst, ao5, ao12, and session mean
- **Solve Management**: DNF and +2 penalties, delete solves, clear session
- **Cloud Storage**: Automatic backup to Vercel KV with localStorage fallback
- **Multi-Device Sync**: Sign in with GitHub/Google to sync across devices
- **Offline-First**: Works perfectly offline, syncs when online
- **Responsive Design**: Works seamlessly on desktop and mobile

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to start timing.

## How to Use

1. **Hold SPACE** for 300ms until the timer turns green
2. **Release SPACE** to start the timer (or inspection if enabled)
3. **Press SPACE** or tap anywhere to stop the timer
4. Modify your solve with **DNF**, **+2**, or **Delete** buttons
5. View your statistics and history below

### Keyboard Shortcuts

- `SPACE` (hold): Ready timer
- `SPACE` (release): Start timer/inspection
- `SPACE` (tap during solve): Stop timer

### Settings

Click the settings icon in the top-right to enable/disable the 15-second inspection timer.

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Runtime**: React 19

## Project Structure

```
cube-timer/
├── app/              # Next.js app directory
├── components/       # React components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and types
└── public/           # Static assets
```

See [CLAUDE.md](./CLAUDE.md) for detailed technical documentation.

## Statistics Explanation

All statistics follow WCA (World Cube Association) standards:

- **Best**: Fastest solve in the session
- **Worst**: Slowest solve in the session
- **ao5** (Average of 5): Average of last 5 solves, excluding best and worst
- **ao12** (Average of 12): Average of last 12 solves, excluding best and worst
- **Mean**: Simple average of all valid (non-DNF) solves

## Penalties

- **DNF** (Did Not Finish): Marks solve as invalid, excluded from averages
- **+2**: Adds 2 seconds to solve time (for cube misalignment)
- DNF and +2 are mutually exclusive

## Data Storage

The app uses a **hybrid storage approach**:

- **localStorage** (Primary): All data stored locally for instant access and offline use
- **Vercel KV** (Optional): Cloud backup for cross-device sync

### Without Sign-In
- Data stored only in localStorage (device-specific)
- Works offline
- No account required

### With Sign-In
- Data automatically backed up to cloud
- Sync across all your devices
- Offline-first (changes sync when you're back online)

See [SETUP.md](./SETUP.md) for cloud storage configuration.

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- CSS Grid and Flexbox
- `performance.now()` API

## Development

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling
- ESLint for code quality

### Key Files

- `app/page.tsx`: Main application logic and state management
- `hooks/useTimer.ts`: Timer state machine
- `lib/scrambleGenerator.ts`: WCA-compliant scramble algorithm
- `lib/statistics.ts`: Statistics calculations

## Contributing

This is a personal project, but suggestions and feedback are welcome. Please open an issue to discuss major changes.

## License

ISC License - see [package.json](./package.json) for details

## Acknowledgments

- Scramble generation algorithm follows WCA notation standards
- Inspired by popular speedcubing timers like csTimer and Twisty Timer
- Design philosophy: minimalism and performance first

---

Built with ❤️ for the speedcubing community

**Need technical details?** See [CLAUDE.md](./CLAUDE.md) for comprehensive developer documentation.
