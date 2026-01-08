import SnakeGame from '@/components/games/SnakeGame';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Snake Game',
    description: 'Play the classic Snake game. Eat food, grow longer, and avoid hitting yourself!',
};

export default function SnakePage() {
    return (
        <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px' }}>
            <SnakeGame />
        </div>
    );
}
