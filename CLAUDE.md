# CLAUDE.md - Project Guide for AI Assistants

## Project Overview

**Sondage IA & Foi** (AI & Faith Survey) - A Next.js application studying AI usage in Christian religious practices. Academic research survey with bilingual (FR/EN) support, scoring algorithms, and GDPR compliance.

## Quick Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # TypeScript validation
npm run test         # Vitest unit tests
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright E2E tests
npm run remotion:studio  # Open Remotion video editor
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [lang]/            # i18n routes (fr/en)
│   ├── api/               # API routes (survey, admin, results)
│   └── globals.css        # Tailwind v4 theme
├── components/
│   ├── survey/            # Survey flow (SurveyContainer state machine)
│   ├── dashboard/         # Results visualization (SVG charts)
│   ├── methodology/       # Methodology page components
│   ├── sharing/           # PDF/QR sharing
│   └── ui/                # Reusable UI components
├── data/
│   └── surveySchema.ts    # 55 questions with conditional logic
├── lib/
│   ├── i18n/              # LanguageContext, translations
│   ├── hooks/             # useFingerprint, useSurveyPersistence
│   ├── scoring/           # 7 dimensions, 8 profiles algorithms
│   ├── supabase/          # Database client & types
│   ├── email/             # Resend integration
│   ├── pdf/               # React PDF report generation
│   └── security/          # Admin auth, CSRF
├── remotion/              # Video compositions & components
└── test/                  # Vitest setup
supabase/
├── schema.sql             # Base schema
└── migrations/            # Incremental migrations
e2e/                       # Playwright tests
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, React Compiler)
- **Styling:** Tailwind CSS v4, dark mode default
- **Database:** Supabase (PostgreSQL with RLS)
- **Animation:** Framer Motion, GSAP, Three.js
- **Video:** Remotion
- **Testing:** Vitest + Playwright
- **Monitoring:** Sentry
- **Email:** Resend

## Coding Conventions

### TypeScript & React
- Strict TypeScript mode enabled
- Use `"use client"` directive for components using browser APIs
- PascalCase for component files (e.g., `QuestionCard.tsx`)
- Named exports preferred over default exports
- 2-space indentation

### Path Aliases
```typescript
import { cn } from '@/lib/utils'  // @/* = ./src/*
```

### Component Pattern
```typescript
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  // typed props
}

export function ComponentName({ prop }: Props) {
  return (/* JSX */)
}
```

### Tests
- Unit tests: `*.test.ts(x)` beside source files
- E2E tests: `e2e/` directory
- Use Testing Library patterns
- Run `npm run test` before committing

## Survey Architecture

### State Machine Flow
`intro` → `questions` → `verify-email` → `email` → `feedback` → `thanks`

### Scoring System
- **7 Dimensions:** Calculated from question responses
- **8 Profiles:** Derived from dimension quartiles
- **Bias Detection:** Marlowe-Crowne social desirability scale

### Key Files
- `src/data/surveySchema.ts` - Question definitions
- `src/lib/scoring/` - All scoring algorithms
- `src/components/survey/SurveyContainer.tsx` - Main state machine

## Database (Supabase)

### Tables
- `sessions` - Survey sessions with partial answers
- `responses` - Completed submissions
- `email_submissions` - Hashed emails for PDF delivery
- `security_audit_log` - Security events

### Access Pattern
- **Browser:** Anon key (INSERT only, public aggregates)
- **API Routes:** Service role key (full access)
- **RLS:** Enforced on all tables

### Migrations
```bash
# Apply migrations via Supabase CLI
supabase db push
```

## i18n

### Usage
```typescript
import { useLanguage } from '@/lib/i18n'

const { t, lang } = useLanguage()
const text = t('common.submit')  // "Envoyer" or "Submit"
```

### Files
- `src/lib/i18n/translations.ts` - UI strings
- `src/lib/i18n/questions.ts` - Survey text

## Security Considerations

- No user authentication (anonymous survey)
- Fingerprinting for duplicate detection
- Email stored as SHA-256 hash only
- CSRF protection on mutations
- Rate limiting on API endpoints
- Audit logging enabled

## Environment Variables

Required in `.env.local`:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SENTRY_DSN=
RESEND_API_KEY=
```

## Commit Style

```
fix: correct scoring calculation for dimension X
feat: add email verification flow
ui: improve dark mode contrast
security: add rate limiting to submit endpoint
```

Keep commits concise (<72 chars), imperative mood.

## Important Notes

1. **Dark mode is default** - Light mode is secondary
2. **French is primary language** - Most content in French first
3. **Academic rigor** - Scoring based on validated scales (CRS-5, Marlowe-Crowne)
4. **GDPR compliance** - User data export/deletion at `/mes-donnees`
5. **No plaintext emails** - Always hash with SHA-256

## Related Documentation

- `README.md` - Project overview
- `METHODOLOGY.md` - Academic methodology details
- `SECURITY.md` - Security architecture
- `ROADMAP.md` - Development phases
- `AGENTS.md` - Extended coding guidelines
