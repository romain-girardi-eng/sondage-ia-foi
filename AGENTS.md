# Repository Guidelines

## Project Structure & Module Organization
Primary routes and layouts live in `src/app`; keep view-specific state or metadata there. Component groups (`survey`, `dashboard`, `ui`) sit in `src/components`, while hooks, utilities, and translations belong in `src/hooks` and `src/lib`. Domain schemas stay in `src/data`, Remotion scenes in `src/remotion`, static files under `public/`, and Supabase SQL plus migrations in `supabase/`. Tests sit beside source files; Playwright specs live in `e2e/` and the shared Vitest bootstrap is `src/test/setup.ts`.

## Build, Test, and Development Commands
- `npm run dev` – Next.js dev server at `http://localhost:3000`.
- `npm run build` / `npm run start` – Build and serve the production bundle.
- `npm run lint` (`lint:fix`) – ESLint with Next + Tailwind configs; optional auto-fix.
- `npm run typecheck` – `tsc --noEmit` across app, Remotion, and API routes.
- `npm run test`, `test:watch`, `test:coverage` – Vitest suites; keep coverage trending upward.
- `npm run test:e2e` (`:headed`, `:ui`) – Playwright scenarios; build the app first.
- `npm run remotion:studio` / `remotion:render` – Preview or render video sequences.

## Coding Style & Naming Conventions
Author components in TypeScript with React 19 functions; add "use client" whenever browser APIs are referenced. Default to 2-space indentation, PascalCase filenames (`SurveyContainer.tsx`), and named exports. Compose Tailwind v4 utility strings from layout → spacing → color, reuse patterns through helpers in `src/lib`, and run ESLint before every push (no other formatter runs in CI).

## Testing Guidelines
Place `.test.ts(x)` files beside the logic they exercise and import Testing Library helpers from `src/test/setup.ts`. That setup already mocks `matchMedia`, observers, and `localStorage`, so assertions should target rendered output instead of implementation details. Vitest should stress survey branching and dashboard math, while Playwright covers language toggles, Supabase fallbacks, and accessibility sweeps via `@axe-core/playwright`.

## Commit & Pull Request Guidelines
Follow the concise prefixes present in history (`fix:`, `ui:`, `security:`) and keep subjects imperative under 72 characters. Describe motivation, list the commands or screenshots used for validation, and reference an issue, ROADMAP item, or Supabase migration when relevant. Keep each PR scoped to one change, ensure lint/tests pass, and call out any required env updates.

## Security & Configuration Tips
Store secrets only in `.env.local` (e.g., `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SENTRY_DSN`, `RESEND_API_KEY`) and never commit them. Update Supabase schemas with the CLI, commit the generated files in `supabase/migrations`, and document rollback instructions. Route telemetry through the existing `sentry.*.config.ts` helpers and avoid logging raw survey responses.
