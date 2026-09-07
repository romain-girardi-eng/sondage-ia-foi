# Sondage IA & Foi

Academic survey application studying AI usage in Christian religious practices.

**Live Demo:** [https://ia-foi.fr](https://ia-foi.fr)

## Features

- **Immersive Landing Page** - Custom CPPN shader with Three.js for a spiritual, meditative visual experience
- **58 Survey Questions** - Instrument v2.0.0 with conditional routing (47 to 52 shown per respondent; 1 for screened-out respondents)
- **Conditional Logic** - Questions adapt based on previous answers
- **i18n Support** - Full French and English translations with language switcher
- **Heuristic Profiling** - 7 dimensions and 8 profiles; profile attribution is heuristic and labelled as such, never a diagnosis
- **Modern Dashboard** - Custom SVG-based visualizations, k-anonymous aggregates (k = 5), published from 30 participants onwards
- **Privacy First** - Pseudonymous by design (anonymous ID, keyed hashes for email/IP, never raw), retention limits and automated purge, fully GDPR compliant
- **Responsive Design** - Optimized for mobile and desktop

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion, GSAP |
| 3D Graphics | Three.js, React Three Fiber |
| Icons | Lucide React |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the survey.

### Dev Mode URLs

Access specific screens directly for development:

- `/?view=results` - Results dashboard
- `/?view=feedback` - Feedback screen
- `/?view=thanks` - Thank you screen

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run typecheck` | Run TypeScript compiler check |

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles & Tailwind theme
├── components/
│   ├── survey/                 # Survey flow components
│   │   ├── SurveyContainer.tsx # Main state machine
│   │   ├── SurveyIntroShader.tsx # Landing page with shader
│   │   ├── QuestionCard.tsx    # Question renderer
│   │   ├── FeedbackScreen.tsx  # Personalized results
│   │   └── ThankYouScreen.tsx  # Completion screen
│   ├── dashboard/              # Results visualization
│   │   └── ResultsDashboard.tsx # Modern chart dashboard
│   └── ui/                     # Reusable UI components
│       ├── animated-background.tsx
│       ├── language-switcher.tsx
│       └── spiritual-shader-hero.tsx
├── data/
│   └── surveySchema.ts         # 58 survey questions, instrument v2.0.0
└── lib/
    ├── utils.ts                # Utility functions (cn)
    ├── dataService.ts          # Mock data service
    ├── scoring/                # 7 dimensions, 8 heuristic profiles, usage gap
    ├── analysis/               # Correlation facts, pre-specified interpretations,
    │                           # certainty grades A-D
    └── i18n/                   # Internationalization
        ├── translations.ts     # FR/EN translations
        └── LanguageContext.tsx # React context provider
```

## Survey Categories

The survey covers 12 categories across 58 questions:

1. **Profile** - Religious denomination, status, demographics (15 questions)
2. **Religiosity** - CRS-5 scale measuring religious commitment (5 questions)
3. **Theology** - Theological orientation and perspectives on AI (8 questions)
4. **AI Usage** - General AI tool usage patterns (3 questions)
5. **Digital Spiritual** - Existing digital tools in spiritual life (2 questions)
6. **Ministry** - Clergy-only questions on preaching, pastoral care, administration (5 questions)
7. **Spirituality** - Layperson-only questions on AI in prayer and counsel (2 questions)
8. **Psychology** - Anthropomorphism, anxiety, and perception of AI (5 questions)
9. **Community** - Church positions and peer attitudes (3 questions)
10. **Future** - Intentions and training interests (3 questions)
11. **Open** - Free-text comments (1 question)
12. **Social Desirability** - Ad hoc selection of 5 Marlowe-Crowne items (5 questions)

Scoring: 7 dimensions (1 item feeds exactly 1 dimension, no demographics), 8 heuristic profiles,
an ordinal `usageGap` indicator, and empirical ranks served from 30 participants onwards. There is
no reference population and no model-based percentile. See `METHODOLOGY.md` and
`docs/PREREGISTRATION.md`.

## Dashboard Visualizations

The results dashboard features:

- **Radial Charts** - Circular progress with floating percentage indicators
- **Horizontal Bars** - Gradient-filled bars with hover effects
- **Scale Visualizations** - Bar charts with weighted averages
- **Category Filters** - Filter results by question category
- **Animated Counters** - Smooth number animations

## Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Fork this repository
2. Connect to Vercel
3. Deploy with default settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Author

Romain Girardi

---

*Independent research project studying the intersection of artificial intelligence and Christian religious practices. Not affiliated with any university or laboratory.*
