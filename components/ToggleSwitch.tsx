'use client';

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <label
          className="font-mono text-sm text-cube-white block cursor-pointer"
          onClick={() => onChange(!checked)}
        >
          {label}
        </label>
        {description && (
          <span className="font-mono text-xs text-cube-cement block mt-0.5">
            {description}
          </span>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative w-12 h-6 rounded-none border-2 transition-colors duration-200
          ${checked ? 'bg-cube-green border-cube-green' : 'bg-cube-gray border-cube-gray'}
        `}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`
            absolute top-0.5 w-4 h-4 bg-cube-black
            transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}
