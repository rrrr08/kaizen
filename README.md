# 🎮 Joy Juncture - The Digital Playground

<div align="center">

**A modern, gamified platform for board games, events, experiences, and community engagement**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Live Demo](http://localhost:3000) • [Documentation](#documentation) • [Features](#features) • [Getting Started](#getting-started)

</div>

---

## 📖 About

**Joy Juncture** is a playful, experience-driven platform built around one core belief: **Games are moments, memories, and shared joy.**

This full-stack web application combines e-commerce, event management, gamification, and community features into a cohesive digital playground where users can:
- 🛒 **Shop** for curated board games
- 🎉 **Attend** live events and workshops
- 🎯 **Play** free online games to earn rewards
- 🏆 **Compete** on leaderboards and unlock achievements
- 💰 **Redeem** points for exclusive rewards

---

## ✨ Key Features

### 🛍️ E-Commerce Platform
- **11+ Curated Board Games** with detailed product pages
- Advanced filtering and search functionality
- Shopping cart with persistent state
- Secure checkout with **Razorpay** payment integration
- Order tracking and history
- Digital receipts with barcodes

### 🎪 Event Management
- Live event registration system
- Event voucher generation and validation
- SMS notifications via **Twilio**
- Email confirmations via **Nodemailer**
- Calendar integration
- Event testimonials and reviews

### 🎮 Free Online Games (14+ Games)
- **Chess** - Classic strategy game
- **Sudoku** - Number puzzle with multiple difficulties
- **Wordle** - Daily word guessing game
- **2048** - Tile-merging puzzle
- **Snake** - Classic arcade game
- **Minesweeper** - Logic puzzle
- **Hangman** - Word guessing
- **Trivia** - Knowledge quiz
- **Math Quiz** - Educational challenges
- **Riddles** - Brain teasers
- **Puzzles** - Various puzzle types
- **Word Search** - Find hidden words
- **Tango** - Custom game
- **Daily Spin** - Luck-based rewards

### 🏆 Gamification System
- **XP/Points System** - Earn credits for every action
- **Wallet Management** - Track and manage your balance
- **Leaderboards** - Compete with the community
- **Rewards Catalog** - Redeem points for prizes
- **Progress Tracking** - Monitor your achievements
- **Daily Challenges** - "Game of the Day" rotation

### 👥 User Management
- Firebase Authentication (Email/Password, Google, Phone)
- User profiles with customizable avatars (Multiavatar)
- Phone verification with OTP
- Notification preferences
- Order history and wallet management

### 🔧 Admin Dashboard
- **Content Management** - Edit homepage, products, events, experiences
- **User Management** - View and manage users
- **Order Management** - Track and fulfill orders
- **Analytics** - View platform statistics
- **Notification System** - Send targeted notifications
- **Voucher Management** - Generate and validate vouchers
- **Settings** - Configure platform settings

### 🎨 Design & UX
- **Neo-Brutalist Design** - Bold, playful aesthetic with `neo-border` and `neo-shadow`
- **Smooth Animations** - Powered by Framer Motion
- **Fully Responsive** - Mobile-first design
- **Dark Mode Support** - Comfortable viewing experience
- **Accessibility** - WCAG compliant (see [ACCESSIBILITY-AUDIT.md](./ACCESSIBILITY-AUDIT.md))

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router & Turbopack
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend & Services
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth)
- **Database**: [Cloud Firestore](https://firebase.google.com/products/firestore)
- **Storage**: [Firebase Storage](https://firebase.google.com/products/storage) + [Cloudinary](https://cloudinary.com/)
- **Payments**: [Razorpay](https://razorpay.com/)
- **SMS**: [Twilio](https://www.twilio.com/)
- **Email**: [Nodemailer](https://nodemailer.com/) with Gmail SMTP

### Development Tools
- **Package Manager**: pnpm (recommended) / npm
- **Linting**: ESLint with Next.js config
- **Node Version**: >=20.0.0
- **npm Version**: >=10.0.0

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0 or **pnpm** (recommended)
- **Firebase Project** with Firestore and Authentication enabled
- **Razorpay Account** (for payments)
- **Twilio Account** (for SMS notifications)
- **Gmail Account** with App Password (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kaizen
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials in `.env.local`:

   ```env
   # Firebase Client Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

   # Firebase Admin SDK (Server-side)
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@iam.gserviceaccount.com

   # Twilio (SMS Notifications)
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890

   # Email (Gmail SMTP)
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=your-16-char-app-password

   # Razorpay (Payments)
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=your_secret_here

   # SEO
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

   > **Note**: See [.env.example](./.env.example) for detailed setup instructions for each service.

4. **Set up Firebase**
   
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password, Google, Phone)
   - Create a Firestore database
   - Deploy Firestore rules from `firestore.rules`
   - Deploy Firestore indexes from `firestore.indexes.json`

5. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
kaizen/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin dashboard pages
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── blog/                # Blog section
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout flow
│   ├── community/           # Community features
│   ├── events/              # Event management
│   ├── experiences/         # Custom experiences
│   ├── play/                # Free games hub
│   │   ├── chess/
│   │   ├── sudoku/
│   │   ├── wordle/
│   │   └── ... (14+ games)
│   ├── profile/             # User profile & settings
│   ├── rewards/             # Rewards catalog
│   ├── shop/                # Product catalog
│   ├── wallet/              # User wallet
│   └── page.tsx             # Homepage
├── components/              # React components
│   ├── admin/              # Admin components
│   ├── auth/               # Auth components
│   ├── community/          # Community components
│   ├── games/              # Game components
│   ├── gamification/       # Gamification UI
│   ├── home/               # Homepage sections
│   ├── settings/           # Settings components
│   └── ui/                 # Reusable UI components
├── lib/                     # Utilities & configs
│   ├── firebase.ts         # Firebase configuration
│   ├── types.ts            # TypeScript types
│   └── ui-config.ts        # UI configuration
├── public/                  # Static assets
├── styles/                  # Global styles
├── docs/                    # Documentation (99+ files)
├── scripts/                 # Utility scripts
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
└── next.config.ts          # Next.js configuration
```

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

### Quick Start Guides
- **[QUICKSTART.md](./docs/QUICKSTART.md)** - Fast setup guide
- **[COMPLETE_SETUP_GUIDE.md](./docs/COMPLETE_SETUP_GUIDE.md)** - Detailed setup instructions

### Admin Documentation
- **[ADMIN_QUICK_START.md](./docs/ADMIN_QUICK_START.md)** - Admin dashboard overview
- **[ADMIN_DASHBOARD_GUIDE.md](./docs/ADMIN_DASHBOARD_GUIDE.md)** - Complete admin guide
- **[ADMIN_FEATURES.md](./docs/ADMIN_FEATURES.md)** - Feature documentation

### Technical Documentation
- **[FIREBASE_MIGRATION_GUIDE.md](./docs/FIREBASE_MIGRATION_GUIDE.md)** - Firebase setup
- **[GAME_SETUP_GUIDE.md](./docs/GAME_SETUP_GUIDE.md)** - Game integration
- **[PAYMENT_INTEGRATION_GUIDE.md](./docs/PAYMENT_INTEGRATION_GUIDE.md)** - Payment setup
- **[NOTIFICATION_SYSTEM_GUIDE.md](./docs/NOTIFICATION_SYSTEM_GUIDE.md)** - Notifications

### Testing & Deployment
- **[COMPLETE_TESTING_GUIDE.md](./docs/COMPLETE_TESTING_GUIDE.md)** - Testing strategies
- **[ACCESSIBILITY-AUDIT.md](./ACCESSIBILITY-AUDIT.md)** - Accessibility compliance

---

## 🎮 Available Scripts

```bash
# Development
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Firebase
firebase deploy --only firestore:rules    # Deploy Firestore rules
firebase deploy --only firestore:indexes  # Deploy Firestore indexes
```

---

## 🔐 Admin Access

To set yourself as an admin:

1. Sign up for an account
2. Navigate to `/set-admin`
3. Follow the instructions to grant admin privileges
4. Access the admin dashboard at `/admin`

> **Security Note**: The `/set-admin` route should be removed or protected in production.

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Social features (friend system, chat)
- [ ] More games (Tic-Tac-Toe, Connect 4, etc.)
- [ ] Tournament system
- [ ] Subscription plans
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with more payment gateways

---

## 🐛 Known Issues

- Admin privileges may reset due to `AuthContext` race conditions (mitigated in latest version)
- Some games may not be fully optimized for mobile devices
- Email delivery may be delayed during high traffic

See [GitHub Issues](./issues) for the complete list.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

## 🙏 Acknowledgments

- **Design Inspiration**: Neo-brutalism movement
- **Game Libraries**: chess.js, sudoku-gen, react-chessboard
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React
- **Avatars**: Multiavatar

---

## 📞 Support

For support, please contact:
- **Email**: support@joyjuncture.com
- **Website**: [joyjuncture.com](https://joyjuncture.com)

---

## 📊 Project Status

✅ **Complete & Live** - January 2026

### Recent Updates
- ✅ Homepage improvements with conditional redirects
- ✅ "Game of the Day" rotation logic
- ✅ Fixed `AuthContext` race condition
- ✅ Admin experience pages stabilized
- ✅ Accessibility audit completed
- ✅ Payment integration refined
- ✅ Notification system enhanced

---

<div align="center">

**Built with ❤️ by the Joy Juncture Team**

⭐ Star this repo if you find it helpful!

</div>
