---
project_name: 'ImpactHub'
user_name: 'Katakuri'
date: '2026-01-22'
sections_completed: ['technology_stack', 'critical_rules', 'complete']
status: 'complete'
rule_count: 14
optimized_for_llm: true
existing_patterns_found: 4
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5+ (Strict Mode)
- **Styling:** TailwindCSS 3+
- **Backend:** Supabase (PostgreSQL 15+, Auth, Storage, Edge Functions)
- **Maps:** Mapbox GL JS v3.18.0 (`react-map-gl` recommended)
- **Email:** Resend v6.8.0 (`react-email`)
- **Video:** React Player v3.4.0 (YouTube Embeds)

## Critical Implementation Rules

### Language & Framework (Next.js + TS)

- **Struct Mode:** `noImplicitAny` is mandatory. No `console.log` in production.
- **Server Actions:** ALL mutations (POST/PUT/DELETE) must use Server Actions associated with the specific feature in `features/**/actions.ts`.
- **Data Fetching:** ALL data fetching must be done via Supabase Client directly in Server Components (No `useEffect` fetch).
- **Client Components:** Use `'use client'` *only* for interactivity (Forms, Listeners). Not for data loading.

### Security (Supabase RLS)

- **RLS-First:** NEVER create a table without enabling RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- **Tenant Isolation:** NEVER trust the client for `tenant_id`. Always infer it from the JWT or server-side session.
- **No Admin Key:** Agents must NEVER use `service_role_key` in client code or exposed Server Actions.

### Architecture & Patterns

- **Feature-First:** All business logic goes into `/features`. `/app` contains only routing and layouts.
- **Naming:** `snake_case` for DB, `camelCase` for JS. Do NOT create useless manual mappers (Supabase handles this).
- **UI Components:** Use existing `shadcn/ui` components in `/components/ui` before creating custom CSS.

### Anti-Patterns (Forbidden)

- ❌ Using `pages/` directory (This is Next.js 12 router).
- ❌ Writing raw SQL without using the Supabase Query Builder (unless absolutely necessary).
- ❌ Placing business logic in `layout.tsx`.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-01-22
