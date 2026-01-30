
import { HomepageContent } from '@/lib/types';

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero: {
    title: "LEVEL UP",
    subtitle: "YOUR GAME",
    ctaTextShops: "My Stats",
    ctaTextJoin: "Play Now",
    backgroundImage: "/default-hero.jpg"
  },
  heroShopper: {
    title: "CURATED",
    subtitle: "FOR YOU",
    ctaTextShops: "Start Shopping",
    ctaTextJoin: "View Drops"
  },
  heroSocial: {
    title: "Welcome to Joy Juncture",
    subtitle: "At Joy Juncture, we believe in analog connection for a digital world. Discover amazing board games, events, and community moments at joy-juncture.com.",
    ctaTextShops: "Join Game Night",
    ctaTextJoin: "Shop Games",
    backgroundImage: "/hero-image.png"
  },
  playStyle: {
    playAtHome: {
      title: "Play at Home",
      description: "Shop premium board games and puzzles for your home collection",
      emoji: "Home",
      images: [
        'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&q=80&w=800'
      ]
    },
    playTogether: {
      title: "Play Together",
      description: "Join live game nights and community events in your city",
      emoji: "Users",
      images: [
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800'
      ]
    },
    playOccasions: {
      title: "Play for Occasions",
      description: "Book custom game experiences for weddings, parties & corporate events",
      emoji: "PartyPopper",
      images: [
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800'
      ]
    },
    playEarn: {
      title: "Play & Earn Points",
      description: "Play free puzzles daily and earn rewards you can redeem",
      emoji: "Gamepad2",
      images: [
        'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1511512578047-926c369dd443?auto=format&fit=crop&q=80&w=800'
      ]
    }
  },
  featuredGames: [
    {
      id: "1",
      title: 'Catan',
      tagline: 'Build. Trade. Settle.',
      image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=1200',
      players: '3-4',
      time: '60-90 min',
      mood: 'Strategic',
      badge: 'BESTSELLER',
      color: 'bg-[#FFD93D]'
    },
    {
      id: "2",
      title: 'Codenames',
      tagline: 'Think. Connect. Win.',
      image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=1200',
      players: '4-8',
      time: '15-30 min',
      mood: 'Party',
      badge: 'HOT',
      color: 'bg-[#6C5CE7]'
    },
    {
      id: "3",
      title: 'Azul',
      tagline: 'Pattern. Beauty. Victory.',
      image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=1200',
      players: '2-4',
      time: '30-45 min',
      mood: 'Elegant',
      badge: 'AWARD WINNER',
      color: 'bg-[#00B894]'
    }
  ],
  gamification: {
    sampleBalance: 1250,
    activities: [
      { name: "Daily Puzzle", xp: 100 },
      { name: "Refer a Friend", xp: 500 },
      { name: "First Purchase", xp: 1000 }
    ],
    rewards: [
      { xp: 5000, reward: "Free Board Game" },
      { xp: 2500, reward: "20% Off Coupon" },
      { xp: 1000, reward: "Coffee Mug" }
    ]
  },
  activePuzzles: [
    {
      id: "chess-daily",
      title: "Daily Chess Puzzle",
      xp: 150,
      url: "/play/chess",
      isLive: true,
      description: "Solve in 3 moves"
    },
    {
      id: "sudoku-hard",
      title: "Hard Sudoku",
      xp: 300,
      url: "/play/sudoku",
      isLive: true,
      description: "Brain teaser"
    }
  ],
  dailyDrops: [
    {
      id: "daily-chess",
      type: "game",
      title: "Win 1 Chess Game",
      subtitle: "Daily Challenge",
      xp: 500,
      actionUrl: "/play/chess",
      highlightColor: "bg-[#FF7675]"
    },
    {
      id: "flash-deal-1",
      type: "product",
      title: "20% Off Hoodies",
      subtitle: "Flash Deal",
      ctaText: "CLAIM",
      actionUrl: "/shop",
      highlightColor: "bg-[#00B894]"
    }
  ],
  faqs: [
    {
      question: "What is Joy Juncture?",
      answer: "We are a curated marketplace for premium board games, puzzles, and community experiences using gamification to reward your passion."
    },
    {
      question: "How do I earn JP (Joy Points)?",
      answer: "You earn JP by playing daily puzzles, spinning the wheel, referring friends, and purchasing items. JP can be redeemed for discounts and exclusive rewards."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we ship across India. We plan to expand to international shipping soon. Stay tuned!"
    },
    {
      question: "What is the return policy?",
      answer: "We offer a 7-day return policy for damaged or incorrect items. Please record an unboxing video for smooth processing."
    }
  ]
};
