import MinesweeperGame from '@/components/games/MinesweeperGame';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Minesweeper',
    description: 'Play the classic Minesweeper game. Clear the board without hitting any mines!',
};

export default function MinesweeperPage() {
    return (
        <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px' }}>
            <MinesweeperGame />
        </div>
    );
}
