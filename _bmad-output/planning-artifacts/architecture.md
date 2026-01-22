---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - c:/Pojets/ImpactHub/_bmad-output/planning-artifacts/prd.md
workflowType: 'architecture'
project_name: 'ImpactHub'
user_name: 'Katakuri'
date: '2026-01-22'
status: 'complete'
completedAt: '2026-01-22'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The system is a SaaS platform serving multiple churches (Tenants) with a unified codebase.
1.  **Identity & Access:** Public "Vision" content vs. Gated "Action" content. Frictionless auth (Persistent Session) is critical for conversion.
2.  **Discovery (Impact Cells):** Requires Geospatial indexing and search.
3.  **Engagement (Marketplace):** Content-heavy feed with video integration.
4.  **Feedback (Smart Loop):** Event-driven notification engine (Push/Email).
5.  **Multi-Tenancy:** Strict data isolation per church. Local Admins manage ONLY their scope.

**Non-Functional Requirements:**
*   **Isolation:** Row-Level Security (RLS) is non-negotiable (Architecture Driver).
*   **Performance:** Mobile-first optimization (Core Web Vitals) is critical for engagement.
*   **Availability:** Sunday Morning Peak (08:00-14:00) requires high reliability.
*   **Compliance:** GDPR/Europe hosting.

**Scale & Complexity:**
*   Primary domain: Full-Stack Web SaaS (PWA)
*   Complexity level: Medium (Standard CRUD + Geospatial + Tenants + Queueing)
*   Estimated architectural components: ~6-8 (Frontend, API, DB, Queue, Storage, Auth, Maps, Analytics)

### Technical Constraints & Dependencies

*   **Database:** MUST support RLS natively (Strongly implies PostgreSQL/Supabase).
*   **Deployment:** Infrastructure must support European data residency.
*   **Integrations:** No V1 API coupling for Payments/Donations (Manual Links). Transactional Email provider needed.

### Cross-Cutting Concerns Identified

1.  **Multi-Tenant Isolation:** Affects every DB query, API endpoint, and File storage path.
2.  **Feature Flipping (Module Factory):** UI and API must dynamically enable/disable routes based on Tenant config.
3.  **Geopatial Services:** Location services needed for Cell discovery.
4.  **Async Processing:** Mailing and Notifications must be decoupled from user interactions.

## Starter Template Evaluation

### Primary Technology Domain

**Full-Stack Web Application** (Next.js + Supabase)

### Selected Starter: Official Next.js + Supabase Starter ("with-supabase")

**Rationale for Selection:**
Selected for a beginner-friendly developer experience. It provides a clean, "batteries-included" foundation without the overwhelming complexity of commercial SaaS kits. Most importantly, it **pre-configures the critical Authentication Middleware** and SSR cookie handling, which is the most complex part of getting Supabase RLS specific security working correctly in Next.js App Router applications.

**Initialization Command:**

```bash
npx create-next-app@latest -e with-supabase .
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
*   **TypeScript:** Configured for type safety.
*   **Next.js (App Router):** Using the latest React Server Components paradigm.

**Styling Solution:**
*   **TailwindCSS:** Standard, utility-first CSS framework.

**Build Tooling:**
*   **Turbopack/Webpack:** Standard Next.js optimized build pipeline.

**Database & Auth:**
*   **Supabase:** Pre-wired for Auth (SSR) and Database access.
*   **Middleware:** `utils/supabase/middleware.ts` included for session management.

**Code Organization:**
*   `app/`: App Router structure.
*   `components/`: UI components.
*   `utils/`: Helper functions (Supabase client creators).

**Development Experience:**
*   Local development with environment variables (`.env.local`) support.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
*   Map Provider (Mapbox)
*   Transactional Email Service (Resend)
*   Video Hosting Strategy (YouTube)

**Important Decisions (Shape Architecture):**
*   RBAC Implementation Pattern (Custom App Level)
*   Multi-tenancy Discriminator Strategy

### Data Architecture

*   **Database Choice:** Supabase (PostgreSQL 15+)
    *   *Rationale:* Provided by starter, native RLS support is critical for multi-tenancy.
*   **Isolation Strategy:** **Row Level Security (RLS)**
    *   *Decision:* ENABLE on all tables.
    *   *Policy:* `auth.uid() = user_id` OR `tenant_id = (select tenant_id from user_profiles where id = auth.uid())`.
*   **Multi-Tenancy Model:** Shared Database with Discriminator.
    *   *Schema:* Every table MUST have `tenant_id` (UUID) indexed.

### Authentication & Security

*   **Authentication:** Supabase Auth (SSR)
    *   *Provided by Starter:* Handles JWT, Refresh Tokens, and Secure Cookies.
*   **Authorization (RBAC):** Custom `user_roles` table.
    *   *Pattern:* `user_profiles` table extends `auth.users` and contains `tenant_id` and `role`.
    *   *Roles:* `global_admin`, `local_admin`, `leader`, `member`.

### API & Communication Patterns

*   **API Pattern:** **Server Actions** (Next.js App Router).
    *   *Decision:* Direct database access via Server Components for reading, Server Actions for mutations. No separate REST API layer.
    *   *Rationale:* Simplicity for V1. Keeps code co-located with UI.
*   **Transactional Email:** **Resend** (v6.8.0).
    *   *Rationale:* Designed for React/Next.js (React Email). Excellent DX.
*   **Video Hosting:** **YouTube Embeds**.
    *   *Implementation:* `react-player` (v3.4.0) component wrapping YouTube-hosted videos.
    *   *Rationale:* Zero cost for V1. "Good enough" for MVP.

### Frontend Architecture

*   **Geospatial Visualization:** **Mapbox GL JS** (v3.18.0).
    *   *Rationale:* Best-in-class visualization for "Cell" maps. Generous free tier.
*   **Component Strategy:** Shadcn/UI (implied by modern Next.js ecosystem preference, to be confirmed in UX).

### Infrastructure & Deployment

*   **Hosting:** Vercel.
    *   *Rationale:* Native Next.js support. Zero-config deployment.
*   **Database Region:** Frankfurt (eu-central-1) or similar EU region.
    *   *Rationale:* GDPR Compliance.

### Decision Impact Analysis

**Implementation Sequence:**
1.  Initialize Project (Next.js + Supabase).
2.  Setup Database Schema (Tenants, Profiles, RLS).
3.  Implement Auth Flow (Login/Register).
4.  Integrate Resend (Email).
5.  Build Core Features (Cells, Mapbox).

**Cross-Component Dependencies:**
*   **RLS Policies** are the bottleneck. They must be defined BEFORE any data access code is written.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 4 key areas (Naming, Structure, Data Fetching, Security).

### Naming Patterns

**Database Naming Conventions:**
*   **Format:** `snake_case` (PostgreSQL standard).
*   **Examples:** `user_profiles`, `tenant_id`, `created_at`.
*   **Conflict Resolution:** TS code interacting with DB objects will use `snake_case` properties (e.g., `user.first_name`) to avoid massive manual mapping layers.

**Code Naming Conventions:**
*   **Variables/Functions:** `camelCase`.
*   **Components:** `PascalCase`.
*   **Files:** `kebab-case`.
*   **Example:** `components/user-profile-card.tsx` exports `UserProfileCard`.

### Structure Patterns

**Project Organization:**
*   **Feature-First Architecture:** Group code by domain feature, not just technical type.
    *   `app/(app)/impact-cells/` (Page + Components specific to feature)
    *   `features/impact-cells/` (Shared logic/types/components if reused)
*   **Shared UI:**
    *   `components/ui/` (Atomic design components like Buttons, Inputs).

### Communication Patterns

**Data Fetching (Server Components):**
*   **Pattern:** Fetch data directly in Server Components using Supabase Client.
*   **Anti-Pattern:** Using `useEffect` + `fetch` for initial data loading.

**Data Mutation (Server Actions):**
*   **Pattern:** Use `actions.ts` files for form submissions and mutations.
*   **Validation:** Validate inputs using Zod inside the Server Action before calling DB.

### Process Patterns

**Security Enforcement (RLS First):**
*   **Rule:** NEVER rely on `WHERE` clauses for security.
*   **Enforcement:** RLS Policies must be the primary line of defense.
*   **Testing:** Validate policies by trying to access data from a different tenant user.

### Enforcement Guidelines

**All AI Agents MUST:**
1.  Use `snake_case` for any property that maps directly to a DB column.
2.  Place business logic in Server Actions, not Client Components.
3.  Ensure every new table has `tenant_id` and RLS enabled immediately.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
impact-hub/
├── app/                        # Next.js App Router (Routing Layer)
│   ├── auth/                   # Authentication Routes
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/           # OAuth/MagicLink Callback
│   ├── (public)/               # PUBLIC ZONE (No Auth Required)
│   │   ├── layout.tsx          # Public Layout (No Sidebar)
│   │   └── page.tsx            # Landing Page (Vision Video)
│   └── (app)/                  # PRIVATE ZONE (Auth Required)
│       ├── layout.tsx          # App Layout (Sidebar, UserMenu)
│       ├── dashboard/          # Local Admin Dashboard
│       ├── impact-cells/       # Map & Discovery
│       ├── marketplace/        # Volunteering Feed
│       └── profile/            # User settings
├── components/                 # Shared Components
│   ├── ui/                     # Atomic UI Design (Buttons, Cards - Shadcn)
│   └── shared/                 # Shared widgets (UserAvatar, Logo)
├── features/                   # FEATURE MODULES (Business Logic)
│   ├── auth/                   # Login Forms, Validation
│   ├── impact-cells/           # Mapbox Helpers, Card Components, Actions
│   ├── marketplace/            # Video Player wrappers, Apply Actions
│   └── feedback/               # Smart Pulse Logic, Dialogs
├── lib/                        # Infrastructure
│   ├── supabase/               # Supabase Client Factories
│   ├── utils.ts                # Tailwind Merge & Common Helpers
│   └── resend.ts               # Resend Email Client
├── public/                     # Static Assets
└── types/                      # Global Types (Database Definitions)
```

### Architectural Boundaries

**API Boundaries:**
*   **Internal:** Server Actions (implicit API). Located in `features/*/actions.ts`.
*   **External:** Notifications via Resend SDK.

**Component Boundaries:**
*   `app/` contains **Pages** only (Layout + Data Fetching).
*   `features/` contains **Components** (Cards, Lists, Forms).
*   `components/ui/` contains **Primitives** (Button, Input).

### Requirements to Structure Mapping

**Impact Cells (FR4, FR5, FR6):**
*   **Page:** `app/(app)/impact-cells/page.tsx`
*   **Logic:** `features/impact-cells/`
*   **Map:** `features/impact-cells/components/cell-map.tsx`

**Volunteering Marketplace (FR7, FR8, FR9):**
*   **Page:** `app/(app)/marketplace/page.tsx`
*   **Logic:** `features/marketplace/`
*   **Video:** `features/marketplace/components/video-card.tsx`

**Integration Points:**
*   **Auth:** `middleware.ts` guards the `(app)` group.
*   **Database:** `lib/supabase/server.ts` is the single entry point for DB access.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
High Compatibility. Next.js App Router and Supabase Auth are designed to work together via middleware. Using Server Actions eliminates the need for an external API layer, simplifying the stack significantly.

**Pattern Consistency:**
The Feature-First structure supports the "Modular Monolith" strategy from the PRD. Naming conventions align with the underlying technologies (Postgres + TS).

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
*   **Impact Cells:** Addressed by Mapbox + PostGIS (via Supabase).
*   **Marketplace:** Addressed by YouTube Embeds + Relational Tables.
*   **Smart Feedback:** Addressed by Scheduled Edge Functions (pg_cron) + Resend.

**Non-Functional Requirements Coverage:**
*   **Isolation:** Fully covered by default RLS policy strategy.
*   **Performance:** Next.js SSR/ISR ensures fast FCP for the Vision Video landing page.

### Gap Analysis Results

**Minor Gaps (Non-Blocking):**
1.  **Image Uploads:** Not explicitly detailed in PRD, but assumed to use Supabase Storage for User Avatars and Ministry Thumbnails.
2.  **Cron Scheduling:** Implementation detail for "Smart Feedback" triggers needs to be `pg_cron` (Database native) or Vercel Cron.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (Next.js + Supabase + Tailwind)

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined (Feature-First)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION
**Confidence Level:** High

**Key Strengths:**
*   **Simplicity:** Avoiding microservices and using a "Batteries Included" stack (Supabase) drastically reduces V1 risk.
*   **Security:** RLS by design ensures multi-tenancy is not an afterthought.

**Implementation Handoff:**
AI Agents must strictly follow the **Feature-First** directory structure and never place business logic inside `app/` pages.

## Architecture Completion Summary

### Final Architecture Deliverables

**📋 Complete Architecture Document**
*   All architectural decisions documented with specific versions.
*   Implementation patterns ensuring AI agent consistency.
*   Complete project structure with all files and directories.
*   Requirements to architecture mapping.
*   Validation confirming coherence and completeness.

**🏗️ Implementation Ready Foundation**
*   **3** Major Technology Decisions (Stack, Maps, Email).
*   **4** Core Implementation Patterns (Naming, Structure, Auth, Data).
*   **14** FRs fully covered architecturally.

**📚 AI Agent Implementation Guide**
1.  Initialize project using `npx create-next-app@latest -e with-supabase .`
2.  Set up Supabase Project (Auth, Database, Storage).
3.  Implement RLS Policies immediately.
4.  Build features in `features/` directory, imported into `app/` pages.

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts (Supabase + Next.js).
- [x] Patterns support the architectural decisions (Server Actions).

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable (Versions locked).
- [x] Patterns prevent agent conflicts (Feature-First structure).
- [x] Structure is complete and unambiguous.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
