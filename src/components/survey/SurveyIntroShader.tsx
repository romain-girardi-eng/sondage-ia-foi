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
  const { t } = useLanguage();

  const scrollToFaq = () => {
    const faqSection = document.getElementById("faq-section");
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    { icon: "🔬", text: t("intro.featureScientific") },
    { icon: "🔒", text: t("intro.featureAnonymous") },
    { icon: "⏱️", text: t("intro.featureDuration") },
  ];

  return (
    <div className="relative w-full">
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
        authorLabel={t("footer.createdBy")}
        authorName="Romain Girardi"
        githubUrl="https://github.com/romain-girardi-eng/sondage-ia-foi"
        linkedinUrl="https://www.linkedin.com/in/romain-girardi/"
      />

      {/* FAQ Section */}
      <div id="faq-section">
        <FAQSection />
      </div>

      {/* Compact Footer */}
      <footer className="w-full py-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- Static logo */}
          <img
            src="/logo.png"
            alt="IA & Foi"
            className="w-8 h-8 rounded-full"
          />
          <p className="text-xs text-muted-foreground/70">
            {t("footer.tagline")} - {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
