'use client';

import { useState, useCallback, useEffect } from 'react';
import { generateScrambleForCubeType } from '@/lib/scrambleGenerators';
import { CubeType } from '@/lib/types';

interface UseScrambleReturn {
  scramble: string;
  generateNewScramble: () => string;
  isLoaded: boolean;
}

export function useScramble(cubeType: CubeType = '3x3'): UseScrambleReturn {
  // Start with empty string to avoid hydration mismatch
  const [scramble, setScramble] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate scramble on client side only
  // Regenerate when cube type changes
  useEffect(() => {
    setScramble(generateScrambleForCubeType(cubeType));
    setIsLoaded(true);
  }, [cubeType]);

  const generateNewScramble = useCallback(() => {
    const newScramble = generateScrambleForCubeType(cubeType);
    setScramble(newScramble);
    return newScramble;
  }, [cubeType]);

  return {
    scramble,
    generateNewScramble,
    isLoaded,
  };
}
