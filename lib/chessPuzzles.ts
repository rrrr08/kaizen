export interface ChessPuzzle {
  id: string;
  fen: string;
  solution: string[]; // Sequence of moves in SAN
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
}

export const CHESS_PUZZLES: ChessPuzzle[] = [
  // Mate in 1 (Easy)
  {
    id: 'm1-1',
    fen: 'rnbqkbnr/ppppp2p/5p2/6p1/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3',
    solution: ['Qh5#'],
    difficulty: 'Easy',
    description: "Fool's Mate Pattern"
  },
  {
    id: 'm1-2',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: ['Ra8#'],
    difficulty: 'Easy',
    description: "Back Rank Mate"
  },
  {
    id: 'm1-3',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['Qxf7#'],
    difficulty: 'Easy',
    description: "Scholar's Mate"
  },
  // Mate in 2 (Medium)
  {
    id: 'm2-1',
    fen: 'r2qkb1r/pp2nppp/3p4/2pNN1B1/2BnP3/3P4/PPP2PPP/R2bK2R w KQkq - 1 1',
    solution: ['Nf6+', 'gxf6', 'Bxf7#'],
    difficulty: 'Medium',
    description: "Smothered Mate"
  },
  {
    id: 'm2-2',
    fen: 'r1b3kr/ppp1Bp1p/1b6/n2P4/2p3q1/2Q2N2/P4PPP/RN2R1K1 w - - 1 1',
    solution: ['Qh8+', 'Kxh8', 'Bf6+', 'Kg8', 'Re8#'],
    difficulty: 'Medium',
    description: "Queen Sacrifice Mate"
  },
  {
    id: 'm2-3',
    fen: '5rk1/ppp2ppp/8/3r4/3n1B2/8/PPP2PPP/R4RK1 b - - 0 1',
    solution: ['Ne2+', 'Kh1', 'Nxf4'],
    difficulty: 'Medium',
    description: "Fork Tactics"
  },
  // Mate in 3 (Hard)
  {
    id: 'm3-1',
    fen: 'r1b2r1k/pp1p1pp1/1b1p3p/4P3/1P2Bq2/P1Q5/5PPP/4RRK1 w - - 0 1',
    solution: ['exd6', 'Qxd6', 'Rd1'], // Not a mate, just tactical
    difficulty: 'Hard',
    description: "Positional Advantage"
  },
  {
    id: 'm3-2',
    fen: '2r3k1/1p1b1p1p/p2p2p1/3P2P1/P1r1P3/2N2P2/1P1K3P/R6R b - - 0 1',
    solution: ['b5', 'axb5', 'axb5', 'Ra7', 'b4'],
    difficulty: 'Hard',
    description: "Pawn Promotion Push"
  },
  {
    id: 'm3-3',
    fen: 'r3r3/pp3p1k/3p2pp/2pP4/2P1P2q/2N2b1P/PP1Q1P1K/R5R1 b - - 0 1',
    solution: ['Rxe4', 'Nxe4', 'Qxe4'],
    difficulty: 'Hard',
    description: "Exchange Sacrifice"
  }
];
