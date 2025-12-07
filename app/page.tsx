'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Timer } from '@/components/Timer';
import { Scramble } from '@/components/Scramble';
import { SolveActions } from '@/components/SolveActions';
import { Statistics } from '@/components/Statistics';
import { SolveList } from '@/components/SolveList';
import { useTimer } from '@/hooks/useTimer';
import { useScramble } from '@/hooks/useScramble';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calculateStatistics } from '@/lib/statistics';
import { Solve } from '@/lib/types';

export default function Home() {
  const { time, state, setReady, startTimer, stopTimer, resetTimer, cancelReady } = useTimer();
  const { scramble, generateNewScramble } = useScramble();
  const [solves, setSolves, clearSolves] = useLocalStorage<Solve[]>('cube-timer-solves', []);

  const lastSolve = solves.length > 0 ? solves[solves.length - 1] : null;
  const stats = useMemo(() => calculateStatistics(solves), [solves]);

  // Track if space is held
  const spaceHeldRef = useRef(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

        // If ready, start timer on release
        if (state === 'ready') {
          startTimer();
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
  }, [state, setReady, startTimer, stopTimer, saveSolve, cancelReady]);

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
        <header className="text-center mb-8">
          <h1 className="font-brutal text-2xl sm:text-3xl tracking-[0.5em] text-cube-white mb-2">
            CUBE<span className="text-cube-yellow">TIMER</span>
          </h1>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cube-yellow to-transparent" />
        </header>

        {/* Scramble Section */}
        <section className="mb-8" onClick={(e) => e.stopPropagation()}>
          <Scramble scramble={scramble} onNewScramble={generateNewScramble} />
        </section>

        {/* Timer Section */}
        <section className="py-12 sm:py-16 md:py-24 flex flex-col items-center justify-center">
          <Timer time={time} state={state} />

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
            release to start • Tap anywhere to stop
          </p>
        </footer>
      </div>
    </main>
  );
}
