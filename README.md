# Nishatt Attendance Buddy

> Intelligent student attendance tracking system and timetable planner designed for college and university students.

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.4-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)

---

## Overview

**Nishatt Attendance Buddy** is an attendance management and academic scheduling application. Built to eliminate academic penalties and attendance shortfalls, it gives students complete visibility over their daily schedule, predicts how many lectures they can afford to miss while remaining above the mandatory 75% threshold, and provides AI-powered timetable extraction from schedule photos.

---

## Features

- **75% Attendance Safeguard**: Automatic calculation of safe absences and additional classes needed to maintain target percentage.
- **Daily Lecture Check-in**: One-tap attendance marking (Present, Absent, or Class Off) with real-time streak tracking.
- **Interactive Timetable Management**: Weekly schedule grid with class times, course codes, and direct slot editing.
- **Timetable Code Sharing & OCR**: Export/import schedules via shareable codes or upload an image of your timetable to extract slots using AI vision.
- **Attendance Analytics & Weekly Reports**: Visual charts, subject-wise statistics, goal trackers, and interactive monthly attendance calendars.
- **AI Academic Assistant**: Context-aware assistant to answer questions regarding timetable schedules, attendance targets, and study planning.
- **Cross-Platform**: Modern responsive web application ready for deployment on iOS and Android via Capacitor.
- **Security & Privacy**: Authenticated accounts secured with Supabase Auth and PostgreSQL Row Level Security (RLS) policies.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite 5, TypeScript |
| **Styling & UI Components**| Tailwind CSS, shadcn/ui (Radix UI), Framer Motion, Lucide Icons |
| **3D & Visualizations** | Three.js, React Three Fiber, Recharts |
| **State & Data Fetching** | TanStack Query (React Query), date-fns |
| **Backend & Database** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **Mobile Runtime** | Capacitor 7 (Android & iOS) |
| **Hosting & Deployment** | Vercel (Production SPA hosting with caching & security headers) |

---

## Project Structure

```text
nishatt-attendance-buddy/
├── public/                 # Static assets (favicons, og-image, robots.txt, sitemap.xml, llms.txt)
├── src/
│   ├── components/         # Reusable feature & layout components
│   │   ├── ui/             # Radix & shadcn/ui component primitives
│   │   ├── ChatTab.tsx     # AI assistant chat interface
│   │   ├── DashboardHeader.tsx # Navigation and theme controls
│   │   ├── DailyAttendance.tsx # Today's lecture tracking
│   │   ├── SEO.tsx         # Route-specific dynamic SEO & metadata manager
│   │   └── ...
│   ├── hooks/              # Custom React hooks (useAttendance, use-toast)
│   ├── integrations/
│   │   └── supabase/       # Supabase client initialization & database schema types
│   ├── lib/                # Utility helpers (clsx, tailwind-merge)
│   ├── pages/              # Application views (Index, Auth, Privacy, Terms, NotFound)
│   ├── types/              # TypeScript interface declarations
│   ├── App.tsx             # Root router with code-split lazy routes
│   └── main.tsx            # Application entry point
├── supabase/
│   └── functions/          # Deno-based Supabase Edge Functions (chat, extract-timetable)
├── capacitor.config.ts     # Mobile packaging configuration
├── eslint.config.js        # ESLint flat configuration
├── tailwind.config.ts      # Tailwind CSS configuration and theme tokens
├── vercel.json             # Vercel SPA routing and security header directives
└── vite.config.ts          # Vite build config, path aliases, and rollup chunk optimization
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or pnpm / yarn / bun)

### 1. Clone the repository

```bash
git clone https://github.com/nishant020208/nishatt-attendance-buddy.git
cd nishatt-attendance-buddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and configure your Supabase project credentials:

```bash
cp .env.example .env
```

Edit `.env` with your project keys:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

> **Note**: Both `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_ANON_KEY` are supported.

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) to view the application.

---

## Production Build & Quality Checks

Run linting and type verification:
```bash
npm run lint
```

Build optimized static bundle:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

---

## Edge Functions Configuration

For AI features (Chat & Image Timetable Extraction), configure secrets in your Supabase project:

```bash
# Using Supabase CLI
supabase secrets set OPENAI_API_KEY="sk-..."
supabase secrets set AI_MODEL="gpt-4o-mini"
supabase secrets set AI_VISION_MODEL="gpt-4o"

# Deploy edge functions
supabase functions deploy chat
supabase functions deploy extract-timetable
```

---

## Mobile Packaging (Capacitor)

To compile and test on iOS or Android:

```bash
# Build the web bundle
npm run build

# Sync web assets to native platforms
npx cap sync

# Open Android Studio
npx cap open android

# Open Xcode (macOS only)
npx cap open ios
```

---

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub.
2. Import the repository in [Vercel Dashboard](https://vercel.com).
3. Set the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. The deployment will automatically use `vercel.json` for SPA rewrites and caching headers.

---

## Security

- All database queries are protected via Supabase PostgreSQL Row Level Security (RLS).
- API credentials are read strictly from environment variables; no secrets are committed to version control.
- Edge functions authenticate users via JWT authorization headers before servicing requests.
- Strict security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`) are enforced via `vercel.json`.

---

## License

This project is licensed under the MIT License.
