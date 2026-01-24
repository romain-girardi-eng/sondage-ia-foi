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
        { icon: "🔬", text: "Étude scientifique" },
        { icon: "🔒", text: "100% anonyme" },
        { icon: "⏱️", text: "3-5 minutes" },
      ]
    : [
        { icon: "🔬", text: "Scientific study" },
        { icon: "🔒", text: "100% anonymous" },
        { icon: "⏱️", text: "3-5 minutes" },
      ];

  return (
    <div className="relative w-screen min-w-full">
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
    </div>
  );
}
