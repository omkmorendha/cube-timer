'use client';

import { useState, useCallback, useEffect } from 'react';
import { generateScramble } from '@/lib/scrambleGenerator';

interface UseScrambleReturn {
  scramble: string;
  generateNewScramble: () => string;
  isLoaded: boolean;
}

export function useScramble(): UseScrambleReturn {
  // Start with empty string to avoid hydration mismatch
  const [scramble, setScramble] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate scramble on client side only
  useEffect(() => {
    setScramble(generateScramble());
    setIsLoaded(true);
  }, []);

  const generateNewScramble = useCallback(() => {
    const newScramble = generateScramble();
    setScramble(newScramble);
    return newScramble;
  }, []);

  return {
    scramble,
    generateNewScramble,
    isLoaded,
  };
}
