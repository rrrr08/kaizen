export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  story?: string;
  price: number;
  cost?: number;
  stock?: number;
  category?: string;
  image: string;
  images?: string[];
  rating?: number;
  sales?: number;
  minPlayers?: number;
  maxPlayers?: number;
  players?: string;
  ageGroup?: string;
  occasion?: string[];
  mood?: string;
  badges?: string[];
  time?: string;
  features?: { title: string; description: string }[];
  howToPlay?: { title: string; description: string }[] | string;
  boxContent?: string;
}

export interface GameEvent {
  id: string;
  title: string;
  datetime: Date;
  location: string;
  price: number;
  description: string;
  image?: string;
  category: 'Workshop' | 'Game Night' | 'Other';
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

export interface Testimonial {
  id: string;
  name: string;
  role: string; // "Corporate Team", "Family", etc. (Using 'role' instead of 'occasion' to match existing code style, or map it) - actually the UI uses 'occasion'. Let's stick to the UI.
  quote: string;
  image?: string;
  avatarSeed?: string; // For multiavatar
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string | Date; // ISO string or Date
}

// Keeping EventTestimonial for backward compatibility if needed, or we can unify. 
// EventTestimonial was: { name, role, quote }. 
// Let's use the new Testimonial for the main page.

export interface EventTestimonial {
  userId: string;
  name: string;
  rating?: number;
  comment?: string;
  edited?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Experience {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  details: string[];
}

// Experience Category Types
export interface ExperienceCategory {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  image: string;
  whoFor: string;
  problemsSolved: string[];
  gamesFormats: string[];
  imageGallery: string[];
  testimonials: ExperienceTestimonial[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceTestimonial {
  id: string;
  author: string;
  text: string;
  occasion?: string;
  image?: string;
}

export interface ExperienceEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userId?: string; // Optional - for authenticated users
  categoryId: string;
  categoryName: string;
  occasionDetails: string;
  audienceSize: string;
  preferredDateRange: string;
  budgetRange: string;
  specialRequirements?: string;
  message?: string;
  status: EnquiryStatus;
  internalNotes?: string;
  adminReply?: string;
  repliedAt?: Date;
  finalPrice?: number; // Price set by admin for confirmation
  createdAt: Date;
  updatedAt: Date;
}

export type EnquiryStatus =
  | 'new'
  | 'contacted'
  | 'in_discussion'
  | 'confirmed'
  | 'completed'
  | 'archived';

export interface ExperienceCaseStudy {
  id: string;
  enquiryId: string;
  categoryId: string;
  title: string;
  description: string;
  photos: string[];
  testimonial: ExperienceTestimonial;
  published: boolean;
  createdAt: Date;
}

export interface UserProfile {
  id?: string;
  email: string | null;
  name: string;
  first_name?: string;
  last_name?: string;
  photoURL?: string | null;
  avatar_url?: string | null;
  phoneNumber?: string;
  phoneVerified?: boolean;
  avatarSeed?: string;
  role?: string;
  checkoutInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  isBanned?: boolean;
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

  game_xp?: number; // XP earned specifically from games (for leaderboard)
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

// Community & Chat Types
export interface CommunityThread {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'announcement' | 'qna';
  createdBy: string; // Admin ID
  isLocked: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
  lastMessageAt?: any;
  messageCount: number;
}

export interface EventChatRoom {
  id: string; // Could be same as eventId or unique
  eventId: string;
  eventTitle: string;
  isActive: boolean;
  createdAt: any;
}

// Unified Message Type
export interface CommunityMessage {
  id: string;
  threadId?: string;
  chatRoomId?: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: 'admin' | 'member';
  senderTier?: string; // e.g. 'Gold Crown', 'Strategist'
  timestamp: any; // Firestore Timestamp
  replyToId?: string;
  isFlagged?: boolean; // For censorship
}

// Daily Quest / Drop Type
export interface DailyQuest {
  id: string;
  type: 'game' | 'product';
  title: string;
  subtitle: string;
  xp?: number;
  actionUrl: string;
  icon?: string;
  ctaText?: string;
  highlightColor: string;
}

// Homepage Content Types
export interface HeroContent {
  title: string;
  subtitle: string;
  ctaTextShops: string;
  ctaTextJoin: string;
  backgroundImage?: string;
}

export interface HomepageContent {
  hero: HeroContent; // Default (Gamer)
  heroShopper?: HeroContent;
  heroSocial?: HeroContent;
  playStyle?: {
    playAtHome: PlayStyleItem;
    playTogether: PlayStyleItem;
    playOccasions: PlayStyleItem;
    playEarn: PlayStyleItem;
  };
  featuredGames?: FeaturedGame[];
  gamification?: {
    sampleBalance: number;
    activities: Array<{ name: string; xp: number; }>;
    rewards: Array<{ xp: number; reward: string; }>;
  };
  activePuzzles?: PuzzleItem[];
  dailyDrops?: DailyQuest[];
  proofOfJoy?: {
    photos?: Array<{ title: string; subtitle: string; emoji: string; }>;
    testimonials?: Array<{ title: string; subtitle: string; emoji: string; }>;
  };
}

export interface PlayStyleItem {
  title: string;
  description: string;
  emoji: string;
}

export interface FeaturedGame {
  id: string | number;
  title: string;
  tagline: string;
  image: string;
  players: string;
  time: string;
  mood: string;
  badge: string;
  color: string;
}

export interface PuzzleItem {
  id: string;
  title: string;
  xp: number;
  url: string;
  isLive: boolean;
  description?: string;
}
