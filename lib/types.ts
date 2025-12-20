export interface Product {
  id: string;
  name: string;
  price: number;
  stock?: number;
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
  id?: string;
  email: string | null;
  name: string;
  first_name?: string;
  last_name?: string;
  photoURL?: string | null;
  avatar_url?: string | null;
  avatarSeed?: string;
  role?: string;
  onboardingCompleted?: boolean;
  likedBlogs?: string[];
  activity?: any[];
  blogCount?: number;
  created_at?: any;
  updated_at?: any;
  last_sign_in_at?: any;
  points?: number;
  wallet?: number;
  history?: { date: string; points: number; activity: string }[];
}

export interface ChatMessage {
  id?: string;
  content: string;
  role: string;
  timestamp: Date;
  attachedFiles?: string[];
}

export interface Conversation {
  id: string;
  user_id: string;
  user_email: string;
  messages?: any[];
  difyConversationId?: string;
  createdAt: Date;
  updatedAt: Date;
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
