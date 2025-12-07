'use client';

import { useMemo } from 'react';
import { TimerState } from '@/lib/types';
import { formatTime } from '@/lib/statistics';

interface TimerProps {
  time: number;
  inspectionTime?: number;
  state: TimerState;
  inspectionEnabled?: boolean;
}

export function Timer({ time, inspectionTime = 15, state, inspectionEnabled = false }: TimerProps) {
  const displayTime = useMemo(() => formatTime(time), [time]);

  const isInspection = state === 'inspection';

  const stateClasses = useMemo(() => {
    switch (state) {
      case 'ready':
        return 'text-cube-green animate-ready-pulse';
      case 'inspection':
        // Color changes based on remaining time
        if (inspectionTime <= 3) return 'text-cube-red animate-pulse';
        if (inspectionTime <= 8) return 'text-cube-orange';
        return 'text-cube-blue';
      case 'running':
        return 'text-cube-yellow animate-count';
      case 'stopped':
        return 'text-cube-white';
      default:
        return 'text-cube-cement';
    }
  }, [state, inspectionTime]);

  const instructionText = useMemo(() => {
    switch (state) {
      case 'idle':
        return inspectionEnabled ? 'HOLD TO START INSPECTION' : 'HOLD TO START';
      case 'ready':
        return inspectionEnabled ? 'RELEASE TO START INSPECTION' : 'RELEASE TO BEGIN';
      case 'inspection':
        return 'HOLD, RELEASE TO START';
      case 'running':
        return 'TAP ANYWHERE TO STOP';
      case 'stopped':
        return 'HOLD FOR NEW SOLVE';
      default:
        return '';
    }
  }, [state, inspectionEnabled]);

  // What to display - inspection countdown or solve time
  const displayContent = useMemo(() => {
    if (isInspection) {
      return inspectionTime.toString();
    }
    return displayTime;
  }, [isInspection, inspectionTime, displayTime]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Decorative elements - geometric shapes */}
      <div className="absolute -top-8 -left-8 w-16 h-16 border-4 border-cube-yellow rotate-45 opacity-20" />
      <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-cube-red opacity-10" />

      {/* Inspection label */}
      {isInspection && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          <span className="font-brutal text-sm tracking-[0.3em] text-cube-blue animate-pulse">
            INSPECTION
          </span>
        </div>
      )}

      {/* Main timer display */}
      <div
        className={`
          font-mono font-bold leading-none tracking-tighter
          transition-colors duration-150
          ${isInspection ? 'text-[10rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem]' : 'text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[18rem]'}
          ${stateClasses}
        `}
        style={{
          textShadow:
            state === 'ready'
              ? '0 0 60px rgba(46, 213, 115, 0.5)'
              : state === 'inspection'
                ? inspectionTime <= 3
                  ? '0 0 80px rgba(255, 71, 87, 0.6)'
                  : '0 0 60px rgba(55, 66, 250, 0.4)'
                : state === 'running'
                  ? '0 0 40px rgba(255, 217, 61, 0.3)'
                  : 'none',
        }}
      >
        {displayContent}
      </div>

      {/* Instruction text */}
      <div
        className={`
          mt-4 font-brutal text-sm sm:text-base md:text-lg tracking-[0.3em]
          transition-all duration-300
          ${state === 'ready' ? 'text-cube-green' : ''}
          ${state === 'inspection' ? 'text-cube-blue' : ''}
          ${state !== 'ready' && state !== 'inspection' ? 'text-cube-cement' : ''}
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
            ${state === 'inspection' ? 'bg-cube-blue' : ''}
            ${state === 'running' ? 'w-full bg-cube-yellow animate-pulse' : ''}
            ${state === 'stopped' ? 'w-full bg-cube-white' : ''}
            ${state === 'idle' ? 'w-0' : ''}
          `}
          style={
            state === 'inspection'
              ? { width: `${(inspectionTime / 15) * 100}%` }
              : undefined
          }
        />
      </div>
    </div>
  );
}
