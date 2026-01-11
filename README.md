# Joy Juncture - The Digital Playground

A modern, elegant digital platform for board games, events, experiences, and community engagement.

## About Joy

Joy Juncture is a playful, experience-driven website built around one core belief: **Games are moments, memories, and shared joy.**

## Live Demo

The website is currently running on **<http://localhost:3000>**

## Key Features

- **Game Shop** - 11 curated board games with filtering
- **Live Events** - Event registration and management
- **Custom Experiences** - Corporate, weddings, celebrations
- **Free Games** - Online sudoku, riddles, puzzles with points (Chess, Wordle, etc.)
- **Community** - Rewards, leaderboards, testimonials
- **Elegant Design** - Neo-Brutalist theme (`neo-border`, `neo-shadow`), smooth animations (`framer-motion`), fully responsive

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Backend/Auth**: Firebase (Auth, Firestore)
- **UI Components**: Radix UI, Lucide React
- **Animations**: Framer Motion

## Getting Started

```bash
cd d:\CODING\kaizen
pnpm install
pnpm dev
```

Visit **<http://localhost:3000>**

## Recent Updates (January 2026)

- **Homepage Improvements**:
  - "Start Earning Now" button now conditionally redirects signed-in users to `/play`.
  - Fixed broken `/events` link to `/events/upcoming`.
- **Game Mechanics**: Implemented "Game of the Day" rotation logic (randomizes from today's scheduled games).
- **Stability Fixes**:
  - Resolved `AuthContext` race condition that was resetting Admin privileges.
  - Fixed build errors in Admin Experience pages (`ImageUpload` props).

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Fast setup guide
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Complete documentation

## Content

- **11 Games** - Curated board games
- **6 Events** - Upcoming events
- **5 Experiences** - Custom offerings
- **Leaderboard** - Top players
- **Testimonials** - Community feedback

## All Requirements Met

 Clear business verticals
 Complete games store with product pages
 Gamification system
 Beautiful, playful design
 Mobile-responsive
 Ready for backend integration

## Project Status

 **Complete & Live** on <http://localhost:3000>

Updated JANUARY 2026
