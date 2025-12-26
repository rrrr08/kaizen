import { Product, GameEvent, Experience } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: "Dead Man's Deck",
    price: 899,
    description: "The ultimate pirate-themed strategy card game.",
    story: "Legend has it, this deck was found in a sunken galley, sealed in a treasure chest. The cards within tell tales of legendary pirates and their greatest heists.",
    howToPlay: "Draw cards, build your pirate crew, and sink your opponents' ships. Outwit your rivals with cunning strategies.",
    players: "2-6 Players",
    occasion: ["Party", "Game Night"],
    mood: "Competitive",
    image: "https://picsum.photos/seed/pirate/600/400",
    badges: ["Best Seller", "Crowd Favorite"]
  },
  {
    id: '2',
    name: "Mehfil",
    price: 1299,
    description: "A game of poetry, wits, and storytelling.",
    story: "Inspired by the royal courts of old, Mehfil brings the art of conversation and couplet back into the modern world.",
    howToPlay: "Use the prompt cards to weave stories or finish couplets. Let your creativity shine as you engage with other players.",
    players: "4-12 Players",
    occasion: ["Family", "Festivals"],
    mood: "Relaxed",
    image: "https://picsum.photos/seed/story/600/400",
    badges: ["Social", "Creative"]
  },
  {
    id: '3',
    name: "Tamasha",
    price: 1099,
    description: "High-energy charades with a twist.",
    story: "The circus is in town, and you are the star! Perform wacky challenges while your teammates guess.",
    howToPlay: "Perform challenging prompts while your team guesses the secret word. The more animated, the more fun!",
    players: "4+ Players",
    occasion: ["Party", "Active"],
    mood: "Hilarious",
    image: "https://picsum.photos/seed/circus/600/400",
    badges: ["Energy Packed"]
  },
  {
    id: '4',
    name: "Buzzed",
    price: 799,
    description: "The party game that gets you... well, buzzed.",
    story: "Designed for late nights and loud laughs with friends who know how to have a good time.",
    howToPlay: "Read the card, follow the instruction. Simple, chaotic, and absolutely hilarious.",
    players: "3-20 Players",
    occasion: ["Party", "Adults Only"],
    mood: "Party Mode",
    image: "https://picsum.photos/seed/party/600/400",
    badges: ["Adults Only", "Fast Paced"]
  },
  {
    id: '5',
    name: "One More Round (150 pcs)",
    price: 599,
    description: "A versatile card game with 150 unique pieces.",
    story: "One More Round is built for those who always want to keep playing, with endless combinations.",
    howToPlay: "Mix and match cards from the collection to create custom game rules and experiences.",
    players: "2-8 Players",
    occasion: ["Game Night"],
    mood: "Strategic",
    image: "https://picsum.photos/seed/cards/600/400",
    badges: ["Expandable"]
  },
  {
    id: '6',
    name: "Dreamer's Fair (36 pcs)",
    price: 499,
    description: "A whimsical collection of 36 cards.",
    story: "Perfect for the dreamers, the imaginative, and those who love fortune-telling games.",
    howToPlay: "Use the cards for storytelling, predictions, or as a foundation for other games.",
    players: "1-6 Players",
    occasion: ["Family", "Relaxation"],
    mood: "Whimsical",
    image: "https://picsum.photos/seed/dream/600/400",
    badges: ["Solo Friendly"]
  },
  {
    id: '7',
    name: "The Bloody Inheritance (Murder Mystery)",
    price: 1299,
    description: "An immersive murder mystery board game.",
    story: "A wealthy lord has been murdered. Gather the suspects, investigate clues, and uncover the truth.",
    howToPlay: "Role-play as investigators, suspects, or witnesses. Solve the mystery before time runs out.",
    players: "4-8 Players",
    occasion: ["Party", "Mystery Night"],
    mood: "Thrilling",
    image: "https://picsum.photos/seed/mystery/600/400",
    badges: ["Immersive", "Story-Driven"]
  },
  {
    id: '8',
    name: "Judge Me & Guess",
    price: 649,
    description: "A hilarious game of judgment and prediction.",
    story: "How well do you know your friends? Judge them and see if others agree with your assessment.",
    howToPlay: "Players make predictions about each other, then see who was right. Laughter guaranteed.",
    players: "3-12 Players",
    occasion: ["Party", "Ice Breaker"],
    mood: "Funny",
    image: "https://picsum.photos/seed/judge/600/400",
    badges: ["Social"]
  },
  {
    id: '9',
    name: "She Dare Mayhem (Bachelorette Edition)",
    price: 799,
    description: "The ultimate bachelorette party game.",
    story: "Designed for celebrations, this game is all about dares, challenges, and creating unforgettable memories.",
    howToPlay: "Accept dares, complete challenges, and earn points. The more daring, the more rewarding.",
    players: "4-20 Players",
    occasion: ["Party", "Celebrations"],
    mood: "Daring",
    image: "https://picsum.photos/seed/dare/600/400",
    badges: ["Party Essential"]
  },
  {
    id: '10',
    name: "Court52 - Pickleball Card Game",
    price: 549,
    description: "A strategic card game inspired by pickleball.",
    story: "Bring the sport's competitive spirit to your card table with this fast-paced game.",
    howToPlay: "Play cards to win points on the court. Strategy meets luck in this engaging game.",
    players: "2-4 Players",
    occasion: ["Game Night"],
    mood: "Competitive",
    image: "https://picsum.photos/seed/court/600/400",
    badges: ["Sports Themed"]
  },
  {
    id: '11',
    name: "Buzzed",
    price: 799,
    description: "The party game that gets you... well, buzzed.",
    story: "A classic for those who know how to have a good time.",
    howToPlay: "Read the card, follow the instruction. Simple, chaotic, fun.",
    players: "3-20 Players",
    occasion: ["Party"],
    mood: "Party Mode",
    image: "https://picsum.photos/seed/party2/600/400",
    badges: ["Fast Paced"]
  }
];

export const EVENTS: GameEvent[] = [
  {
    id: 'e1',
    title: "The Grand Opening Soiree",
    datetime: new Date("2026-01-15T19:00:00Z"),
    location: "The Heritage Manor, Downtown",
    price: 599,
    description: "Join us for an exclusive evening of curated board games, networking, and revelry. Experience Joy Juncture's signature atmosphere with fellow game enthusiasts.",
    image: "https://picsum.photos/seed/event1/800/400",
    capacity: 100,
    registered: 67,
    createdAt: new Date("2025-12-01T10:00:00Z"),
    updatedAt: new Date("2025-12-10T14:30:00Z")
  },
  {
    id: 'e2',
    title: "Masterclass: Game Design Workshop",
    datetime: new Date("2026-01-22T11:00:00Z"),
    location: "The Creative Hub, City Center",
    price: 0,
    description: "Learn how to design engaging games from industry experts. Hands-on session covering mechanics, balance, and playtesting.",
    image: "https://picsum.photos/seed/workshop/800/400",
    capacity: 40,
    registered: 32,
    createdAt: new Date("2025-11-20T09:15:00Z"),
    updatedAt: new Date("2025-12-05T11:45:00Z")
  },
  {
    id: 'e3',
    title: "Friday Night Tournament Series",
    datetime: new Date("2026-01-17T18:00:00Z"),
    location: "Joy Juncture Studio",
    price: 299,
    description: "Competitive gameplay across multiple titles. Winners take home exclusive prizes and VIP points.",
    image: "https://picsum.photos/seed/tournament/800/400",
    capacity: 50,
    registered: 45,
    createdAt: new Date("2025-11-25T13:20:00Z"),
    updatedAt: new Date("2025-12-12T16:10:00Z")
  },
  {
    id: 'e4',
    title: "Family Game Night",
    datetime: new Date("2026-01-18T17:00:00Z"),
    location: "Community Center",
    price: 199,
    description: "Bring the whole family for a relaxed evening of games, snacks, and fun. Perfect for all ages.",
    image: "https://picsum.photos/seed/family/800/400",
    capacity: 60,
    registered: 38,
    createdAt: new Date("2025-11-28T15:45:00Z"),
    updatedAt: new Date("2025-12-08T10:20:00Z")
  },
  {
    id: 'e5',
    title: "Corporate Team Building Experience",
    datetime: new Date("2026-02-01T15:00:00Z"),
    location: "Luxury Business Lounge",
    price: 1299,
    description: "Custom corporate event with tailored games and team-building activities. Includes catering and dedicated facilitator.",
    image: "https://picsum.photos/seed/corporate/800/400",
    capacity: 120,
    registered: 0,
    createdAt: new Date("2025-12-05T09:00:00Z"),
    updatedAt: new Date("2025-12-05T09:00:00Z")
  },
  {
    id: 'e6',
    title: "Puzzle & Riddles Championship",
    datetime: new Date("2026-02-10T19:00:00Z"),
    location: "Joy Juncture Studio",
    price: 399,
    description: "Test your mental acuity against fellow puzzle enthusiasts. Multiple rounds of increasing difficulty.",
    image: "https://picsum.photos/seed/puzzle/800/400",
    capacity: 45,
    registered: 29,
    createdAt: new Date("2025-11-30T12:30:00Z"),
    updatedAt: new Date("2025-12-09T14:15:00Z")
  },
  // PAST EVENTS (for variety)
  {
    id: 'e7',
    title: "Vintage Board Game Retro Night",
    datetime: new Date("2025-12-10T18:30:00Z"),
    location: "Retro Arcade Lounge",
    price: 349,
    description: "A nostalgic journey through classic board games from the 80s and 90s.",
    image: "https://picsum.photos/seed/vintage/800/400",
    capacity: 80,
    registered: 72,
    createdAt: new Date("2025-10-15T11:00:00Z"),
    updatedAt: new Date("2025-12-11T09:45:00Z")
  },
  {
    id: 'e8',
    title: "Strategy Games Workshop",
    datetime: new Date("2025-11-25T14:00:00Z"),
    location: "Strategy Club House",
    price: 0,
    description: "Master the art of strategy games with expert guidance and practice sessions.",
    image: "https://picsum.photos/seed/strategy/800/400",
    capacity: 35,
    registered: 35,
    createdAt: new Date("2025-10-10T14:20:00Z"),
    updatedAt: new Date("2025-11-26T10:30:00Z")
  },
  {
    id: 'e9',
    title: "Charity Game Marathon",
    datetime: new Date("2025-12-03T12:00:00Z"),
    location: "Joy Juncture Main Hall",
    price: 0,
    description: "24-hour game marathon to raise funds for children's education.",
    image: "https://picsum.photos/seed/charity/800/400",
    capacity: 150,
    registered: 128,
    createdAt: new Date("2025-09-20T08:45:00Z"),
    updatedAt: new Date("2025-12-04T18:20:00Z")
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: 'ex1',
    category: 'Corporate Engagement',
    title: 'Team Building Extravaganza',
    description: 'Custom team-building experiences with curated games and challenges designed to strengthen bonds and boost morale.',
    image: 'https://picsum.photos/seed/team/600/400',
    details: [
      'Tailored game selection based on team size and objectives',
      'Professional facilitation throughout the event',
      'Custom scoring and leaderboard systems',
      'Catering and refreshments included',
      'Team merchandise packages available'
    ]
  },
  {
    id: 'ex2',
    category: 'Weddings',
    title: 'Reception Entertainment & Games',
    description: 'Transform your wedding celebration with interactive games, entertainment, and unique experiences for guests.',
    image: 'https://picsum.photos/seed/wedding/600/400',
    details: [
      'Pre-reception games for guest arrivals',
      'Themed game stations throughout venue',
      'Couple vs. guests competitions',
      'Photo opportunities with game themes',
      'Custom trophies and awards'
    ]
  },
  {
    id: 'ex3',
    category: 'Private Birthdays',
    title: 'Birthday Celebration Package',
    description: 'Personalized birthday experiences with theme-based games, decorations, and unforgettable memories.',
    image: 'https://picsum.photos/seed/birthday/600/400',
    details: [
      'Age-appropriate game selection',
      'Themed decorations and setups',
      'Birthday person custom challenges',
      'Group photo sessions',
      'Personalized scorecards'
    ]
  },
  {
    id: 'ex4',
    category: 'Carnivals & Game Zones',
    title: 'Large-Scale Experience Zones',
    description: 'Create immersive game zones and carnival experiences with multiple stations and interactive elements.',
    image: 'https://picsum.photos/seed/carnival/600/400',
    details: [
      'Multi-station game setups',
      'Interactive challenges throughout venue',
      'Staff for each game station',
      'Leaderboard systems and prizes',
      'Customizable themes and branding'
    ]
  },
  {
    id: 'ex5',
    category: 'Monthly Corporate Kits',
    title: 'Ready-to-Play Corporate Programs',
    description: 'Monthly refreshed game packages for ongoing corporate engagement and employee wellness programs.',
    image: 'https://picsum.photos/seed/corporate2/600/400',
    details: [
      'New games delivered monthly',
      'Staff training and support',
      'Flexible scheduling',
      'Analytics and engagement tracking',
      'Custom branding options'
    ]
  }
];

export const GAMES = [
  {
    id: 'game1',
    title: 'Sudoku (25+ Variations)',
    category: 'Puzzles',
    description: 'Challenge yourself with multiple difficulty levels of classic Sudoku.',
    points: 10
  },
  {
    id: 'game2',
    title: 'Riddles & Brain Teasers',
    category: 'Riddles',
    description: 'Test your wit with carefully crafted riddles and brain teasers.',
    points: 15
  },
  {
    id: 'game3',
    title: 'Daily Puzzle Challenge',
    category: 'Puzzles',
    description: 'A new puzzle every day with increasing complexity.',
    points: 20
  }
];

export const TESTIMONIALS = [
  {
    id: '1',
    author: 'Sarah M.',
    text: 'Joy Juncture transformed our team building! We\'ve never laughed so hard together.',
    occasion: 'Corporate Team',
    image: 'https://picsum.photos/seed/person1/100/100'
  },
  {
    id: '2',
    author: 'Marcus L.',
    text: 'The games are exceptional quality and brought our entire family together.',
    occasion: 'Family Game Night',
    image: 'https://picsum.photos/seed/person2/100/100'
  },
  {
    id: '3',
    author: 'Emily R.',
    text: 'Best decision for our wedding reception. Every guest had a blast!',
    occasion: 'Wedding Reception',
    image: 'https://picsum.photos/seed/person3/100/100'
  }
];