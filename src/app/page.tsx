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
        className="min-h-[100dvh] w-full relative overflow-x-hidden bg-background text-foreground"
      >
        {/* Decorative Background */}
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
          {/* Top-left gradient */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px]" />
          {/* Bottom-right gradient */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[150px]" />
          {/* Center subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-indigo-900/10 blur-[100px]" />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <SurveyContainer />
        </div>
      </main>
    </>
  );
}
