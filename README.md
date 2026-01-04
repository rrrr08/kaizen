# 🎮 Joy Juncture - The Digital Playground

> **A modern, full-stack gamification platform for board games, events, experiences, and community engagement.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🌟 About Joy Juncture

Joy Juncture is an experience-driven platform built around one core belief: **Games are moments, memories, and shared joy.** It combines e-commerce, event management, gamification, and community features into one seamless digital experience.

### ✨ Key Highlights

- **🏪 Game Shop** - 11+ curated board games with smart filtering and real-time inventory
- **📅 Live Events** - Event registration, ticketing, and payment integration
- **🎉 Custom Experiences** - Corporate events, weddings, celebrations
- **🎯 Free Games** - Sudoku, riddles, puzzles, wheel of fortune with XP/JP rewards
- **🏆 Gamification** - Dual-currency system (XP + Joy Points) with tier-based multipliers
- **👥 Community** - Leaderboards, testimonials, progress tracking
- **🔔 Smart Notifications** - Multi-channel (Push, SMS, Email, In-App) with quiet hours
- **💳 Payment Integration** - Razorpay with wallet redemption
- **🎨 Elegant Design** - Dark theme, smooth animations, fully responsive

---

## 🚀 Live Demo

- **Production**: [https://your-domain.vercel.app](https://your-domain.vercel.app)
- **Local**: [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 + Custom Components
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Services
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth (Email/Password, Google OAuth)
- **Storage**: Firebase Storage + Cloudinary (optional)
- **Payments**: Razorpay
- **Notifications**: 
  - Push: Firebase Cloud Messaging (FCM)
  - SMS: Twilio
  - Email: Gmail SMTP
  - In-App: Custom implementation

### Infrastructure
- **Hosting**: Vercel (recommended) / Railway / Netlify
- **CDN**: Vercel Edge Network
- **CI/CD**: GitHub Actions (optional)

---

## 📦 Installation

### Prerequisites

- **Node.js**: >= 18.x
- **npm** / **pnpm** / **yarn**
- **Firebase Project**: [Create one here](https://console.firebase.google.com/)
- **Razorpay Account**: [Sign up here](https://razorpay.com/)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/kaizen.git
cd kaizen

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment variables (see Configuration section)
nano .env.local

# 5. Inject Firebase config into service worker
node scripts/inject-firebase-config.js

# 6. Run development server
npm run dev

# 7. Open browser
# Visit http://localhost:3000
```

---

## ⚙️ Configuration

### 1. Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable services:
   - **Authentication** → Email/Password + Google
   - **Firestore Database** → Start in production mode
   - **Storage** → Default rules
   - **Cloud Messaging** → Generate VAPID key
3. Get credentials from **Project Settings**
4. Download **Service Account Key** (JSON file)

### 2. Environment Variables

Create `.env.local` from `.env.example` and fill in your values:

```env
# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... (see .env.example for full list)

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
# ... (see .env.example for full list)

# Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

# Notifications (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

### 3. Firebase Service Worker

Run this **before** starting the dev server to inject Firebase config:

```bash
node scripts/inject-firebase-config.js
```

**Important**: Never commit `public/firebase-messaging-sw.js` - it's gitignored.

### 4. Initialize Database

First-time setup requires initializing Firebase collections:

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/admin`
3. Click **"Initialize XP System"** (sets up tiers, rewards)
4. Click **"Initialize Game Settings"** (sets up game configs)
5. Click **"Initialize Vouchers"** (sets up reward templates)

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Fast setup guide for developers |
| [docs/ADMIN_README.md](docs/ADMIN_README.md) | Admin dashboard documentation |
| [docs/ADMIN_SUMMARY.md](docs/ADMIN_SUMMARY.md) | Gamification logic explained |
| [docs/COMPLETE_NOTIFICATIONS_GUIDE.md](docs/COMPLETE_NOTIFICATIONS_GUIDE.md) | Multi-channel notification system |
| [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) | API endpoints documentation |

---

## 🎮 Features Deep Dive

### Gamification System

**Dual Currency:**
- **XP (Experience Points)**: Permanent status, never decreases, determines tier
- **JP (Joy Points)**: Spendable currency for unlocks, spins, purchases

**Tier System:**
| Tier | Min XP | Multiplier | Perks |
|------|--------|------------|-------|
| Newbie | 0 | 1.0x | None |
| Player | 500 | 1.1x | Early event access |
| Strategist | 2,000 | 1.25x | 5% workshop discount |
| Grandmaster | 5,000 | 1.5x | VIP seating |

**Earning Mechanics:**
- Play games → Base XP + (Base JP × tier multiplier)
- Shop purchases → 10 XP per ₹100 + (10 JP × multiplier)
- Event registration → 50 XP + (50 JP × multiplier)
- Game of the Day → 2× points (first play only)
- Wheel of Joy → Spin for bonus XP/JP/rewards (with tier multipliers!)

**Tier Unlock:** Can purchase tiers with JP to skip ahead!

### Notification System

**4 Channels:**
- **Push Notifications**: Firebase Cloud Messaging (browser)
- **SMS**: Twilio integration
- **Email**: Gmail SMTP with custom templates
- **In-App**: Real-time notification center

**Smart Features:**
- Priority levels (High/Normal)
- Quiet hours (22:00-08:00 local time)
- Category-based preferences
- Phone verification for SMS
- Device management for push

---

## 📁 Project Structure

```
kaizen/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── admin/           # Admin endpoints
│   │   ├── games/           # Game logic & rewards
│   │   ├── notifications/   # Multi-channel notifications
│   │   ├── payments/        # Razorpay integration
│   │   └── user/            # User profile & preferences
│   ├── admin/               # Admin dashboard pages
│   ├── shop/                # E-commerce pages
│   ├── play/                # Game pages
│   ├── components/          # React components
│   └── context/             # Global state
├── components/              # Shared UI components
│   ├── ui/                  # Shadcn components
│   ├── games/               # Game-specific components
│   └── gamification/        # XP/JP UI components
├── lib/                     # Utilities & helpers
│   ├── firebase.ts          # Client Firebase config
│   ├── firebaseAdmin.ts     # Server Firebase config
│   ├── gamification.ts      # XP/JP logic
│   └── types.ts             # TypeScript types
├── public/                  # Static assets
├── scripts/                 # Build & utility scripts
└── docs/                    # Documentation
```

---

## 🔒 Security Best Practices

✅ **What We Do:**
- All secrets in `.env.local` (gitignored)
- Firebase Admin SDK on server-side only
- API routes protected with authentication
- Service worker secrets injected at build time
- HTTPS required for production
- Input validation with Zod
- SQL injection prevention (using Firestore)

⚠️ **What You Should Do:**
- Rotate Firebase keys after initial setup
- Use test Razorpay keys in development
- Enable Firebase App Check in production
- Set up Firestore security rules
- Monitor Firebase usage quotas
- Enable 2FA on all service accounts

---

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in **Project Settings**
4. Deploy!

**Build Command:** `npm run build`  
**Output Directory:** `.next`

### Railway / Netlify / Docker

Compatible with all major Node.js hosting platforms. Set environment variables via platform UI.

---

## 🤝 Contributing

Contributions are welcome! 

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Firebase** - For backend services
- **Shadcn/ui** - For beautiful components
- **Vercel** - For hosting platform
- **Open Source Community** - For inspiration and tools

---

## 🗓️ Changelog

### v2.0.0 (January 2026)
- ✅ Multi-channel notification system (Push, SMS, Email, In-App)
- ✅ XP/JP gamification with tier multipliers
- ✅ Admin dashboard with full management
- ✅ Payment integration with wallet redemption
- ✅ Event management system
- ✅ Wheel of Joy with tier-based rewards
- ✅ Phone verification for SMS
- ✅ Device management for push notifications
- ✅ Next.js 16 with Turbopack

### v1.0.0 (December 2024)
- 🎉 Initial release
- Shop, events, games functionality
- Firebase authentication
- Basic UI/UX

---

<div align="center">

**Built with ❤️ by the Joy Juncture Team**

[Website](https://joyjuncture.com) • [GitHub](https://github.com/yourusername/kaizen)

**Last Updated:** January 4, 2026

</div>
