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
  time?: string;
}

export interface GameEvent {
  id: string;
  title: string;
  datetime: Date;
  location: string;
  price: number;
  description: string;
  image?: string;
  capacity: number;
  registered: number;
  createdAt: Date;
  updatedAt: Date;

  // 👇 past-only enrichments
  highlights?: EventHighlight[];
  gallery?: string[];
  testimonials?: EventTestimonial[];
}


export interface EventHighlight {
  icon?: string; // optional emoji or icon key
  text: string;
}

export interface EventTestimonial {
  name: string;
  role?: string;
  quote: string;
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

  // Gamification & Economy
  points?: number; // @deprecated use balance (JP)
  wallet?: number; // @deprecated use balance (JP)

  balance: number; // Joy Points (JP) - Spendable
  xp: number;      // Experience Points (XP) - Status/Tier

  streak?: {
    count: number;
    last_active_date: string; // ISO Date string
    freeze_count: number;
  };

  daily_stats?: {
    last_spin_date?: string; // ISO Date string
    eggs_found: number;
    last_egg_date?: string; // To reset egg count daily
  };

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

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  totalPoints: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface Wallet {
  userId: string;
  totalPoints: number;
  history: WalletTransaction[];
  isFirstTimeCustomer?: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'earn' | 'redeem';
  points: number;
  reason: string; // 'purchase', 'event_registration', 'online_game', 'referral', 'first_time_bonus'
  orderId?: string;
  eventId?: string;
  createdAt: Date;
}

/* Gamification Types */
export interface GamificationConfig {
  pointsPerRupee: number; // Base rate: how many points per rupee spent
  firstTimeBonusPoints: number; // Bonus for first purchase
  firstTimeThreshold: number; // Min purchase amount to get first-time bonus
  bonusRules: BonusRule[];
  redeemRate: number; // How many rupees worth 1 point is (e.g., 0.5 = 1 point = 0.5 rupees)
  maxRedeemPercent: number; // Max % of order total that can be paid with points (e.g., 50)
  referralBonus: number; // Points for referral
  birthdayBonus: number; // Points on birthday
  levelThresholds: LevelThreshold[];
}

export interface BonusRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'milestone' | 'seasonal' | 'tier';
  active: boolean;
  description: string;

  // For percentage & fixed
  bonusPoints?: number;
  minPurchaseAmount?: number;

  // For milestone
  purchaseCount?: number;

  // For seasonal
  startDate?: string;
  endDate?: string;

  // For tier
  minAmount?: number;
  maxAmount?: number;

  applicableCategories?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LevelThreshold {
  level: number;
  minPoints: number;
  benefits: string[];
  multiplier: number; // Points multiplier for this level
  badgeColor?: string;
}

export interface CustomerGamificationData {
  userId: string;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentLevel: number;
  isFirstTimeCustomer: boolean;
  purchaseCount: number;
  lastPurchaseDate?: string;
  referralCode?: string;
  referrals: number;
  birthdayDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* Push Notification Types */
export interface PushNotificationCampaign {
  id: string;
  title: string;
  message: string;
  description?: string;
  image?: string;
  icon?: string;
  actionUrl?: string;
  actionType: 'navigate' | 'deeplink' | 'external';
  recipientSegment: 'all' | 'first-time' | 'loyal' | 'inactive' | 'custom';
  customFilters?: {
    minSpending?: number;
    maxSpending?: number;
    purchaseCount?: number;
    lastPurchaseDaysAgo?: number;
    levels?: number[];
  };
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  sentAt?: Date;
  priority: 'high' | 'normal';
  ttl?: number;
  recipientCount: number;
  deliveredCount: number;
  failedCount: number;
  interactionCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDeviceToken {
  id: string;
  userEmail: string;
  deviceToken: string;
  deviceType: 'web' | 'ios' | 'android';
  deviceName: string;
  isActive: boolean;
  registeredAt: Date;
  lastUsedAt: Date;
  deactivatedAt?: Date;
}

export interface PushNotificationActivity {
  id: string;
  campaignId: string;
  userEmail: string;
  deviceId: string;
  deviceToken: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'clicked';
  sentAt?: Date;
  deliveredAt?: Date;
  clickedAt?: Date;
  failureReason?: string;
  createdAt: Date;
}

export interface UserNotificationPreferences {
  userEmail: string;
  pushEnabled: boolean;
  categories: {
    promotional: boolean;
    offers: boolean;
    ordersShipping: boolean;
    gamification: boolean;
    announcements: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
    timezone: string; // "Asia/Kolkata"
  };
  frequency: 'all' | 'daily' | 'weekly' | 'none';
  updatedAt: Date;
}

export interface InAppNotification {
  id: string;
  userEmail: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'offer';
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
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