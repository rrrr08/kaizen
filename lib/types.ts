import { Timestamp, serverTimestamp } from "firebase/firestore";

export interface UserProfile {
  id?: string;
  email?: string | null;
  name?: string;
  first_name?: string;
  last_name?: string;
  photoURL?: string | null;
  avatar_url?: string | null;
  role?: "member" | "admin" | string;
  likedBlogs?: string[];
  activity?: any[];
  blogCount?: number;
  created_at?: Timestamp | Date | string | ReturnType<typeof serverTimestamp>;
  updated_at?: Timestamp | Date | string | ReturnType<typeof serverTimestamp>;
  last_sign_in_at?: Timestamp | Date | string | ReturnType<typeof serverTimestamp>;
  avatarSeed?: string;
  display_name?: string;
  [key: string]: any;
}

export interface ChatMessage {
  id?: string;
  timestamp?: Date | Timestamp | string;
  date?: Date | Timestamp | string;
  content?: string;
  message?: string;
  role: "user" | "assistant" | "system" | string;
  attachedFiles?: any[];
}

export interface Conversation {
  id: string;
  user_id: string;
  user_email?: string;
  messages?: ChatMessage[];
  difyConversationId?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface Product {
    id?: string;
    price: string | number;
    stock: string | number;
    createdAt?: any;
    updatedAt?: any;
    [key: string]: any;
}
