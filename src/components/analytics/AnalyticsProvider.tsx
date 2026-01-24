"use client";

import Script from "next/script";

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SRC = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";

export function AnalyticsProvider() {
  if (!PLAUSIBLE_DOMAIN) {
    return null;
  }

  return (
    <Script
      defer
      data-domain={PLAUSIBLE_DOMAIN}
      src={PLAUSIBLE_SRC}
      strategy="afterInteractive"
    />
  );
}

// Custom event tracking
export function trackEvent(eventName: string, props?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && (window as unknown as { plausible?: (name: string, options?: { props: Record<string, string | number | boolean> }) => void }).plausible) {
    (window as unknown as { plausible: (name: string, options?: { props: Record<string, string | number | boolean> }) => void }).plausible(eventName, props ? { props } : undefined);
  }
}

// Pre-defined events for the survey
export const analyticsEvents = {
  surveyStarted: () => trackEvent("Survey Started"),
  surveyCompleted: () => trackEvent("Survey Completed"),
  surveyAbandoned: (questionIndex: number) => trackEvent("Survey Abandoned", { questionIndex }),
  questionAnswered: (questionId: string) => trackEvent("Question Answered", { questionId }),
  languageChanged: (language: string) => trackEvent("Language Changed", { language }),
  consentGiven: () => trackEvent("Consent Given"),
  resultsViewed: () => trackEvent("Results Viewed"),
  faqViewed: () => trackEvent("FAQ Viewed"),
  privacyViewed: () => trackEvent("Privacy Policy Viewed"),
  dataExported: () => trackEvent("User Data Exported"),
  dataDeleted: () => trackEvent("User Data Deleted"),
};
