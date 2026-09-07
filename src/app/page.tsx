import { SurveyContainer } from "@/components/survey";

export default function Home() {
  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-lg focus:font-medium"
      >
        Aller au contenu principal
      </a>

      <main
        id="main-content"
        className="min-h-[100dvh] w-full relative bg-background text-foreground"
      >

        {/* Main Content */}
        <div className="relative z-10">
          <SurveyContainer />
        </div>
      </main>
    </>
  );
}
