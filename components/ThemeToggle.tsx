'use client';

interface ThemeToggleProps {
  theme: 'dark' | 'light' | 'auto';
  onChange: (theme: 'dark' | 'light' | 'auto') => void;
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <div className="space-y-2">
      <label className="font-mono text-sm text-cube-white block">
        Theme
      </label>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onChange('dark')}
          className={`
            px-3 py-2 border-2 font-mono text-xs tracking-wider
            transition-colors duration-200
            ${theme === 'dark'
              ? 'bg-cube-white text-cube-black border-cube-white'
              : 'bg-transparent text-cube-cement border-cube-gray hover:border-cube-cement'
            }
          `}
        >
          DARK
        </button>
        <button
          onClick={() => onChange('light')}
          className={`
            px-3 py-2 border-2 font-mono text-xs tracking-wider
            transition-colors duration-200
            ${theme === 'light'
              ? 'bg-cube-white text-cube-black border-cube-white'
              : 'bg-transparent text-cube-cement border-cube-gray hover:border-cube-cement'
            }
          `}
        >
          LIGHT
        </button>
        <button
          onClick={() => onChange('auto')}
          className={`
            px-3 py-2 border-2 font-mono text-xs tracking-wider
            transition-colors duration-200
            ${theme === 'auto'
              ? 'bg-cube-white text-cube-black border-cube-white'
              : 'bg-transparent text-cube-cement border-cube-gray hover:border-cube-cement'
            }
          `}
        >
          AUTO
        </button>
      </div>
    </div>
  );
}
