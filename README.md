# Sondage IA & Foi

Survey application studying AI usage in Christian religious practices.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the survey.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler check |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles & Tailwind theme
├── components/
│   ├── survey/             # Survey flow components
│   │   ├── SurveyContainer.tsx
│   │   ├── SurveyIntro.tsx
│   │   ├── QuestionCard.tsx
│   │   └── ThankYouScreen.tsx
│   └── dashboard/          # Results visualization
│       └── ResultsDashboard.tsx
├── data/
│   └── surveySchema.ts     # Survey questions & types
└── lib/
    ├── utils.ts            # Utility functions (cn)
    └── dataService.ts      # Mock data service
```

## License

MIT
