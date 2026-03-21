# Reclaimr — School Lost & Found Platform

> **FBLA 25-26: Ishaan G, Nikhil P, Chloe H**

> A full-stack web application that helps school communities reunite with lost belongings through AI-powered categorization, a reward system, and an intuitive admin dashboard.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Pages & Routes](#pages--routes)
- [API Endpoints](#api-endpoints)
- [Accessibility](#accessibility)
- [Attribution & Sources](#attribution--sources)
- [License](#license)

---

## Overview

**Reclaimr** is a modern lost-and-found platform designed for the Monta Vista High School community. Students and staff can report found items, browse active listings, submit claims, and ask questions — all through a responsive, accessible interface. An AI-powered vision system automatically categorizes and tags uploaded item photos, and a points-based leaderboard rewards helpful community members.

The project was built from scratch with **no website templates**, using Next.js (App Router), React, TypeScript, Tailwind CSS, and SQLite.

---

## Features

### For Students
- **Report Found Items** — Upload a photo, and Google Cloud Vision AI auto-detects the item category and tags. Fill in the details and submit.
- **Browse & Search** — Filter items by category, keyword, or sort order. View items in a responsive card grid with hover previews.
- **Claim Items** — Submit a claim with a description of why the item belongs to you. An admin verifies and coordinates the handoff.
- **Ask Questions** — Send an inquiry about any listed item directly through the platform.
- **Earn Rewards** — Gain 10 points for reporting an item and 25 points when it's successfully returned. Compete on the leaderboard.

### For Admins / Instructors
- **Admin Dashboard** — Review, approve, archive, or delete item reports. Manage claims and inquiries in a tabbed interface with real-time status counts.
- **Password-Protected Access** — Instructor login via a secure admin password (no Google account required).
- **Auto-Approve** — Admin-submitted reports are published immediately without review.

### Technical Highlights
- **AI Image Categorization** — Google Cloud Vision API analyzes uploaded photos and maps detected labels to predefined school item categories and descriptive tags.
- **Responsive Design** — Fully functional across desktop, tablet, and mobile breakpoints with a collapsible mobile navigation menu.
- **Liquid Glass UI** — Custom design system with frosted-glass effects, animated gradients, scroll-reveal animations, and smooth micro-interactions.
- **Accessibility** — Skip-to-content link, semantic HTML, ARIA attributes, keyboard navigation, reduced-motion support, and screen-reader-friendly content.
- **30-Day Expiry** — Items automatically show countdown badges and expire after 30 days.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animation** | [Framer Motion 12](https://www.framer.com/motion/) · [GSAP 3](https://gsap.com/) |
| **3D Graphics** | [Three.js](https://threejs.org/) (hero shader effects) |
| **Database** | [SQLite](https://www.sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) (Google OAuth) |
| **AI / Vision** | [Google Cloud Vision API](https://cloud.google.com/vision) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Date Picker** | [react-day-picker](https://react-day-picker.js.org/) |
| **File Upload** | [react-dropzone](https://react-dropzone.js.org/) |

---

## Project Structure

```
FBLAWebDev/
├── public/                   # Static assets (hero image, SVGs, uploaded files)
│   └── uploads/              # User-uploaded item photos
├── data/                     # SQLite database files (auto-created)
├── scripts/                  # Database seed scripts
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Home page (hero, stats, how-it-works, CTA)
│   │   ├── layout.tsx        # Root layout (navbar, footer, metadata)
│   │   ├── globals.css       # Global styles and Tailwind theme
│   │   ├── about/            # About page (mission, process, FAQ)
│   │   ├── admin/            # Admin dashboard (items, claims, inquiries)
│   │   ├── attribution/      # Source attribution and credits
│   │   ├── items/            # Browse items + item detail pages
│   │   ├── leaderboard/      # Rewards leaderboard
│   │   ├── login/            # Sign-in page (Google OAuth + admin password)
│   │   ├── report/           # Report a found item form
│   │   └── api/              # API routes
│   │       ├── admin/        # Admin auth endpoints
│   │       ├── auth/         # NextAuth.js handlers
│   │       ├── claims/       # Claim CRUD
│   │       ├── inquiries/    # Inquiry CRUD
│   │       ├── items/        # Item CRUD
│   │       ├── rewards/      # Leaderboard data
│   │       ├── seed/         # Database seeding
│   │       ├── upload/       # Image upload handler
│   │       └── vision/       # Google Cloud Vision AI
│   ├── components/           # Reusable React components
│   │   ├── ui/               # UI primitives (buttons, cards, dropdowns, etc.)
│   │   └── hooks/            # Custom React hooks
│   ├── lib/                  # Utilities and server-side helpers
│   │   ├── db.ts             # SQLite database connection and schema
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── categories.ts     # Category definitions
│   │   ├── aiTagMapper.ts    # Maps Vision API labels to item tags
│   │   └── utils.ts          # General utility functions
│   └── types/                # TypeScript type definitions
├── auth.ts                   # NextAuth.js route handler
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm**, **pnpm**, or **bun** package manager
- A **Google Cloud** project with the Vision API enabled (for AI features)
- A **Google OAuth** client ID and secret (for student sign-in)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd FBLAWebDev

# 2. Install dependencies
npm install

# 3. Create a .env.local file (see Environment Variables below)

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build    # Creates an optimized production build
npm run start    # Starts the production server on port 3000
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# NextAuth.js
AUTH_SECRET=<random-secret-string>
AUTH_GOOGLE_ID=<google-oauth-client-id>
AUTH_GOOGLE_SECRET=<google-oauth-client-secret>

# Google Cloud Vision API
GOOGLE_CLOUD_VISION_KEY=<your-api-key>

# Admin Password
ADMIN_PASSWORD=<chosen-admin-password>
```

> **Note:** API keys are never hardcoded in source files. All secrets are loaded from environment variables.

---

## Database

The application uses **SQLite** via `better-sqlite3` for zero-configuration persistence. The database file is created automatically at `data/lost-and-found.db` on first run.

### Schema

| Table | Purpose |
|-------|---------|
| `items` | Lost/found item reports (title, description, category, location, image, status, AI tags) |
| `claims` | Ownership claims linked to items (claimant info, description, status) |
| `inquiries` | Questions about items (inquirer info, message, status) |
| `rewards` | Point transactions for the leaderboard (email, points, reason) |
| `categories` | Predefined item categories (seeded on startup) |

### Item Statuses

- **pending** — Awaiting admin review
- **approved** — Visible to all users, available for claiming
- **claimed** — Verified and returned to owner
- **archived** — Expired or manually archived

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero section, live stats, "How It Works" carousel, CTA |
| `/items` | Browse | Searchable, filterable grid of approved items |
| `/items/[id]` | Item Detail | Full item view with claim form and inquiry form |
| `/report` | Report | AI-assisted form to report a found item |
| `/leaderboard` | Leaderboard | Points ranking with personal stats |
| `/about` | About | Mission, process overview, FAQ, contact info |
| `/login` | Sign In | Google OAuth for students, password auth for admins |
| `/admin` | Admin Dashboard | Manage items, claims, and inquiries (protected) |
| `/attribution` | Attribution | Credits and licenses for all third-party resources |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/items` | List items (with search, filter, pagination) |
| `POST` | `/api/items` | Create a new item report |
| `PATCH` | `/api/items/[id]` | Update item status |
| `DELETE` | `/api/items/[id]` | Delete an item |
| `GET` | `/api/claims` | List claims (admin only) |
| `POST` | `/api/claims` | Submit a claim |
| `PATCH` | `/api/claims/[id]` | Update claim status |
| `GET` | `/api/inquiries` | List inquiries (admin only) |
| `POST` | `/api/inquiries` | Submit an inquiry |
| `PATCH` | `/api/inquiries/[id]` | Update inquiry status |
| `DELETE` | `/api/inquiries/[id]` | Delete an inquiry |
| `GET` | `/api/rewards` | Get leaderboard data |
| `POST` | `/api/upload` | Upload an item image |
| `POST` | `/api/vision` | Analyze image with Google Cloud Vision AI |
| `POST` | `/api/admin/auth` | Admin password authentication |
| `DELETE` | `/api/admin/auth` | Admin sign-out |
| `GET` | `/api/admin/check` | Check admin authentication status |

---

## Accessibility

Reclaimr was built with inclusive design as a priority:

- **Skip-to-Content Link** — Hidden link appears on focus to skip past the navigation bar.
- **Semantic HTML** — Proper heading hierarchy (`h1`–`h3`), `<nav>`, `<main>`, `<footer>`, `<section>`, `<table>` with `<caption>`, `<th scope>`.
- **ARIA Attributes** — `aria-label`, `aria-expanded`, `aria-selected`, `aria-controls`, `aria-live`, `aria-invalid`, `aria-describedby`, `role="alert"`, `role="tabpanel"`, `role="search"`, `role="listbox"`, `role="option"`.
- **Keyboard Navigation** — All interactive elements are reachable via Tab. Dropdowns support Arrow keys, Enter, Escape, Home, and End.
- **Reduced Motion** — `@media (prefers-reduced-motion: reduce)` disables all CSS animations and transitions. Framer Motion components check `useReducedMotion()`.
- **Form Labels** — Every input has an associated `<label>` (visible or `sr-only`). Required fields are marked. Validation errors are announced with `role="alert"`.
- **Color & Contrast** — Primary text uses `text-white` and `text-white/80` on dark backgrounds for readability. Status indicators use color + text labels.
- **Responsive Images** — `next/image` provides responsive `srcset`, lazy loading, and modern formats (WebP/AVIF).
- **Screen Reader Content** — `.sr-only` classes provide context where visual design implies meaning (table captions, icon-only buttons, filter labels).

---

## Attribution & Sources

A complete list of all third-party libraries, assets, and resources is available on the [Attribution page](/attribution) within the application. Key attributions include:

- **Next.js** — MIT License — [nextjs.org](https://nextjs.org)
- **React** — MIT License — [react.dev](https://react.dev)
- **Tailwind CSS** — MIT License — [tailwindcss.com](https://tailwindcss.com)
- **Framer Motion** — MIT License — [framer.com/motion](https://www.framer.com/motion)
- **Lucide Icons** — ISC License — [lucide.dev](https://lucide.dev)
- **better-sqlite3** — MIT License — [github.com/WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **NextAuth.js** — ISC License — [authjs.dev](https://authjs.dev)
- **Google Cloud Vision API** — Google Terms of Service
- **Hero Image** — Unsplash License — [unsplash.com](https://unsplash.com)

No website templates were used. All code and design were created from scratch.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

This project was created for the **FBLA WC&D** competitive event. All original source code is owned by the team. Third-party dependencies are used under their respective open-source licenses as documented in the [Attribution](#attribution--sources) section.
