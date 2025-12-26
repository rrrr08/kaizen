
export enum PlayJourney {
  HOME = 'HOME',
  TOGETHER = 'TOGETHER',
  OCCASIONS = 'OCCASIONS',
  BELONG = 'BELONG'
}

export interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  players: string;
  mood: string[];
  badges: string[];
  image: string;
  story: string;
  howToPlay: string[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  countdown: number; // seconds from now
}

export interface UserState {
  tokens: number;
  level: number;
  unlockedVault: boolean;
}
