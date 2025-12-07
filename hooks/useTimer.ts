'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TimerState } from '@/lib/types';

interface UseTimerReturn {
  time: number;
  state: TimerState;
  setReady: () => void;
  startTimer: () => void;
  stopTimer: () => number;
  resetTimer: () => void;
  cancelReady: () => void;
}

export function useTimer(): UseTimerReturn {
  const [time, setTime] = useState(0);
  const [state, setState] = useState<TimerState>('idle');

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const finalTimeRef = useRef<number>(0);

  // Update timer display using requestAnimationFrame for smooth updates
  const updateTimer = useCallback(() => {
    if (startTimeRef.current !== null) {
      const elapsed = performance.now() - startTimeRef.current;
      setTime(elapsed);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  }, []);

  const setReady = useCallback(() => {
    if (state === 'idle' || state === 'stopped') {
      setState('ready');
    }
  }, [state]);

  const cancelReady = useCallback(() => {
    if (state === 'ready') {
      setState('idle');
    }
  }, [state]);

  const startTimer = useCallback(() => {
    if (state === 'ready') {
      setTime(0);
      startTimeRef.current = performance.now();
      setState('running');
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  }, [state, updateTimer]);

  const stopTimer = useCallback((): number => {
    if (state === 'running' && startTimeRef.current !== null) {
      // Cancel animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Calculate final time with high precision
      const finalTime = performance.now() - startTimeRef.current;
      finalTimeRef.current = finalTime;
      setTime(finalTime);
      setState('stopped');
      startTimeRef.current = null;

      return finalTime;
    }
    return finalTimeRef.current;
  }, [state]);

  const resetTimer = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setTime(0);
    setState('idle');
    startTimeRef.current = null;
    finalTimeRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    time,
    state,
    setReady,
    startTimer,
    stopTimer,
    resetTimer,
    cancelReady,
  };
}
