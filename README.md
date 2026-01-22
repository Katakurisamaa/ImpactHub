# ImpactHub

ImpactHub is a modular church management and community platform built with Next.js and Supabase.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (SSR Cookies)
- **Styling:** TailwindCSS + Shadcn/UI
- **Deployment:** Vercel

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment:**
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Key Features

- **Impact Cells:** Geospatial discovery of community groups.
- **Volunteering Marketplace:** Connect needs with skills.
- **Smart Feedback:** Real-time pulse on community health.

## Project Structure

- `/app`: Application routes and layouts
- `/features`: Business logic (Feature-First architecture)
- `/components/ui`: Shared UI primitives
- `/lib`: Core infrastructure and utilities
