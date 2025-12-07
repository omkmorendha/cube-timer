import { Move, Modifier, FullMove, MOVES, MODIFIERS, MOVE_AXES } from './types';

/**
 * Generates a WCA-style 3x3 scramble
 * Rules:
 * - 20 random moves
 * - No consecutive same-face moves (R R')
 * - No three consecutive same-axis moves (R L R)
 */
export function generateScramble(length: number = 20): string {
  const scramble: FullMove[] = [];
  let previousMove: Move | null = null;
  let previousPreviousMove: Move | null = null;

  for (let i = 0; i < length; i++) {
    let validMoves = [...MOVES];

    // Rule 1: Avoid same face as previous move
    if (previousMove) {
      validMoves = validMoves.filter((m) => m !== previousMove);
    }

    // Rule 2: Avoid three consecutive moves on same axis
    if (previousMove && previousPreviousMove) {
      const prevAxis = MOVE_AXES[previousMove];
      const prevPrevAxis = MOVE_AXES[previousPreviousMove];

      if (prevAxis === prevPrevAxis) {
        // Filter out moves on the same axis
        validMoves = validMoves.filter((m) => MOVE_AXES[m] !== prevAxis);
      }
    }

    // Pick random move from valid moves
    const move = validMoves[Math.floor(Math.random() * validMoves.length)];
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];

    scramble.push(`${move}${modifier}` as FullMove);

    // Update history
    previousPreviousMove = previousMove;
    previousMove = move;
  }

  return scramble.join(' ');
}

/**
 * Parses a scramble string back into moves array
 */
export function parseScramble(scramble: string): FullMove[] {
  return scramble.split(' ').filter(Boolean) as FullMove[];
}
