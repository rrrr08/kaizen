export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  story: string;
  howToPlay: string;
  players: string;
  occasion: string[];
  mood: string;
  image: string;
  badges: string[];
}

export interface GameEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  description: string;
  image: string;
  capacity: number;
  registered: number;
}

export interface Experience {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  details: string[];
}

export interface UserProfile {
  name: string;
  points: number;
  wallet: number;
  history: { date: string; points: number; activity: string }[];
}

export enum Page {
  Home = 'home',
  Shop = 'shop',
  Experiences = 'experiences',
  Play = 'play',
  Events = 'events',
  Community = 'community',
  ProductDetail = 'product-detail',
  About = 'about'
}
