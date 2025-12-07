'use client';

import { useState } from 'react';
import { Solve } from '@/lib/types';
import { formatTimeWithPenalty, getEffectiveTime, formatTime } from '@/lib/statistics';

interface SolveListProps {
  solves: Solve[];
  onToggleDnf: (id: string) => void;
  onTogglePlusTwo: (id: string) => void;
  onDelete: (id: string) => void;
  onClearSession: () => void;
}

interface SolveItemProps {
  solve: Solve;
  index: number;
  onToggleDnf: () => void;
  onTogglePlusTwo: () => void;
  onDelete: () => void;
}

function SolveItem({ solve, index, onToggleDnf, onTogglePlusTwo, onDelete }: SolveItemProps) {
  const [expanded, setExpanded] = useState(false);

  const displayTime = formatTimeWithPenalty(solve);
  const effectiveTime = solve.dnf ? 'DNF' : formatTime(getEffectiveTime(solve));

  return (
    <div
      className={`
        group relative
        border-b border-cube-gray/30
        transition-all duration-200
        ${expanded ? 'bg-cube-gray/20' : 'hover:bg-cube-gray/10'}
      `}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-4 p-3 sm:p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Index number */}
        <span className="font-mono text-xs text-cube-cement w-8 text-right">
          {index + 1}.
        </span>

        {/* Time display */}
        <span
          className={`
            font-mono text-lg sm:text-xl font-bold flex-shrink-0
            ${solve.dnf ? 'text-cube-red line-through' : ''}
            ${solve.plusTwo && !solve.dnf ? 'text-cube-orange' : ''}
            ${!solve.dnf && !solve.plusTwo ? 'text-cube-white' : ''}
          `}
        >
          {displayTime}
        </span>

        {/* Effective time (if +2) */}
        {solve.plusTwo && !solve.dnf && (
          <span className="font-mono text-sm text-cube-cement">
            ({effectiveTime})
          </span>
        )}

        {/* Scramble preview */}
        <span className="hidden sm:block font-mono text-xs text-cube-cement truncate flex-1 max-w-xs">
          {solve.scramble.slice(0, 30)}...
        </span>

        {/* Expand indicator */}
        <svg
          className={`
            w-4 h-4 text-cube-cement transition-transform duration-200
            ${expanded ? 'rotate-180' : ''}
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 animate-slide-down">
          {/* Full scramble */}
          <div className="mb-4">
            <span className="font-brutal text-[10px] tracking-[0.3em] text-cube-cement block mb-2">
              SCRAMBLE
            </span>
            <div className="font-mono text-sm text-cube-white bg-cube-black/50 p-3 border border-cube-gray">
              {solve.scramble}
            </div>
          </div>

          {/* Date */}
          <div className="mb-4">
            <span className="font-brutal text-[10px] tracking-[0.3em] text-cube-cement block mb-1">
              DATE
            </span>
            <span className="font-mono text-xs text-cube-cement">
              {new Date(solve.date).toLocaleString()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDnf();
              }}
              className={`
                px-3 py-1.5 text-xs font-brutal tracking-wider
                border transition-all duration-150
                ${
                  solve.dnf
                    ? 'bg-cube-red border-cube-red text-cube-black'
                    : 'bg-transparent border-cube-cement text-cube-cement hover:border-cube-red hover:text-cube-red'
                }
              `}
            >
              DNF
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlusTwo();
              }}
              disabled={solve.dnf}
              className={`
                px-3 py-1.5 text-xs font-brutal tracking-wider
                border transition-all duration-150
                ${solve.dnf ? 'opacity-30 cursor-not-allowed' : ''}
                ${
                  solve.plusTwo && !solve.dnf
                    ? 'bg-cube-orange border-cube-orange text-cube-black'
                    : 'bg-transparent border-cube-cement text-cube-cement hover:border-cube-orange hover:text-cube-orange'
                }
              `}
            >
              +2
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="
                px-3 py-1.5 text-xs font-brutal tracking-wider
                bg-transparent border border-cube-gray text-cube-gray
                hover:border-cube-red hover:text-cube-red
                transition-all duration-150
              "
            >
              DELETE
            </button>
          </div>
        </div>
      )}

      {/* Hover accent line */}
      <div
        className="
          absolute left-0 top-0 bottom-0 w-1
          bg-cube-yellow scale-y-0 group-hover:scale-y-100
          transition-transform duration-200 origin-top
        "
      />
    </div>
  );
}

export function SolveList({
  solves,
  onToggleDnf,
  onTogglePlusTwo,
  onDelete,
  onClearSession,
}: SolveListProps) {
  if (solves.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="font-brutal text-sm tracking-[0.3em] text-cube-cement mb-2">
          NO SOLVES YET
        </div>
        <div className="font-mono text-xs text-cube-gray">
          Press and hold spacebar to start
        </div>
      </div>
    );
  }

  // Display solves in reverse order (most recent first)
  const reversedSolves = [...solves].reverse();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="h-px flex-1 bg-cube-gray" />
          <span className="font-brutal text-xs tracking-[0.4em] text-cube-cement">HISTORY</span>
          <div className="h-px flex-1 bg-cube-gray" />
        </div>

        {/* Clear session button */}
        <button
          onClick={onClearSession}
          className="
            ml-4 px-3 py-1 text-xs font-brutal tracking-wider
            text-cube-gray hover:text-cube-red
            border border-transparent hover:border-cube-red
            transition-all duration-150
          "
        >
          CLEAR ALL
        </button>
      </div>

      {/* Solve list */}
      <div className="border-2 border-cube-gray bg-cube-black/30 max-h-[400px] overflow-y-auto">
        {reversedSolves.map((solve, displayIndex) => {
          const originalIndex = solves.length - 1 - displayIndex;
          return (
            <SolveItem
              key={solve.id}
              solve={solve}
              index={originalIndex}
              onToggleDnf={() => onToggleDnf(solve.id)}
              onTogglePlusTwo={() => onTogglePlusTwo(solve.id)}
              onDelete={() => onDelete(solve.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
