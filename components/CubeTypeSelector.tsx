'use client';

import { useState } from 'react';
import { CubeType } from '@/lib/types';

interface CubeTypeSelectorProps {
  value: CubeType;
  onChange: (type: CubeType) => void;
}

const CUBE_TYPES: Record<string, { value: CubeType; label: string }[]> = {
  'Standard NxN': [
    { value: '2x2', label: '2×2×2' },
    { value: '3x3', label: '3×3×3' },
    { value: '4x4', label: '4×4×4' },
    { value: '5x5', label: '5×5×5' },
    { value: '6x6', label: '6×6×6' },
    { value: '7x7', label: '7×7×7' },
  ],
  'WCA Puzzles': [
    { value: 'pyraminx', label: 'Pyraminx' },
    { value: 'megaminx', label: 'Megaminx' },
    { value: 'skewb', label: 'Skewb' },
    { value: 'clock', label: 'Clock' },
    { value: 'sq1', label: 'Square-1' },
  ],
  'Variations': [
    { value: 'oh', label: 'One-Handed' },
    { value: 'bld', label: 'Blindfolded' },
  ],
};

function formatCubeType(type: CubeType): string {
  for (const category of Object.values(CUBE_TYPES)) {
    const found = category.find((ct) => ct.value === type);
    if (found) return found.label;
  }
  return type;
}

export function CubeTypeSelector({ value, onChange }: CubeTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Selected value button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full px-3 py-2 border-2 border-cube-gray bg-cube-black
                   text-cube-white font-mono text-sm flex items-center justify-between
                   hover:border-cube-yellow transition-colors"
      >
        <span>{formatCubeType(value)}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full border-2 border-cube-gray
                          bg-cube-black max-h-80 overflow-y-auto">
            {Object.entries(CUBE_TYPES).map(([category, types]) => (
              <div key={category}>
                <div className="px-3 py-2 bg-cube-gray/30">
                  <span className="font-brutal text-xs tracking-wider text-cube-cement">
                    {category}
                  </span>
                </div>
                {types.map((type) => (
                  <button
                    key={type.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(type.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left font-mono text-sm
                                hover:bg-cube-gray/20 transition-colors
                                ${value === type.value ? 'bg-cube-yellow/20 text-cube-yellow' : 'text-cube-white'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
