'use client';

import { useMemo } from 'react';
import { TimerState } from '@/lib/types';
import { formatTime } from '@/lib/statistics';

interface TimerProps {
  time: number;
  state: TimerState;
}

export function Timer({ time, state }: TimerProps) {
  const displayTime = useMemo(() => formatTime(time), [time]);

  const stateClasses = useMemo(() => {
    switch (state) {
      case 'ready':
        return 'text-cube-green animate-ready-pulse';
      case 'running':
        return 'text-cube-yellow animate-count';
      case 'stopped':
        return 'text-cube-white';
      default:
        return 'text-cube-cement';
    }
  }, [state]);

  const instructionText = useMemo(() => {
    switch (state) {
      case 'idle':
        return 'HOLD SPACE TO START';
      case 'ready':
        return 'RELEASE TO BEGIN';
      case 'running':
        return 'TAP ANYWHERE TO STOP';
      case 'stopped':
        return 'SPACE FOR NEW SOLVE';
      default:
        return '';
    }
  }, [state]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Decorative elements - geometric shapes */}
      <div className="absolute -top-8 -left-8 w-16 h-16 border-4 border-cube-yellow rotate-45 opacity-20" />
      <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-cube-red opacity-10" />

      {/* Main timer display */}
      <div
        className={`
          font-mono text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[18rem]
          font-bold leading-none tracking-tighter
          transition-colors duration-150
          ${stateClasses}
        `}
        style={{
          textShadow:
            state === 'ready'
              ? '0 0 60px rgba(46, 213, 115, 0.5)'
              : state === 'running'
                ? '0 0 40px rgba(255, 217, 61, 0.3)'
                : 'none',
        }}
      >
        {displayTime}
      </div>

      {/* Instruction text */}
      <div
        className={`
          mt-4 font-brutal text-sm sm:text-base md:text-lg tracking-[0.3em]
          transition-all duration-300
          ${state === 'ready' ? 'text-cube-green' : 'text-cube-cement'}
        `}
      >
        {instructionText}
      </div>

      {/* Visual state indicator bar */}
      <div className="mt-8 w-32 h-1 bg-cube-gray overflow-hidden">
        <div
          className={`
            h-full transition-all duration-300
            ${state === 'ready' ? 'w-full bg-cube-green' : ''}
            ${state === 'running' ? 'w-full bg-cube-yellow animate-pulse' : ''}
            ${state === 'stopped' ? 'w-full bg-cube-white' : ''}
            ${state === 'idle' ? 'w-0' : ''}
          `}
        />
      </div>
    </div>
  );
}
