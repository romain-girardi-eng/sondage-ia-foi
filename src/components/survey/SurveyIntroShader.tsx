"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib";
import { LanguageSwitcher } from "@/components/ui";
import SpiritualShaderHero from "@/components/ui/spiritual-shader-hero";
import FAQSection from "@/components/ui/faq-section";
import { X } from "lucide-react";

interface SurveyIntroShaderProps {
  onStart: () => void;
  onConsentChange?: (consent: boolean) => void;
  consentGiven?: boolean;
}

export function SurveyIntroShader({ onStart, onConsentChange, consentGiven = false }: SurveyIntroShaderProps) {
  const { t, language } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);

  // Show video modal after component mounts
  useEffect(() => {
    // Small delay to let the page render first
    const timer = setTimeout(() => setShowVideo(true), 500);
    return () => clearTimeout(timer);
  }, []);

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

      {/* Video Modal Overlay */}
      {showVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95">
          {/* Skip Button */}
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10000] flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all border border-white/20"
          >
            <span>Passer</span>
            <X className="w-4 h-4" />
          </button>

          {/* Video Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
            <video
              autoPlay
              muted
              playsInline
              onEnded={() => setShowVideo(false)}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg sm:rounded-2xl shadow-2xl"
              style={{ maxWidth: "min(90vw, 1200px)" }}
            >
              <source src="/landing-video.webm" type="video/webm" />
              <source src="/landing-video.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10 cursor-pointer"
            onClick={() => setShowVideo(false)}
          />
        </div>
      )}
    </div>
  );
}
