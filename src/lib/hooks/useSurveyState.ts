"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { SURVEY_QUESTIONS } from "@/data";
import { useLanguage } from "@/lib/i18n";

export type SurveyStep = "intro" | "questions" | "email" | "feedback" | "thanks" | "results";

interface SavedProgress {
  answers: Record<string, string | number | string[]>;
  currentIndex: number;
  timestamp: number;
  sessionId: string;
}

// Check URL for direct navigation (dev mode) - only call after mount
function getViewFromUrl(): SurveyStep | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (view === "results") return "results";
  if (view === "feedback") return "feedback";
  if (view === "thanks") return "thanks";
  if (view === "email") return "email";
  return null;
}

export interface UseSurveyStateProps {
  initialLanguage?: "fr" | "en";
  onComplete?: (answers: Record<string, string | number | string[]>) => Promise<void>;
}

export interface UseSurveyStateReturn {
  // State
  step: SurveyStep;
  isHydrated: boolean;
  currentIndex: number;
  answers: Record<string, string | number | string[]>;
  consentGiven: boolean;
  responseId: string | undefined;

  // Computed
  currentQuestion: typeof SURVEY_QUESTIONS[number] | undefined;
  visibleQuestions: typeof SURVEY_QUESTIONS;
  totalQuestions: number;
  progress: number;

  // Actions
  setStep: (step: SurveyStep) => void;
  setConsentGiven: (consent: boolean) => void;
  setResponseId: (id: string | undefined) => void;
  handleStart: () => void;
  handleAnswer: (value: string | number | string[]) => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  handleEmailSuccess: () => void;
  handleFeedbackContinue: () => void;
  handleViewResults: () => void;
  handleResume: (progress: SavedProgress) => void;
  handleRestart: () => void;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | number | string[]>>>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Hook to manage survey state and navigation logic
 * Separates state management from UI rendering
 */
export function useSurveyState({
  initialLanguage,
  onComplete,
}: UseSurveyStateProps = {}): UseSurveyStateReturn {
  const { t, setLanguage } = useLanguage();
  const hasInitializedLanguage = useRef(false);

  // Core state
  const [step, setStep] = useState<SurveyStep>("intro");
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [responseId, setResponseId] = useState<string | undefined>();

  // Set initial language from URL ONLY on first mount
  useEffect(() => {
    if (!hasInitializedLanguage.current && initialLanguage) {
      hasInitializedLanguage.current = true;
      const savedLang = localStorage.getItem("survey-language");
      if (!savedLang) {
        setLanguage(initialLanguage);
      }
    }
  }, [initialLanguage, setLanguage]);

  // Handle hydration and URL-based navigation (dev mode)
  // This setState pattern is intentional for client-side hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration pattern
    setIsHydrated(true);
    const viewFromUrl = getViewFromUrl();
    if (viewFromUrl) {
      setStep(viewFromUrl);
    }
  }, []);

  // Beforeunload warning
  useEffect(() => {
    if (step !== "questions" || Object.keys(answers).length === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = t("session.leaveWarning");
      return t("session.leaveWarning");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, answers, t]);

  // Filter questions based on conditions - memoized
  const visibleQuestions = useMemo(() => {
    return SURVEY_QUESTIONS.filter((q) => {
      if (!q.condition) return true;
      return q.condition(answers);
    });
  }, [answers]);

  const currentQuestion = visibleQuestions[currentIndex];
  const totalQuestions = visibleQuestions.length;
  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;

  // Navigation handlers
  const handleStart = useCallback(() => {
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnswer = useCallback(
    (value: string | number | string[]) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    },
    [currentQuestion]
  );

  const handleNext = useCallback(async () => {
    if (currentIndex >= totalQuestions - 1) {
      // Survey complete
      if (onComplete && consentGiven) {
        await onComplete(answers);
      }
      setStep("email");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions, answers, consentGiven, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleEmailSuccess = useCallback(() => {
    setStep("feedback");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFeedbackContinue = useCallback(() => {
    setStep("thanks");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleViewResults = useCallback(() => {
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleResume = useCallback((progress: SavedProgress) => {
    setAnswers(progress.answers);
    setCurrentIndex(progress.currentIndex);
    setStep("questions");
  }, []);

  const handleRestart = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setStep("intro");
  }, []);

  // Auto-scroll on question change
  useEffect(() => {
    if (step === "questions") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex, step]);

  return {
    // State
    step,
    isHydrated,
    currentIndex,
    answers,
    consentGiven,
    responseId,

    // Computed
    currentQuestion,
    visibleQuestions,
    totalQuestions,
    progress,

    // Actions
    setStep,
    setConsentGiven,
    setResponseId,
    handleStart,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleEmailSuccess,
    handleFeedbackContinue,
    handleViewResults,
    handleResume,
    handleRestart,
    setAnswers,
    setCurrentIndex,
  };
}
