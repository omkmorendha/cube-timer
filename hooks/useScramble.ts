'use client';

import { useState, useCallback } from 'react';
import { generateScramble } from '@/lib/scrambleGenerator';

interface UseScrambleReturn {
  scramble: string;
  generateNewScramble: () => string;
}

export function useScramble(initialScramble?: string): UseScrambleReturn {
  const [scramble, setScramble] = useState(() => initialScramble || generateScramble());

  const generateNewScramble = useCallback(() => {
    const newScramble = generateScramble();
    setScramble(newScramble);
    return newScramble;
  }, []);

  return {
    scramble,
    generateNewScramble,
  };
}
