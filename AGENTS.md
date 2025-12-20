# AGENTS.md

## Build & Lint Commands
- **Install:** `bun install`
- **Dev:** `bun dev` (Next.js with Turbopack)
- **Build:** `bun build`
- **Lint:** `bun lint` / `bun lint:fix`
- **Format:** `bun format`
- **DB:** `bun db:migrate`, `bun db:generate`, `bun db:studio`
- **DB schema changes:** Use `bun db:generate --name <name>`, never run migrations directly
- **No test suite configured**

## Code Style (Biome)
- Indent: tabs (width 4), line width: 120
- Double quotes, trailing commas, semicolons always
- Imports: use `@/*` alias for `src/*`, auto-organized by Biome

## TypeScript & Conventions
- Strict mode enabled, target ES2017
- Server Actions: `"use server"` directive, return `{ success, message, path? }`
- Client Components: `"use client"` directive
- Forms: `@tanstack/react-form` with Zod v4 validation
- UI: shadcn/ui (new-york style), Tailwind CSS v4, Lucide icons
- Database: Drizzle ORM (PostgreSQL), schemas in `src/server/db/tables/`
- Env vars: validated via `@t3-oss/env-nextjs` in `src/env.ts`
- UI language is German
- Sensor data: Server stores UTC, convert to user timezone for display (see existing code for reference)
  - Use `date-fns-tz`: `toZonedTime(date, TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin])`
  - Example (page receiving date param): `src/app/(dashboard)/energy/page.tsx`
  - Timezone enums: `@/lib/enums` (`TimeZoneType`, `TimezoneTypeToTimeZone`)
