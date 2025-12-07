'use client';

import { Statistics as StatsType, VisibleStats } from '@/lib/types';
import { formatTime } from '@/lib/statistics';

interface StatisticsProps {
  stats: StatsType;
  visibleStats: VisibleStats;
}

interface StatBoxProps {
  label: string;
  value: string;
  accent?: 'yellow' | 'green' | 'blue' | 'red' | 'default';
  highlight?: boolean;
}

function StatBox({ label, value, accent = 'default', highlight = false }: StatBoxProps) {
  const accentColors = {
    yellow: 'border-cube-yellow text-cube-yellow',
    green: 'border-cube-green text-cube-green',
    blue: 'border-cube-blue text-cube-blue',
    red: 'border-cube-red text-cube-red',
    default: 'border-cube-cement text-cube-cement',
  };

  return (
    <div
      className={`
        relative flex flex-col items-center p-3 sm:p-4
        border-2 ${accentColors[accent]}
        bg-cube-black/50
        transition-all duration-200
        ${highlight ? 'shadow-brutal-sm' : ''}
        hover:bg-cube-gray/20
        group
      `}
    >
      {/* Label */}
      <span className="font-brutal text-[10px] sm:text-xs tracking-[0.3em] text-cube-cement mb-1">
        {label}
      </span>

      {/* Value */}
      <span
        className={`
          font-mono text-lg sm:text-xl md:text-2xl font-bold
          ${value === '-' ? 'text-cube-gray' : accentColors[accent].split(' ')[1]}
          group-hover:scale-105 transition-transform
        `}
      >
        {value}
      </span>

      {/* Decorative corner */}
      <div
        className={`
          absolute top-0 right-0 w-2 h-2
          ${accentColors[accent].split(' ')[0].replace('border-', 'bg-')}
          opacity-50
        `}
      />
    </div>
  );
}

export function Statistics({ stats, visibleStats }: StatisticsProps) {
  // Provide default values if visibleStats is undefined
  const visible = visibleStats || {
    best: true,
    worst: true,
    ao5: true,
    ao12: true,
    mean: true,
  };

  // Build list of visible stat boxes
  const statBoxes = [];

  if (visible.best) {
    statBoxes.push(
      <StatBox
        key="best"
        label="BEST"
        value={formatTime(stats.best)}
        accent="green"
        highlight={stats.best !== null}
      />
    );
  }

  if (visible.worst) {
    statBoxes.push(
      <StatBox
        key="worst"
        label="WORST"
        value={formatTime(stats.worst)}
        accent="red"
      />
    );
  }

  if (visible.ao5) {
    statBoxes.push(
      <StatBox
        key="ao5"
        label="AO5"
        value={formatTime(stats.ao5)}
        accent="yellow"
        highlight={stats.ao5 !== null}
      />
    );
  }

  if (visible.ao12) {
    statBoxes.push(
      <StatBox
        key="ao12"
        label="AO12"
        value={formatTime(stats.ao12)}
        accent="blue"
        highlight={stats.ao12 !== null}
      />
    );
  }

  if (visible.mean) {
    statBoxes.push(
      <StatBox
        key="mean"
        label="MEAN"
        value={formatTime(stats.mean)}
        accent="default"
      />
    );
  }

  const visibleCount = statBoxes.length;

  // Dynamic grid columns based on visible count
  const gridCols = visibleCount <= 2 ? 'grid-cols-2' :
                   visibleCount === 3 ? 'grid-cols-2 sm:grid-cols-3' :
                   visibleCount === 4 ? 'grid-cols-2 sm:grid-cols-4' :
                   'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-px flex-1 bg-cube-gray" />
        <span className="font-brutal text-xs tracking-[0.4em] text-cube-cement">STATISTICS</span>
        <div className="h-px flex-1 bg-cube-gray" />
      </div>

      {/* Stats grid - Dynamic columns */}
      {visibleCount > 0 ? (
        <>
          <div className={`grid ${gridCols} gap-2 sm:gap-3`}>
            {statBoxes}
          </div>

          {/* Solve count */}
          <div className="mt-4 text-center">
            <span className="font-mono text-sm text-cube-cement">
              {stats.count} {stats.count === 1 ? 'SOLVE' : 'SOLVES'}
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <span className="font-mono text-sm text-cube-cement">
            No statistics selected
          </span>
        </div>
      )}
    </div>
  );
}
