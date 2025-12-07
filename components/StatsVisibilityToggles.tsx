'use client';

import { VisibleStats } from '@/lib/types';

interface StatsVisibilityTogglesProps {
  visible: VisibleStats;
  onChange: (visible: VisibleStats) => void;
}

const STATS_OPTIONS: { key: keyof VisibleStats; label: string }[] = [
  { key: 'best', label: 'Best Time' },
  { key: 'worst', label: 'Worst Time' },
  { key: 'ao5', label: 'Average of 5' },
  { key: 'ao12', label: 'Average of 12' },
  { key: 'mean', label: 'Session Mean' },
];

export function StatsVisibilityToggles({ visible, onChange }: StatsVisibilityTogglesProps) {
  return (
    <div className="space-y-2">
      {STATS_OPTIONS.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center gap-2 cursor-pointer group"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={visible[key] ?? true}
            onChange={(e) => {
              e.stopPropagation();
              onChange({ ...visible, [key]: e.target.checked });
            }}
            className="w-4 h-4 border-2 border-cube-gray bg-cube-black
                       cursor-pointer accent-cube-yellow
                       focus-visible:outline-2 focus-visible:outline-cube-yellow"
          />
          <span className="font-mono text-sm text-cube-white group-hover:text-cube-yellow
                           transition-colors">
            {label}
          </span>
        </label>
      ))}
    </div>
  );
}
