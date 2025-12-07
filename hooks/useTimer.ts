'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TimerState } from '@/lib/types';

interface UseTimerOptions {
  inspectionEnabled?: boolean;
  inspectionTime?: number; // seconds
}

interface UseTimerReturn {
  time: number;
  inspectionTime: number;
  state: TimerState;
  setReady: () => void;
  startInspection: () => void;
  startTimer: () => void;
  stopTimer: () => number;
  resetTimer: () => void;
  cancelReady: () => void;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { inspectionEnabled = false, inspectionTime: maxInspection = 15 } = options;

  const [time, setTime] = useState(0);
  const [inspectionTime, setInspectionTime] = useState(maxInspection);
  const [state, setState] = useState<TimerState>('idle');

  const startTimeRef = useRef<number | null>(null);
  const inspectionStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const inspectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finalTimeRef = useRef<number>(0);

  // Update timer display using requestAnimationFrame for smooth updates
  const updateTimer = useCallback(() => {
    if (startTimeRef.current !== null) {
      const elapsed = performance.now() - startTimeRef.current;
      setTime(elapsed);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  }, []);

  // Update inspection countdown
  const updateInspection = useCallback(() => {
    if (inspectionStartRef.current !== null) {
      const elapsed = (Date.now() - inspectionStartRef.current) / 1000;
      const remaining = Math.max(0, maxInspection - elapsed);
      setInspectionTime(Math.ceil(remaining));

      // Auto-start with +2 penalty if inspection exceeds 15s but under 17s
      // DNF if over 17s (handled in main component)
    }
  }, [maxInspection]);

  const setReady = useCallback(() => {
    if (state === 'idle' || state === 'stopped') {
      setState('ready');
    } else if (state === 'inspection') {
      // During inspection, ready means preparing to start the actual timer
      setState('ready');
    }
  }, [state]);

  const cancelReady = useCallback(() => {
    if (state === 'ready') {
      setState('idle');
    }
  }, [state]);

  const startInspection = useCallback(() => {
    if (state === 'ready' && inspectionEnabled) {
      setInspectionTime(maxInspection);
      inspectionStartRef.current = Date.now();
      setState('inspection');

      // Start inspection countdown interval
      inspectionIntervalRef.current = setInterval(updateInspection, 100);
    }
  }, [state, inspectionEnabled, maxInspection, updateInspection]);

  const startTimer = useCallback(() => {
    // Clear inspection interval if running
    if (inspectionIntervalRef.current) {
      clearInterval(inspectionIntervalRef.current);
      inspectionIntervalRef.current = null;
    }

    if (state === 'ready' || state === 'inspection') {
      setTime(0);
      startTimeRef.current = performance.now();
      inspectionStartRef.current = null;
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
    if (inspectionIntervalRef.current !== null) {
      clearInterval(inspectionIntervalRef.current);
      inspectionIntervalRef.current = null;
    }
    setTime(0);
    setInspectionTime(maxInspection);
    setState('idle');
    startTimeRef.current = null;
    inspectionStartRef.current = null;
    finalTimeRef.current = 0;
  }, [maxInspection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (inspectionIntervalRef.current !== null) {
        clearInterval(inspectionIntervalRef.current);
      }
    };
  }, []);

  // Reset inspection time when maxInspection changes
  useEffect(() => {
    if (state === 'idle' || state === 'stopped') {
      setInspectionTime(maxInspection);
    }
  }, [maxInspection, state]);

  return {
    time,
    inspectionTime,
    state,
    setReady,
    startInspection,
    startTimer,
    stopTimer,
    resetTimer,
    cancelReady,
  };
}
