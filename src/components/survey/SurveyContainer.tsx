"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { SURVEY_QUESTIONS } from "@/data";
import { useLanguage } from "@/lib";
import { LazyResultsDashboard as ResultsDashboard } from "@/components/dashboard";
import { AnimatedBackground, LanguageSwitcher } from "@/components/ui";
import { SurveyIntroShader } from "./SurveyIntroShader";
import { QuestionCard } from "./QuestionCard";
import { FeedbackScreen } from "./FeedbackScreen";
import { ThankYouScreen } from "./ThankYouScreen";
import { EmailCollectionScreen } from "./EmailCollectionScreen";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Save, RotateCcw, PlayCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type SurveyStep = "intro" | "questions" | "email" | "feedback" | "thanks" | "results";

const STORAGE_KEY = "survey-progress";
const SESSION_KEY = "survey-session";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface SavedProgress {
  answers: Record<string, string | number | string[]>;
  currentIndex: number;
  timestamp: number;
  sessionId: string;
}

// Check URL for direct navigation (dev mode)
function getInitialStep(): SurveyStep {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view === "results") return "results";
    if (view === "feedback") return "feedback";
    if (view === "thanks") return "thanks";
    if (view === "email") return "email";
  }
  return "intro";
}

// Get or create session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// Get anonymous ID for GDPR
function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  const key = "survey-anonymous-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(key, id);
  }
  return id;
}

interface SurveyContainerProps {
  initialLanguage?: "fr" | "en";
}

export function SurveyContainer({ initialLanguage }: SurveyContainerProps = {}) {
  const { t, language, setLanguage } = useLanguage();
  const hasInitializedLanguage = useRef(false);

  // Set initial language from URL ONLY on first mount (not on every language change)
  useEffect(() => {
    if (!hasInitializedLanguage.current && initialLanguage) {
      hasInitializedLanguage.current = true;
      // Only set if no saved preference exists in localStorage
      const savedLang = localStorage.getItem("survey-language");
      if (!savedLang) {
        setLanguage(initialLanguage);
      }
    }
  }, [initialLanguage, setLanguage]);
  const [step, setStep] = useState<SurveyStep>(getInitialStep);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [responseId, setResponseId] = useState<string | undefined>();

  const containerRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>("");
  const anonymousId = useRef<string>("");

  // Initialize session and check for saved progress
  useEffect(() => {
    sessionId.current = getSessionId();
    anonymousId.current = getAnonymousId();

    // Check for saved progress
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const progress: SavedProgress = JSON.parse(saved);
        // Only show resume modal if progress is less than 24 hours old
        const hoursSinceLastSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
        if (hoursSinceLastSave < 24 && Object.keys(progress.answers).length > 0) {
          setSavedProgress(progress);
          setShowResumeModal(true);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (step !== "questions" || Object.keys(answers).length === 0) return;

    const saveProgress = () => {
      setIsSaving(true);
      const progress: SavedProgress = {
        answers,
        currentIndex,
        timestamp: Date.now(),
        sessionId: sessionId.current,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setTimeout(() => setIsSaving(false), 500);
    };

    // Save immediately on changes
    saveProgress();

    // Also save periodically
    const interval = setInterval(saveProgress, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [answers, currentIndex, step]);

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

  // Filter questions based on conditions
  const visibleQuestions = useMemo(() => {
    return SURVEY_QUESTIONS.filter((q) => {
      if (!q.condition) return true;
      return q.condition(answers);
    });
  }, [answers]);

  const currentQuestion = visibleQuestions[currentIndex];
  const totalQuestions = visibleQuestions.length;
  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;

  const handleResume = useCallback(() => {
    if (savedProgress) {
      setAnswers(savedProgress.answers);
      setCurrentIndex(savedProgress.currentIndex);
      setStep("questions");
      setShowResumeModal(false);
    }
  }, [savedProgress]);

  const handleRestart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedProgress(null);
    setShowResumeModal(false);
    setAnswers({});
    setCurrentIndex(0);
  }, []);

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
      // Survey complete - clear saved progress and submit
      localStorage.removeItem(STORAGE_KEY);

      // Submit to API if consent given
      if (consentGiven) {
        try {
          const response = await fetch("/api/survey/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionId.current,
              answers,
              metadata: {
                completedAt: new Date().toISOString(),
                language,
              },
              consentGiven: true,
              consentVersion: "1.0",
              anonymousId: anonymousId.current,
            }),
          });

          // Store response ID for email submission
          const data = await response.json();
          if (data.id) {
            setResponseId(data.id);
          }
        } catch (error) {
          console.error("Failed to submit survey:", error);
        }
      }

      // Go to email collection step instead of feedback
      setStep("email");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions, answers, consentGiven, language]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleEmailSuccess = useCallback(() => {
    setStep("feedback");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEmailSkip = useCallback(() => {
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

  // Auto-scroll on question change
  useEffect(() => {
    if (step === "questions") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex, step]);

  // Resume Modal
  if (showResumeModal && savedProgress) {
    return (
      <AnimatedBackground variant="subtle" showGrid showOrbs>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t("session.resumeTitle")}
            </h2>
            <p className="text-white/60 mb-8">
              {t("session.resumeDescription")}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t("session.restartButton")}
              </button>
              <button
                onClick={handleResume}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                {t("session.resumeButton")}
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatedBackground>
    );
  }

  // Intro screen (with shader background)
  if (step === "intro") {
    return (
      <SurveyIntroShader
        onStart={handleStart}
        onConsentChange={setConsentGiven}
        consentGiven={consentGiven}
      />
    );
  }

  // Email collection screen
  if (step === "email") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <EmailCollectionScreen
          answers={answers}
          anonymousId={anonymousId.current}
          responseId={responseId}
          onSuccess={handleEmailSuccess}
          onSkip={handleEmailSkip}
        />
      </div>
    );
  }

  // Feedback screen (personalized results)
  if (step === "feedback") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <FeedbackScreen
          answers={answers}
          onContinue={handleFeedbackContinue}
          anonymousId={anonymousId.current}
        />
      </div>
    );
  }

  // Thank you screen
  if (step === "thanks") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <ThankYouScreen onViewResults={handleViewResults} anonymousId={anonymousId.current} />
      </div>
    );
  }

  // Results dashboard
  if (step === "results") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 py-8">
        <ResultsDashboard />
      </div>
    );
  }

  // Questions screen
  if (!currentQuestion) {
    return null;
  }

  return (
    <AnimatedBackground variant="subtle" showGrid showOrbs>
      <LanguageSwitcher />
      <div
        ref={containerRef}
        className="w-full min-h-[100dvh] flex flex-col max-w-4xl mx-auto px-4 py-6 md:py-12 relative"
      >
      {/* Header: Progress Bar */}
      <header className="w-full shrink-0 mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs text-muted-foreground font-medium">
            {t("survey.questionOf", { current: currentIndex + 1, total: totalQuestions })}
          </span>
          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="text-xs text-blue-400 flex items-center gap-1">
                <Save className="w-3 h-3 animate-pulse" />
                {t("session.saving")}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div
          className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("survey.questionOf", { current: currentIndex + 1, total: totalQuestions })}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 flex flex-col justify-center py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full"
          >
            <QuestionCard
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={handleAnswer}
              onNext={handleNext}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer: Navigation */}
      <footer className="mt-auto pt-8 shrink-0">
        <div className="flex justify-between items-center w-full max-w-2xl mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            aria-label={t("survey.previous")}
            className="flex items-center gap-1.5 px-3 py-2 -ml-3 text-sm text-muted-foreground hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent transition-all duration-200 rounded-lg hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("survey.previous")}</span>
          </button>

          <div
            className="text-[10px] md:text-xs tracking-[0.15em] font-medium text-muted-foreground/60 uppercase"
            aria-hidden="true"
          >
            {currentIndex + 1} / {totalQuestions}
          </div>

          {/* Spacer for layout balance */}
          <div className="w-[88px] sm:w-[100px]" />
        </div>
      </footer>
      </div>
    </AnimatedBackground>
  );
}
