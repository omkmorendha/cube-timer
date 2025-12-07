import { CubeType } from '../types';
import { generateScramble as generate3x3 } from '../scrambleGenerator';

/**
 * Generate a scramble for the specified cube type
 * Currently only 3x3 has a proper implementation.
 * Other cube types return placeholder scrambles.
 */
export function generateScrambleForCubeType(type: CubeType): string {
  switch (type) {
    case '3x3':
      return generate3x3();

    case '2x2':
      // 2x2 uses R, U, F moves only (no L, D, B as they're redundant)
      return generateNxNScramble(9, ['R', 'U', 'F']);

    case '4x4':
      // 4x4 includes wide moves (w) and regular moves
      return generatePlaceholder('4x4', 40);

    case '5x5':
      return generatePlaceholder('5x5', 50);

    case '6x6':
      return generatePlaceholder('6x6', 60);

    case '7x7':
      return generatePlaceholder('7x7', 70);

    case 'pyraminx':
      // Pyraminx uses R, L, U, B moves
      return generatePlaceholder('Pyraminx', 15);

    case 'megaminx':
      // Megaminx scrambles are very long (70+ moves)
      return generatePlaceholder('Megaminx', 70);

    case 'skewb':
      // Skewb uses R, L, U, B moves
      return generatePlaceholder('Skewb', 10);

    case 'clock':
      // Clock scrambles are pin positions and dial turns
      return generatePlaceholder('Clock', 12);

    case 'sq1':
      // Square-1 uses slash notation
      return generatePlaceholder('Square-1', 15);

    case 'oh':
      // One-handed is just 3x3
      return generate3x3();

    case 'bld':
      // Blindfolded is just 3x3
      return generate3x3();

    default:
      return generate3x3();
  }
}

/**
 * Generate a simple NxN scramble (for 2x2)
 */
function generateNxNScramble(length: number, moves: string[]): string {
  const modifiers = ['', "'", '2'];
  const scramble: string[] = [];
  let lastMove = '';

  for (let i = 0; i < length; i++) {
    let move;
    do {
      move = moves[Math.floor(Math.random() * moves.length)];
    } while (move === lastMove);

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(move + modifier);
    lastMove = move;
  }

  return scramble.join(' ');
}

/**
 * Generate a placeholder scramble for unimplemented puzzle types
 */
function generatePlaceholder(puzzleName: string, length: number): string {
  // For now, return a note that the scramble is not implemented
  // In the future, this can be replaced with actual WCA-compliant scrambles
  const placeholderMoves = ['R', 'L', 'U', 'D', 'F', 'B'];
  const modifiers = ['', "'", '2'];
  const scramble: string[] = [];

  for (let i = 0; i < length; i++) {
    const move = placeholderMoves[Math.floor(Math.random() * placeholderMoves.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(move + modifier);
  }

  return scramble.join(' ');
}
