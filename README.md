# Sondage IA & Foi

Academic survey application studying AI usage in Christian religious practices.

**Live Demo:** [https://sondage-ia-foi.vercel.app](https://sondage-ia-foi.vercel.app)

## Features

- **Immersive Landing Page** - Custom CPPN shader with Three.js for a spiritual, meditative visual experience
- **48 Survey Questions** - Comprehensive questionnaire covering religiosity, AI usage, theology, and psychology
- **Conditional Logic** - Questions adapt based on previous answers
- **i18n Support** - Full French and English translations with language switcher
- **Modern Dashboard** - Custom SVG-based visualizations with animated radial charts
- **Privacy First** - No personal data collected, fully GDPR compliant
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
│   └── surveySchema.ts         # 48 survey questions with types
└── lib/
    ├── utils.ts                # Utility functions (cn)
    ├── dataService.ts          # Mock data service
    └── i18n/                   # Internationalization
        ├── translations.ts     # FR/EN translations
        └── LanguageContext.tsx # React context provider
```

## Survey Categories

The survey covers 6 main categories:

1. **Profile** - Religious denomination, age, community involvement
2. **Religiosity** - CRS-5 scale measuring religious commitment
3. **AI Usage** - General AI tool usage patterns
4. **Spiritual AI** - AI usage in spiritual contexts
5. **Theology** - Theological perspectives on AI
6. **Psychology** - Psychological aspects of AI-faith intersection

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

*This survey is part of an academic research project studying the intersection of artificial intelligence and religious practices.*
