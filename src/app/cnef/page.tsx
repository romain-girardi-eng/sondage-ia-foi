import type { Metadata } from "next";
import { SurveyContainer } from "@/components/survey";

export const metadata: Metadata = {
  title: "IA & Foi x CNEF | Enquête auprès des évangéliques",
  description:
    "Enquête anonyme proposée en partenariat avec le CNEF sur l'usage de l'intelligence artificielle dans la vie d'Église évangélique.",
  robots: "index, follow",
};

// CNEF co-branded landing. Enters the SAME survey engine as the general
// survey, but pre-seeds profil_confession=protestant so evangelical
// respondents skip straight to the evangelical sub-question. Responses land
// in the same storage as the general survey to keep the data comparable.
export default function CnefHome() {
  return (
    <>
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
        {/* Decorative Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-indigo-900/10 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <SurveyContainer
            variant="cnef"
            initialAnswers={{ profil_confession: "protestant", profil_confession_protestante: "evangelique" }}
          />
        </div>
      </main>
    </>
  );
}
