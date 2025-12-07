import { Solve, Statistics, CubeType } from './types';

/**
 * Gets the effective time for a solve (including +2 penalty)
 */
export function getEffectiveTime(solve: Solve): number {
  if (solve.dnf) return Infinity;
  return solve.plusTwo ? solve.time + 2000 : solve.time;
}

/**
 * Calculates the average of N solves (excluding best and worst per WCA rules)
 * Returns null if not enough solves or if result would be DNF
 */
export function calculateAverageOfN(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null;

  const lastN = solves.slice(-n);
  const times = lastN.map((s) => getEffectiveTime(s));

  // Count DNFs
  const dnfCount = times.filter((t) => t === Infinity).length;

  // If more than 1 DNF in the average, the whole average is DNF
  if (dnfCount > 1) return null;

  // Sort and exclude best and worst
  const sorted = [...times].sort((a, b) => a - b);
  const middle = sorted.slice(1, -1);

  // If any middle time is DNF, average is DNF
  if (middle.some((t) => t === Infinity)) return null;

  return middle.reduce((a, b) => a + b, 0) / middle.length;
}

/**
 * Calculates ao5 (average of 5)
 */
export function calculateAo5(solves: Solve[]): number | null {
  return calculateAverageOfN(solves, 5);
}

/**
 * Calculates ao12 (average of 12)
 */
export function calculateAo12(solves: Solve[]): number | null {
  return calculateAverageOfN(solves, 12);
}

/**
 * Calculates mean of all non-DNF solves
 */
export function calculateMean(solves: Solve[]): number | null {
  const validSolves = solves.filter((s) => !s.dnf);
  if (validSolves.length === 0) return null;

  const total = validSolves.reduce((sum, s) => sum + getEffectiveTime(s), 0);
  return total / validSolves.length;
}

/**
 * Gets best single (lowest time, excluding DNFs)
 */
export function getBestSingle(solves: Solve[]): number | null {
  const validSolves = solves.filter((s) => !s.dnf);
  if (validSolves.length === 0) return null;

  return Math.min(...validSolves.map((s) => getEffectiveTime(s)));
}

/**
 * Gets worst single (highest time, excluding DNFs)
 */
export function getWorstSingle(solves: Solve[]): number | null {
  const validSolves = solves.filter((s) => !s.dnf);
  if (validSolves.length === 0) return null;

  return Math.max(...validSolves.map((s) => getEffectiveTime(s)));
}

/**
 * Calculates all statistics for a session
 * Optionally filter by cube type
 */
export function calculateStatistics(solves: Solve[], cubeType?: CubeType): Statistics {
  // Filter solves by cube type if specified
  // For backwards compatibility, solves without cubeType default to '3x3'
  const filteredSolves = cubeType
    ? solves.filter((s) => (s.cubeType || '3x3') === cubeType)
    : solves;

  return {
    best: getBestSingle(filteredSolves),
    worst: getWorstSingle(filteredSolves),
    ao5: calculateAo5(filteredSolves),
    ao12: calculateAo12(filteredSolves),
    mean: calculateMean(filteredSolves),
    count: filteredSolves.length,
  };
}

/**
 * Formats time in milliseconds to display string (e.g., 12.345)
 */
export function formatTime(ms: number | null): string {
  if (ms === null) return '-';
  if (ms === Infinity) return 'DNF';

  const seconds = ms / 1000;
  return seconds.toFixed(3);
}

/**
 * Formats time with penalty indicator
 */
export function formatTimeWithPenalty(solve: Solve): string {
  if (solve.dnf) return 'DNF';

  const baseTime = formatTime(solve.time);
  if (solve.plusTwo) {
    return `${baseTime}+`;
  }
  return baseTime;
}
