export interface Solve {
  id: string;
  time: number; // milliseconds
  scramble: string;
  date: string; // ISO timestamp
  dnf: boolean;
  plusTwo: boolean;
}

export interface Session {
  solves: Solve[];
  createdAt: string;
}

export type TimerState = 'idle' | 'ready' | 'inspection' | 'running' | 'stopped';

export interface Settings {
  inspectionEnabled: boolean;
  inspectionTime: number; // seconds (default 15)
}

export interface TimerContextValue {
  time: number;
  state: TimerState;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setReady: () => void;
}

export interface Statistics {
  best: number | null;
  worst: number | null;
  ao5: number | null;
  ao12: number | null;
  mean: number | null;
  count: number;
}

export type Move = 'R' | 'L' | 'U' | 'D' | 'F' | 'B';
export type Modifier = '' | "'" | '2';
export type FullMove = `${Move}${Modifier}`;

// WCA standard move axes
export const MOVE_AXES: Record<Move, 'x' | 'y' | 'z'> = {
  R: 'x',
  L: 'x',
  U: 'y',
  D: 'y',
  F: 'z',
  B: 'z',
};

export const MOVES: Move[] = ['R', 'L', 'U', 'D', 'F', 'B'];
export const MODIFIERS: Modifier[] = ['', "'", '2'];

// Cloud sync status
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
}
