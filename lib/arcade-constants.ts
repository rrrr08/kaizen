
import { Game, Event } from './arcade-types';

export const COLORS = {
  black: '#000000',
  orange: '#FF8C00',
  yellow: '#FFD400',
  white: '#FFFFFF',
  grey: '#1A1A1A'
};

export const MOCK_GAMES: Game[] = [
  {
    id: 'g1',
    title: 'NEON KNIGHTS',
    description: 'A strategy board game of cyberpunk conquest.',
    price: 45,
    players: '2-4 Players',
    mood: ['Competitive', 'Sci-Fi'],
    badges: ['Strategy Heavy', 'Best Seller'],
    image: 'https://picsum.photos/seed/neon/600/400',
    story: 'In the year 2099, the grid is your battlefield.',
    howToPlay: ['Place your nodes', 'Expand your circuit', 'Overload opponents']
  },
  {
    id: 'g2',
    title: 'JOY JUNCTURE: CARDS',
    description: 'The ultimate party game for high-energy groups.',
    price: 25,
    players: '3-10 Players',
    mood: ['Party', 'Loud'],
    badges: ['Beginner Friendly', 'Party Hit'],
    image: 'https://picsum.photos/seed/flare/600/400',
    story: 'When the sun flares, everyone loses their minds!',
    howToPlay: ['Draw a flare card', 'React instantly', 'Don\'t get burned']
  },
  {
    id: 'g3',
    title: 'CRYPTIC CORTEX',
    description: 'Cooperative puzzle solving at its finest.',
    price: 35,
    players: '1-4 Players',
    mood: ['Mystery', 'Chill'],
    badges: ['Mental Workout'],
    image: 'https://picsum.photos/seed/cortex/600/400',
    story: 'Decode the ancient brain patterns.',
    howToPlay: ['Link the synapses', 'Match the colors', 'Solve the cortex']
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'FRIDAY NIGHT FLIGHTS',
    date: 'Friday, Oct 25',
    time: '7:00 PM',
    location: 'Solar Hub Downtown',
    price: 15,
    image: 'https://picsum.photos/seed/event1/800/400',
    countdown: 3600 * 24 * 2
  },
  {
    id: 'e2',
    title: 'THE STRATEGY SUMMIT',
    date: 'Saturday, Oct 26',
    time: '2:00 PM',
    location: 'Arcade Central',
    price: 25,
    image: 'https://picsum.photos/seed/event2/800/400',
    countdown: 3600 * 48
  }
];
