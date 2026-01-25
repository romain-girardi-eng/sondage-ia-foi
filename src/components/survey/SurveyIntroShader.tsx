"use client";

import { useLanguage } from "@/lib";
import { LanguageSwitcher } from "@/components/ui";
import SpiritualShaderHero from "@/components/ui/spiritual-shader-hero";
import FAQSection from "@/components/ui/faq-section";

interface SurveyIntroShaderProps {
  onStart: () => void;
  onConsentChange?: (consent: boolean) => void;
  consentGiven?: boolean;
}

export function SurveyIntroShader({ onStart, onConsentChange, consentGiven = false }: SurveyIntroShaderProps) {
  const { t, language } = useLanguage();

  const scrollToFaq = () => {
    const faqSection = document.getElementById("faq-section");
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = language === "fr"
    ? [
        { icon: "🔬", text: "Méthodologie scientifique" },
        { icon: "🔒", text: "100% anonyme" },
        { icon: "⏱️", text: "5-7 minutes" },
      ]
    : [
        { icon: "🔬", text: "Scientific methodology" },
        { icon: "🔒", text: "100% anonymous" },
        { icon: "⏱️", text: "5-7 minutes" },
      ];

  return (
    <div className="relative w-screen max-w-full overflow-x-hidden">
      <LanguageSwitcher />

      <SpiritualShaderHero
        badgeLabel={t("intro.badge")}
        badgeText={t("intro.badgeText")}
        title={t("intro.title")}
        subtitle={t("intro.subtitle")}
        description={t("intro.description")}
        primaryButtonText={t("intro.startButton")}
        secondaryButtonText={t("intro.learnMore")}
        onPrimaryClick={onStart}
        onSecondaryClick={scrollToFaq}
        features={features}
        consentGiven={consentGiven}
        onConsentChange={onConsentChange}
        consentLabel={t("consent.checkbox")}
        privacyLink="/privacy"
        privacyLinkText={t("intro.learnMore")}
      />

      {/* FAQ Section */}
      <div id="faq-section">
        <FAQSection />
      </div>

      {/* Footer */}
      <footer className="w-full py-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-5">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="IA & Foi"
            className="w-14 h-14 rounded-full shadow-lg shadow-purple-500/20"
          />
          {/* Survey title */}
          <p className="text-sm text-white/40">
            {language === "fr"
              ? "Grande enquête sur l'IA et la vie spirituelle"
              : "Major survey on AI and spiritual life"} - {new Date().getFullYear()}
          </p>
          {/* Author and social */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">Créée par Romain Girardi</span>
            <a
              href="https://github.com/romain-girardi-eng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/romain-girardi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
