'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Timer } from '@/components/Timer';
import { Scramble } from '@/components/Scramble';
import { SolveActions } from '@/components/SolveActions';
import { Statistics } from '@/components/Statistics';
import { SolveList } from '@/components/SolveList';
import { Settings } from '@/components/Settings';
import { useTimer } from '@/hooks/useTimer';
import { useScramble } from '@/hooks/useScramble';
import { useCloudStorage } from '@/hooks/useCloudStorage';
import { calculateStatistics } from '@/lib/statistics';
import { Solve, Settings as SettingsType } from '@/lib/types';

const DEFAULT_SETTINGS: SettingsType = {
  inspectionEnabled: false,
  inspectionTime: 15,
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

  const { scramble, generateNewScramble, isLoaded: scrambleLoaded } = useScramble();
  const [solves, setSolves, clearSolves, solvesSyncStatus] = useCloudStorage<Solve[]>(
    'cube-timer-solves',
    []
  );

  const lastSolve = solves.length > 0 ? solves[solves.length - 1] : null;
  const stats = useMemo(() => calculateStatistics(solves), [solves]);

  // Track if space is held
  const spaceHeldRef = useRef(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle inspection setting
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
      };
      setSolves((prev) => [...prev, newSolve]);
      generateNewScramble();
    },
    [setSolves, generateNewScramble]
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

  // Touch/click handler for stopping timer
  const handlePageClick = useCallback(() => {
    if (state === 'running') {
      const finalTime = stopTimer();
      saveSolve(finalTime, scrambleRef.current);
    }
  }, [state, stopTimer, saveSolve]);

  return (
    <main
      className="min-h-screen bg-cube-black bg-grid relative overflow-hidden"
      onClick={handlePageClick}
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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="w-10" /> {/* Spacer for centering */}
          <div className="text-center">
            <h1 className="font-brutal text-2xl sm:text-3xl tracking-[0.5em] text-cube-white mb-2">
              CUBE<span className="text-cube-yellow">TIMER</span>
            </h1>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cube-yellow to-transparent" />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Settings
              inspectionEnabled={settings.inspectionEnabled}
              onToggleInspection={toggleInspection}
              syncStatus={solvesSyncStatus}
            />
          </div>
        </header>

        {/* Scramble Section */}
        <section className="mb-8" onClick={(e) => e.stopPropagation()}>
          <Scramble scramble={scramble} onNewScramble={generateNewScramble} isLoading={!scrambleLoaded} />
        </section>

        {/* Timer Section */}
        <section className="py-12 sm:py-16 md:py-24 flex flex-col items-center justify-center">
          <Timer
            time={time}
            inspectionTime={inspectionTime}
            state={state}
            inspectionEnabled={settings.inspectionEnabled}
          />

          {/* Solve Actions */}
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

        {/* Statistics Section */}
        <section className="mb-8" onClick={(e) => e.stopPropagation()}>
          <Statistics stats={stats} />
        </section>

        {/* Solve History Section */}
        <section onClick={(e) => e.stopPropagation()}>
          <SolveList
            solves={solves}
            onToggleDnf={toggleDnf}
            onTogglePlusTwo={togglePlusTwo}
            onDelete={deleteSolve}
            onClearSession={clearSession}
          />
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="h-px w-full bg-cube-gray/30 mb-4" />
          <p className="font-mono text-xs text-cube-cement">
            Hold <kbd className="px-2 py-0.5 bg-cube-gray text-cube-white">SPACE</kbd> to ready,
            release to start{settings.inspectionEnabled ? ' inspection' : ''} • Tap anywhere to stop
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
