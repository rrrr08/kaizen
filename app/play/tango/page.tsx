import TangoGame from '@/components/games/TangoGame';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tango (Breakout)',
    description: 'Play the classic brick-breaking game. Control the paddle and break all the bricks!',
};

export default function TangoPage() {
    return (
        <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px' }}>
            <TangoGame />
        </div>
    );
}
