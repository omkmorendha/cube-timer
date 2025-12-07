'use client';

interface SolveActionsProps {
  onDnf: () => void;
  onPlusTwo: () => void;
  onDelete: () => void;
  isDnf: boolean;
  isPlusTwo: boolean;
  visible: boolean;
}

export function SolveActions({
  onDnf,
  onPlusTwo,
  onDelete,
  isDnf,
  isPlusTwo,
  visible,
}: SolveActionsProps) {
  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 animate-slide-up">
      {/* DNF Button */}
      <button
        onClick={onDnf}
        className={`
          group relative px-6 py-3 sm:px-8 sm:py-4
          font-brutal text-sm sm:text-base tracking-[0.2em]
          border-2 transition-all duration-150
          ${
            isDnf
              ? 'bg-cube-red border-cube-red text-cube-black'
              : 'bg-transparent border-cube-cement text-cube-cement hover:border-cube-red hover:text-cube-red'
          }
          shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]
        `}
      >
        <span className="relative z-10">DNF</span>
        {isDnf && (
          <div className="absolute inset-0 bg-cube-red/20 animate-pulse" />
        )}
      </button>

      {/* +2 Button */}
      <button
        onClick={onPlusTwo}
        disabled={isDnf}
        className={`
          group relative px-6 py-3 sm:px-8 sm:py-4
          font-brutal text-sm sm:text-base tracking-[0.2em]
          border-2 transition-all duration-150
          ${isDnf ? 'opacity-30 cursor-not-allowed' : ''}
          ${
            isPlusTwo && !isDnf
              ? 'bg-cube-orange border-cube-orange text-cube-black'
              : 'bg-transparent border-cube-cement text-cube-cement hover:border-cube-orange hover:text-cube-orange'
          }
          shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]
          disabled:hover:shadow-brutal-sm disabled:hover:translate-x-0 disabled:hover:translate-y-0
        `}
      >
        <span className="relative z-10">+2</span>
        {isPlusTwo && !isDnf && (
          <div className="absolute inset-0 bg-cube-orange/20 animate-pulse" />
        )}
      </button>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="
          group relative px-6 py-3 sm:px-8 sm:py-4
          font-brutal text-sm sm:text-base tracking-[0.2em]
          bg-transparent border-2 border-cube-gray text-cube-gray
          hover:border-cube-red hover:text-cube-red hover:bg-cube-red/10
          transition-all duration-150
          shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]
        "
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          DELETE
        </span>
      </button>
    </div>
  );
}
