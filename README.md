# Culyn - AI-Powered Cooking Assistant

![Culyn](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

**Culyn** is an AI-powered cooking and recipe management app that makes home cooking effortless. Import recipes from anywhere — Instagram, YouTube, blogs, or even videos — and Culyn automatically extracts ingredients, steps, and full nutrition data.

## ✨ Features

- 🤖 **AI-Powered Recipe Import** - Extract recipes from Instagram, YouTube, blogs, and videos
- 📝 **Smart Recipe Management** - Organize and customize your personal cookbook
- 🥗 **Nutrition Tracking** - Automatic nutrition data extraction and calculation
- 🔄 **Flexible Serving Sizes** - Adjust portions with automatic ingredient scaling
- 🛒 **Intelligent Grocery Lists** - Generate structured shopping lists from recipes
- 👨‍🍳 **Real-Time Cooking Assistant** - Step-by-step guidance with timers and substitutions
- 🎯 **Personalized Experience** - AI learns your preferences over time
- 🍽️ **Diet Customization** - Adapt meals to your dietary requirements
- 📱 **Progressive Web App** - Install on any device for native-like experience

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL database
- Redis (for background jobs)
- AWS S3 (for media storage)
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/culyn.git
   cd culyn
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   - Database connection (PostgreSQL)
   - Redis connection
   - AWS S3 credentials
   - Google AI API key
   - Stripe keys (for payments)
   - Authentication secrets

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Start the background worker** (in a separate terminal)
   ```bash
   npm run queue
   # or
   bun run queue
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (Framer Motion)
- **Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query

### Backend
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: Better Auth
- **Background Jobs**: BullMQ + Redis
- **AI**: Google Generative AI
- **Payments**: Stripe
- **Storage**: AWS S3

### PWA & SEO
- **Manifest**: Full PWA support with installability
- **Metadata**: Comprehensive SEO with Open Graph & Twitter Cards
- **Theme**: Light mode with system-aware status bar
- **Icons**: Multiple sizes for all platforms (192px, 512px, Apple)

## 📱 Progressive Web App

Culyn is a fully-featured PWA that can be installed on:
- 📱 iOS devices (via Safari)
- 🤖 Android devices (via Chrome)
- 💻 Desktop (Chrome, Edge, Safari)

### PWA Features
- Offline-capable
- Installable to home screen
- Native-like experience
- Optimized for mobile cooking
- Portrait-first design

## 🎨 Design System

### Fonts
- **Montserrat** - Primary UI font
- **DM Sans** - Body text
- **Syne** - Headings and emphasis
- **Sharp Grotesk** - Display text
- **Autography** - Decorative elements

### Theme
- **Default**: Light mode
- **Status Bar**: Adaptive (white for light, black for dark)
- **Viewport**: Fixed scale for cooking experience

## 📂 Project Structure

```
culyn/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── (protected)/     # Authenticated routes
│   │   ├── layout.tsx       # Root layout with metadata
│   │   └── manifest.ts      # PWA manifest
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   └── layout/          # Layout components
│   ├── lib/                 # Utilities and helpers
│   ├── providers/           # React context providers
│   ├── styles/              # Global styles
│   └── fonts/               # Custom fonts
├── prisma/                  # Database schema
├── bull/                    # Background job workers
└── public/                  # Static assets
    ├── icon-192.png         # PWA icon (small)
    ├── icon-512.png         # PWA icon (large)
    ├── apple-icon.png       # iOS home screen icon
    ├── og-image.png         # Open Graph image
    └── twitter-image.png    # Twitter card image
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run queue        # Start background job worker
npm run ai-costs     # Check AI API costs
```

## 🌐 Deployment

### Domain
- Production: `https://culyn.app`

### Recommended Platforms
- **Vercel** - Optimized for Next.js
- **Railway** - Full-stack deployment
- **AWS** - Complete control

### Environment Setup
1. Set all environment variables in your platform
2. Configure PostgreSQL database
3. Set up Redis instance
4. Configure AWS S3 bucket
5. Add domain and SSL certificate

## 📸 Required Assets

Before deploying, ensure you have these images in `/public`:

### Priority 1: Core Icons
- `/icon-192.png` (192x192px) - PWA icon
- `/icon-512.png` (512x512px) - PWA icon
- `/apple-icon.png` (180x180px) - iOS icon

### Priority 2: Social Media
- `/og-image.png` (1200x630px) - Open Graph
- `/twitter-image.png` (1200x675px) - Twitter card

### Optional: Screenshots & Splash
- `/screenshot-mobile.png` (390x844px)
- `/screenshot-desktop.png` (1920x1080px)
- Apple splash screens (various sizes)

See `image-assets-checklist.md` for complete list.

## 🔐 Authentication

Culyn uses Better Auth for authentication with support for:
- Email/Password
- OAuth providers (Google, etc.)
- WebAuthn (passkeys)
- Session management

## 💳 Payments

Stripe integration for:
- Subscription management
- Premium features
- Payment processing

## 🤖 AI Features

Powered by Google Generative AI:
- Recipe extraction from text/images/videos
- Ingredient recognition
- Nutrition calculation
- Cooking assistance
- Personalized recommendations

## 📊 Database

PostgreSQL with Prisma ORM:
```bash
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate client
```

## 🐛 Background Jobs

BullMQ handles async tasks:
- Recipe processing
- AI extraction
- Notification sending
- Data synchronization

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- Website: [culyn.app](https://culyn.app)
- Twitter: [@culyn](https://twitter.com/culyn)

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma](https://prisma.io)
- [Google AI](https://ai.google.dev)
- [Radix UI](https://radix-ui.com)

---

**Made with ❤️ for home cooks everywhere**
