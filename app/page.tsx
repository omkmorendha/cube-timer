'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Timer } from '@/components/Timer';
import { Scramble } from '@/components/Scramble';
import { SolveActions } from '@/components/SolveActions';
import { Statistics } from '@/components/Statistics';
import { SolveList } from '@/components/SolveList';
import { Settings } from '@/components/Settings';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useTimer } from '@/hooks/useTimer';
import { useScramble } from '@/hooks/useScramble';
import { useCloudStorage } from '@/hooks/useCloudStorage';
import { useTheme } from '@/hooks/useTheme';
import { calculateStatistics } from '@/lib/statistics';
import { Solve, Settings as SettingsType } from '@/lib/types';

const DEFAULT_SETTINGS: SettingsType = {
  inspectionEnabled: false,
  inspectionTime: 15,
  cubeType: '3x3',
  showMilliseconds: true,
  visibleStats: {
    best: true,
    worst: true,
    ao5: true,
    ao12: true,
    mean: true,
  },
  theme: 'dark',
};

export default function Home() {
  const [settings, setSettings, clearSettings, settingsSyncStatus] = useCloudStorage<SettingsType>(
    'cube-timer-settings',
    DEFAULT_SETTINGS
  );

  const {
    time,
    inspectionTime,
    state,
    setReady,
    startInspection,
    startTimer,
    stopTimer,
    resetTimer,
    cancelReady,
  } = useTimer({
    inspectionEnabled: settings.inspectionEnabled,
    inspectionTime: settings.inspectionTime,
  });

  const { scramble, generateNewScramble, isLoaded: scrambleLoaded } = useScramble(settings.cubeType);
  const [solves, setSolves, clearSolves, solvesSyncStatus] = useCloudStorage<Solve[]>(
    'cube-timer-solves',
    []
  );

  // Apply theme
  useTheme(settings.theme || 'dark');

  const lastSolve = solves.length > 0 ? solves[solves.length - 1] : null;
  const stats = useMemo(() => calculateStatistics(solves, settings.cubeType), [solves, settings.cubeType]);

  // Track if space is held
  const spaceHeldRef = useRef(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track touch/click hold for mobile
  const touchHeldRef = useRef(false);
  const touchHoldTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile collapsible section state
  const [statsExpanded, setStatsExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Update settings helper
  const updateSettings = useCallback((partial: Partial<SettingsType>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, [setSettings]);

  // Toggle inspection setting (for mobile Settings component)
  const toggleInspection = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, inspectionEnabled: enabled }));
  }, [setSettings]);

  // Save solve after timer stops
  const saveSolve = useCallback(
    (finalTime: number, currentScramble: string) => {
      const newSolve: Solve = {
        id: crypto.randomUUID(),
        time: finalTime,
        scramble: currentScramble,
        date: new Date().toISOString(),
        dnf: false,
        plusTwo: false,
        cubeType: settings.cubeType,
      };
      setSolves((prev) => [...prev, newSolve]);
      generateNewScramble();
    },
    [setSolves, generateNewScramble, settings.cubeType]
  );

  // Toggle DNF for last solve
  const toggleDnfLastSolve = useCallback(() => {
    if (!lastSolve) return;
    setSolves((prev) =>
      prev.map((s) => (s.id === lastSolve.id ? { ...s, dnf: !s.dnf, plusTwo: false } : s))
    );
  }, [lastSolve, setSolves]);

  // Toggle +2 for last solve
  const togglePlusTwoLastSolve = useCallback(() => {
    if (!lastSolve || lastSolve.dnf) return;
    setSolves((prev) =>
      prev.map((s) => (s.id === lastSolve.id ? { ...s, plusTwo: !s.plusTwo } : s))
    );
  }, [lastSolve, setSolves]);

  // Delete last solve
  const deleteLastSolve = useCallback(() => {
    if (!lastSolve) return;
    setSolves((prev) => prev.filter((s) => s.id !== lastSolve.id));
  }, [lastSolve, setSolves]);

  // Toggle DNF for any solve
  const toggleDnf = useCallback(
    (id: string) => {
      setSolves((prev) =>
        prev.map((s) => (s.id === id ? { ...s, dnf: !s.dnf, plusTwo: false } : s))
      );
    },
    [setSolves]
  );

  // Toggle +2 for any solve
  const togglePlusTwo = useCallback(
    (id: string) => {
      setSolves((prev) =>
        prev.map((s) => {
          if (s.id === id && !s.dnf) {
            return { ...s, plusTwo: !s.plusTwo };
          }
          return s;
        })
      );
    },
    [setSolves]
  );

  // Delete any solve
  const deleteSolve = useCallback(
    (id: string) => {
      setSolves((prev) => prev.filter((s) => s.id !== id));
    },
    [setSolves]
  );

  // Clear all solves
  const clearSession = useCallback(() => {
    if (window.confirm('Clear all solves? This cannot be undone.')) {
      clearSolves();
    }
  }, [clearSolves]);

  // Store scramble ref for saving
  const scrambleRef = useRef(scramble);
  useEffect(() => {
    scrambleRef.current = scramble;
  }, [scramble]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();

        // If timer is running, stop it
        if (state === 'running') {
          const finalTime = stopTimer();
          saveSolve(finalTime, scrambleRef.current);
          return;
        }

        // If space already held, ignore
        if (spaceHeldRef.current) return;

        spaceHeldRef.current = true;

        // During inspection, holding space prepares for timer start
        if (state === 'inspection') {
          holdTimeoutRef.current = setTimeout(() => {
            setReady();
          }, 300);
          return;
        }

        // Start hold timer - need to hold for 300ms to be ready
        if (state === 'idle' || state === 'stopped') {
          holdTimeoutRef.current = setTimeout(() => {
            setReady();
          }, 300);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();

        // Clear hold timeout if released early
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current);
          holdTimeoutRef.current = null;
        }

        // If ready and inspection is enabled, start inspection
        // If ready and no inspection, start timer directly
        if (state === 'ready') {
          if (settings.inspectionEnabled) {
            startInspection();
          } else {
            startTimer();
          }
        } else if (state === 'idle') {
          // Short press in idle - do nothing special
          cancelReady();
        }

        spaceHeldRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, [state, settings.inspectionEnabled, setReady, startInspection, startTimer, stopTimer, saveSolve, cancelReady]);

  // Touch/click handlers for timer control
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // If timer is running, stop it immediately
    if (state === 'running') {
      const finalTime = stopTimer();
      saveSolve(finalTime, scrambleRef.current);
      return;
    }

    // If already holding, ignore
    if (touchHeldRef.current) return;

    touchHeldRef.current = true;

    // During inspection, holding prepares for timer start
    if (state === 'inspection') {
      touchHoldTimeoutRef.current = setTimeout(() => {
        setReady();
      }, 300);
      return;
    }

    // Start hold timer - need to hold for 300ms to be ready
    if (state === 'idle' || state === 'stopped') {
      touchHoldTimeoutRef.current = setTimeout(() => {
        setReady();
      }, 300);
    }
  }, [state, stopTimer, saveSolve, setReady]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Clear hold timeout if released early
    if (touchHoldTimeoutRef.current) {
      clearTimeout(touchHoldTimeoutRef.current);
      touchHoldTimeoutRef.current = null;
    }

    // If ready and inspection is enabled, start inspection
    // If ready and no inspection, start timer directly
    if (state === 'ready') {
      if (settings.inspectionEnabled) {
        startInspection();
      } else {
        startTimer();
      }
    } else if (state === 'idle') {
      // Short press in idle - do nothing special
      cancelReady();
    }

    touchHeldRef.current = false;
  }, [state, settings.inspectionEnabled, startInspection, startTimer, cancelReady]);

  // Cleanup touch hold timeout on unmount
  useEffect(() => {
    return () => {
      if (touchHoldTimeoutRef.current) {
        clearTimeout(touchHoldTimeoutRef.current);
      }
    };
  }, []);

  // Collapsible section component for mobile
  const CollapsibleSection = ({
    title,
    isExpanded,
    onToggle,
    children,
  }: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div className="border-2 border-cube-gray bg-cube-black/30">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="w-full p-4 flex items-center justify-between font-brutal text-sm tracking-[0.3em] text-cube-cement hover:text-cube-yellow transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && <div className="p-4 pt-0">{children}</div>}
    </div>
  );

  return (
    <main
      className="min-h-screen bg-cube-black bg-grid relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Large diagonal accent */}
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-full bg-gradient-to-br from-cube-yellow/5 to-transparent rotate-12" />
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-cube-yellow/10" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-cube-yellow/10" />
        {/* Floating cube decoration */}
        <div className="absolute top-1/4 left-8 w-4 h-4 bg-cube-red/20 rotate-45" />
        <div className="absolute bottom-1/3 right-12 w-6 h-6 border-2 border-cube-blue/20 rotate-12" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-[1920px]">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="w-10 lg:hidden" /> {/* Spacer for centering on mobile */}
          <div className="text-center lg:flex-1">
            <h1 className="font-brutal text-2xl sm:text-3xl tracking-[0.5em] text-cube-white mb-2">
              CUBE<span className="text-cube-yellow">TIMER</span>
            </h1>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cube-yellow to-transparent" />
          </div>
          {/* Mobile settings button (hidden on desktop) */}
          <div className="lg:hidden" onClick={(e) => e.stopPropagation()}>
            <Settings
              inspectionEnabled={settings.inspectionEnabled}
              onToggleInspection={toggleInspection}
              theme={settings.theme || 'dark'}
              onThemeChange={(theme) => updateSettings({ theme })}
              syncStatus={solvesSyncStatus}
            />
          </div>
        </header>

        {/* Desktop 3-Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-[280px_1fr_320px] lg:gap-6">
          {/* Left Panel - Settings */}
          <aside className="space-y-6">
            <SettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              onClearSession={clearSession}
              syncStatus={solvesSyncStatus}
            />
          </aside>

          {/* Center Panel - Timer + Core UI */}
          <div className="flex flex-col space-y-8">
            <div onClick={(e) => e.stopPropagation()}>
              <Scramble scramble={scramble} onNewScramble={generateNewScramble} isLoading={!scrambleLoaded} />
            </div>

            <div className="flex-1 flex flex-col justify-center py-12">
              <Timer
                time={time}
                inspectionTime={inspectionTime}
                state={state}
                inspectionEnabled={settings.inspectionEnabled}
              />

              <div className="mt-8" onClick={(e) => e.stopPropagation()}>
                <SolveActions
                  onDnf={toggleDnfLastSolve}
                  onPlusTwo={togglePlusTwoLastSolve}
                  onDelete={deleteLastSolve}
                  isDnf={lastSolve?.dnf ?? false}
                  isPlusTwo={lastSolve?.plusTwo ?? false}
                  visible={state === 'stopped' && lastSolve !== null}
                />
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <Statistics stats={stats} visibleStats={settings.visibleStats} />
            </div>
          </div>

          {/* Right Panel - History */}
          <aside>
            <div onClick={(e) => e.stopPropagation()}>
              <SolveList
                solves={solves}
                onToggleDnf={toggleDnf}
                onTogglePlusTwo={togglePlusTwo}
                onDelete={deleteSolve}
                onClearSession={clearSession}
              />
            </div>
          </aside>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-4">
          {/* Scramble - always visible */}
          <section onClick={(e) => e.stopPropagation()}>
            <Scramble scramble={scramble} onNewScramble={generateNewScramble} isLoading={!scrambleLoaded} />
          </section>

          {/* Timer - always visible */}
          <section className="py-12 sm:py-16 md:py-24 flex flex-col items-center justify-center">
            <Timer
              time={time}
              inspectionTime={inspectionTime}
              state={state}
              inspectionEnabled={settings.inspectionEnabled}
            />

            <div className="mt-8" onClick={(e) => e.stopPropagation()}>
              <SolveActions
                onDnf={toggleDnfLastSolve}
                onPlusTwo={togglePlusTwoLastSolve}
                onDelete={deleteLastSolve}
                isDnf={lastSolve?.dnf ?? false}
                isPlusTwo={lastSolve?.plusTwo ?? false}
                visible={state === 'stopped' && lastSolve !== null}
              />
            </div>
          </section>

          {/* Collapsible Statistics */}
          <div onClick={(e) => e.stopPropagation()}>
            <CollapsibleSection
              title="STATISTICS"
              isExpanded={statsExpanded}
              onToggle={() => setStatsExpanded(!statsExpanded)}
            >
              <Statistics stats={stats} visibleStats={settings.visibleStats} />
            </CollapsibleSection>
          </div>

          {/* Collapsible History */}
          <div onClick={(e) => e.stopPropagation()}>
            <CollapsibleSection
              title="HISTORY"
              isExpanded={historyExpanded}
              onToggle={() => setHistoryExpanded(!historyExpanded)}
            >
              <SolveList
                solves={solves}
                onToggleDnf={toggleDnf}
                onTogglePlusTwo={togglePlusTwo}
                onDelete={deleteSolve}
                onClearSession={clearSession}
              />
            </CollapsibleSection>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="h-px w-full bg-cube-gray/30 mb-4" />
          <p className="font-mono text-xs text-cube-cement hidden sm:block">
            Hold <kbd className="px-2 py-0.5 bg-cube-gray text-cube-white">SPACE</kbd> or click to ready,
            release to start{settings.inspectionEnabled ? ' inspection' : ''} • Tap anywhere to stop
          </p>
          <p className="font-mono text-xs text-cube-cement sm:hidden">
            Hold screen to ready, release to start{settings.inspectionEnabled ? ' inspection' : ''} • Tap to stop
          </p>
          <p className="font-mono text-xs text-cube-cement mt-4">
            <a
              href="https://github.com/omkmorendha/cube-timer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cube-yellow hover:text-cube-white transition-colors underline"
              onClick={(e) => e.stopPropagation()}
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
