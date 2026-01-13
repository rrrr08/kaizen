import { Metadata } from 'next';

// Base URL - Update this with your actual domain
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app';

// Default SEO configuration
export const defaultMetadata = {
  siteName: 'Joy Juncture',
  title: 'Joy Juncture | Playful E-commerce',
  description: 'Experience board games, events, and community engagement like never before. Shop premium board games, join exciting events, and connect with fellow gamers.',
  keywords: [
    'board games',
    'e-commerce',
    'gaming events',
    'community',
    'tabletop games',
    'game shop',
    'online gaming',
    'event registration',
    'gamification',
    'rewards'
  ],
  ogImage: '/og-image.jpg',
  twitterImage: '/twitter-image.jpg',
};

// Page-specific metadata
export const pageMetadata: Record<string, Metadata> = {
  home: {
    title: 'Joy Juncture | Playful E-commerce',
    description: 'Experience board games, events, and community engagement like never before. Shop premium board games, join exciting events, and connect with fellow gamers.',
    openGraph: {
      title: 'Joy Juncture | Playful E-commerce',
      description: 'Experience board games, events, and community engagement like never before',
      url: baseUrl,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Joy Juncture' }],
    },
  },

  shop: {
    title: 'Shop',
    description: 'Browse our collection of premium board games, card games, and tabletop experiences. Find your next favorite game at Joy Juncture.',
    keywords: ['buy board games', 'online game store', 'tabletop shop', 'card games for sale'],
    openGraph: {
      title: 'Shop Board Games | Joy Juncture',
      description: 'Browse our collection of premium board games and tabletop experiences',
      url: `${baseUrl}/shop`,
    },
  },

  events: {
    title: 'Events',
    description: 'Discover and join exciting gaming events, tournaments, and community gatherings. Connect with fellow gamers at Joy Juncture events.',
    keywords: ['gaming events', 'board game tournaments', 'community meetups', 'gaming gatherings'],
    openGraph: {
      title: 'Gaming Events | Joy Juncture',
      description: 'Join exciting gaming events and connect with the community',
      url: `${baseUrl}/events`,
    },
  },

  orders: {
    title: 'My Orders',
    description: 'View and track all your orders from Joy Juncture. Check order status, download invoices, and manage your purchases.',
    openGraph: {
      title: 'My Orders | Joy Juncture',
      description: 'Track your orders and manage your purchases',
      url: `${baseUrl}/orders`,
    },
    robots: {
      index: false, // Don't index user-specific pages
      follow: false,
    },
  },

  profile: {
    title: 'Profile',
    description: 'Manage your Joy Juncture profile, view your gaming stats, rewards, and customize your preferences.',
    openGraph: {
      title: 'My Profile | Joy Juncture',
      description: 'Manage your profile and gaming stats',
      url: `${baseUrl}/profile`,
    },
    robots: {
      index: false,
      follow: false,
    },
  },

  cart: {
    title: 'Shopping Cart',
    description: 'Review your selected items and proceed to checkout. Your gaming adventure awaits at Joy Juncture.',
    openGraph: {
      title: 'Shopping Cart | Joy Juncture',
      description: 'Review your cart and complete your purchase',
      url: `${baseUrl}/cart`,
    },
    robots: {
      index: false,
      follow: false,
    },
  },

  checkout: {
    title: 'Checkout',
    description: 'Complete your purchase securely. Fast shipping on all board games and gaming products.',
    openGraph: {
      title: 'Checkout | Joy Juncture',
      description: 'Complete your secure checkout',
      url: `${baseUrl}/checkout`,
    },
    robots: {
      index: false,
      follow: false,
    },
  },

  play: {
    title: 'Play Games',
    description: 'Play free online games including chess, riddles, sudoku, word search, and more. Earn rewards while you play at Joy Juncture.',
    keywords: ['free online games', 'play chess online', 'sudoku', 'riddles', 'word games', 'brain games'],
    openGraph: {
      title: 'Play Free Games | Joy Juncture',
      description: 'Play free games and earn rewards',
      url: `${baseUrl}/play`,
    },
  },

  rewards: {
    title: 'Rewards',
    description: 'Track your rewards, achievements, and loyalty points. Unlock exclusive benefits and discounts at Joy Juncture.',
    keywords: ['gaming rewards', 'loyalty program', 'achievement badges', 'loyalty points'],
    openGraph: {
      title: 'Rewards & Achievements | Joy Juncture',
      description: 'Track your rewards and unlock exclusive benefits',
      url: `${baseUrl}/rewards`,
    },
  },

  wallet: {
    title: 'Wallet',
    description: 'Manage your Joy Juncture wallet, view your balance, and track your transactions.',
    openGraph: {
      title: 'My Wallet | Joy Juncture',
      description: 'Manage your wallet and transactions',
      url: `${baseUrl}/wallet`,
    },
    robots: {
      index: false,
      follow: false,
    },
  },

  blog: {
    title: 'Blog',
    description: 'Read the latest gaming news, board game reviews, strategy guides, and community stories from Joy Juncture.',
    keywords: ['board game blog', 'gaming news', 'game reviews', 'strategy guides', 'gaming community'],
    openGraph: {
      title: 'Gaming Blog | Joy Juncture',
      description: 'Read gaming news, reviews, and community stories',
      url: `${baseUrl}/blog`,
    },
  },

  community: {
    title: 'Community',
    description: 'Join the Joy Juncture gaming community. Connect with players, share experiences, and participate in discussions.',
    keywords: ['gaming community', 'board game forum', 'player community', 'gaming discussion'],
    openGraph: {
      title: 'Gaming Community | Joy Juncture',
      description: 'Connect with fellow gamers and share experiences',
      url: `${baseUrl}/community`,
    },
  },

  about: {
    title: 'About Us',
    description: 'Learn about Joy Juncture - your destination for board games, gaming events, and community engagement. Discover our mission and values.',
    openGraph: {
      title: 'About Us | Joy Juncture',
      description: 'Learn about our mission to bring joy through gaming',
      url: `${baseUrl}/about`,
    },
  },

  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Joy Juncture. We\'re here to help with your questions about products, orders, events, and more.',
    openGraph: {
      title: 'Contact Us | Joy Juncture',
      description: 'Get in touch with our team',
      url: `${baseUrl}/contact`,
    },
  },

  progress: {
    title: 'My Progress',
    description: 'Track your gaming progress, achievements, and milestones at Joy Juncture.',
    openGraph: {
      title: 'My Progress | Joy Juncture',
      description: 'View your gaming progress and achievements',
      url: `${baseUrl}/progress`,
    },
    robots: {
      index: false,
      follow: false,
    },
  },

  notifications: {
    title: 'Notifications',
    description: 'View your notifications and stay updated with the latest from Joy Juncture.',
    openGraph: {
      title: 'Notifications | Joy Juncture',
      description: 'View your latest notifications',
      url: `${baseUrl}/notifications`,
    },
    robots: {
      index: false,
      follow: false,
    },
  },
};

// Helper function to generate metadata for a page
export function generatePageMetadata(pageKey: keyof typeof pageMetadata): Metadata {
  const pageMeta = pageMetadata[pageKey];

  return {
    ...pageMeta,
    keywords: pageMeta.keywords || defaultMetadata.keywords,
    openGraph: {
      siteName: defaultMetadata.siteName,
      type: 'website',
      locale: 'en_US',
      ...pageMeta.openGraph,
      images: pageMeta.openGraph?.images || [
        {
          url: defaultMetadata.ogImage,
          width: 1200,
          height: 630,
          alt: defaultMetadata.siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: (pageMeta.openGraph?.title as string) || (pageMeta.title as string) || defaultMetadata.title,
      description: (pageMeta.openGraph?.description as string) || (pageMeta.description as string) || defaultMetadata.description,
      images: [defaultMetadata.twitterImage],
    },
  };
}

// Helper for dynamic pages (products, events, etc)
export function generateDynamicMetadata(params: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'article' | 'website';
  keywords?: string[];
}): Metadata {
  return {
    title: params.title,
    description: params.description,
    keywords: params.keywords || defaultMetadata.keywords,
    openGraph: {
      siteName: defaultMetadata.siteName,
      type: params.type || 'website',
      locale: 'en_US',
      url: params.url,
      title: params.title,
      description: params.description,
      images: [
        {
          url: params.image || defaultMetadata.ogImage,
          width: 1200,
          height: 630,
          alt: params.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      images: [params.image || defaultMetadata.twitterImage],
    },
  };
}
