'use client';

interface ScrambleProps {
  scramble: string;
  onNewScramble: () => void;
  isLoading?: boolean;
}

export function Scramble({ scramble, onNewScramble, isLoading }: ScrambleProps) {
  const moves = scramble ? scramble.split(' ').filter(Boolean) : [];

  return (
    <div className="w-full">
      {/* Header with decorative line */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cube-cement to-transparent" />
        <span className="font-brutal text-xs tracking-[0.4em] text-cube-cement">SCRAMBLE</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cube-cement to-transparent" />
      </div>

      {/* Scramble display */}
      <div className="relative group">
        {/* Background texture */}
        <div className="absolute inset-0 bg-cube-gray/30 border-2 border-cube-gray" />

        {/* Scramble moves */}
        <div className="relative p-4 sm:p-6 min-h-[60px]">
          {isLoading || moves.length === 0 ? (
            <div className="flex justify-center items-center">
              <span className="font-mono text-lg text-cube-cement animate-pulse">
                Generating scramble...
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {moves.map((move, index) => (
                <span
                  key={`${move}-${index}`}
                  className="
                    font-mono text-lg sm:text-xl md:text-2xl font-bold
                    text-cube-white
                    px-2 py-1
                    transition-all duration-150
                    hover:text-cube-yellow hover:scale-110
                  "
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                >
                  {move}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* New scramble button - appears on hover */}
        <button
          onClick={onNewScramble}
          className="
            absolute -bottom-3 left-1/2 -translate-x-1/2
            px-4 py-1
            bg-cube-black border-2 border-cube-cement
            font-brutal text-xs tracking-[0.2em] text-cube-cement
            opacity-0 group-hover:opacity-100
            hover:border-cube-yellow hover:text-cube-yellow
            transition-all duration-200
            shadow-brutal-sm hover:shadow-none hover:translate-x-[calc(-50%+2px)] hover:translate-y-[2px]
          "
        >
          NEW SCRAMBLE
        </button>
      </div>
    </div>
  );
}
