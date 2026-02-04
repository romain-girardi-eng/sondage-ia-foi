"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { SURVEY_QUESTIONS } from "@/data";
import { useLanguage } from "@/lib";
import { useFingerprint } from "@/lib/hooks/useFingerprint";
import { LazyResultsDashboard as ResultsDashboard } from "@/components/dashboard";
import { AnimatedBackground, LanguageSwitcher } from "@/components/ui";
import { SurveyIntroShader } from "./SurveyIntroShader";
import { QuestionCard } from "./QuestionCard";
import { FeedbackScreen } from "./FeedbackScreen";
import { ThankYouScreen } from "./ThankYouScreen";
import { EmailCollectionScreen } from "./EmailCollectionScreen";
import { AlreadySubmittedScreen } from "./AlreadySubmittedScreen";
import { EmailHashVerification } from "./EmailHashVerification";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Save, RotateCcw, PlayCircle } from "lucide-react";

type SurveyStep = "intro" | "questions" | "verify-email" | "email" | "feedback" | "thanks" | "results";

const STORAGE_KEY = "survey-progress";
const SESSION_KEY = "survey-session";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const SAVE_DEBOUNCE_MS = 1000; // 1 second debounce for localStorage writes
const ALLOW_VIEW_OVERRIDE = process.env.NEXT_PUBLIC_ENABLE_SURVEY_VIEW_OVERRIDE === "true" || process.env.NODE_ENV !== "production";

interface SavedProgress {
  answers: Record<string, string | number | string[] | Record<string, number>>;
  currentIndex: number;
  timestamp: number;
  sessionId: string;
}

// Check URL for direct navigation (dev mode) - only call after mount
function getViewFromUrl(): SurveyStep | null {
  if (typeof window === "undefined") return null;
  if (!ALLOW_VIEW_OVERRIDE) return null;
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (view === "results") return "results";
  if (view === "feedback") return "feedback";
  if (view === "thanks") return "thanks";
  if (view === "email") return "email";
  return null;
}

// Get or create session ID - using native crypto API instead of uuid package
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
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
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// Hook to detect client-side rendering (SSR-safe) - kept for potential future use
// function useIsClient() {
//   return useSyncExternalStore(
//     () => () => {},
//     () => true,
//     () => false
//   );
// }

interface SurveyContainerProps {
  initialLanguage?: "fr" | "en";
}

export function SurveyContainer({ initialLanguage }: SurveyContainerProps = {}) {
  const { t, language, setLanguage } = useLanguage();
  const hasInitializedLanguage = useRef(false);

  // Browser fingerprint for duplicate detection
  const { fingerprint } = useFingerprint();

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
  const [step, setStep] = useState<SurveyStep>("intro");
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[] | Record<string, number>>>({});
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [responseId, setResponseId] = useState<string | undefined>();
  // Use state for IDs that are passed to child components (required during render)
  const [anonymousIdState, setAnonymousIdState] = useState<string>("");
  // Track when survey started for time spent calculation
  const surveyStartTime = useRef<number>(0);
  // Submission error state
  const [submissionError, setSubmissionError] = useState<{ code: string; message: string } | null>(null);
  // Transitioning state to prevent blank pages during step transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Email hash for verification (stored only as hash, never the actual email)

  // Use refs for values only used internally (not during render)
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>("");
  const isSavingRef = useRef(false);
  const [savingIndicator, setSavingIndicator] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle hydration and URL-based navigation (dev mode)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration pattern
    setIsHydrated(true);
    const viewFromUrl = getViewFromUrl();
    if (viewFromUrl) {
       
      setStep(viewFromUrl);
    }
  }, []);

  // Initialize session and check for saved progress
  useEffect(() => {
    sessionId.current = getSessionId();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration pattern
    setAnonymousIdState(getAnonymousId());

    // Check for saved progress (only if not navigating via URL)
    const viewFromUrl = getViewFromUrl();
    if (viewFromUrl) return; // Skip resume modal for dev mode URL navigation

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

  // Auto-save to localStorage with debouncing to reduce main-thread blocking
  useEffect(() => {
    if (step !== "questions" || Object.keys(answers).length === 0) return;

    // Debounced save function to prevent multiple rapid writes
    const saveProgressDebounced = () => {
      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (isSavingRef.current) return; // Skip if already saving
        isSavingRef.current = true;
        setSavingIndicator(true);

        const progress: SavedProgress = {
          answers,
          currentIndex,
          timestamp: Date.now(),
          sessionId: sessionId.current,
        };

        // Use requestIdleCallback for non-blocking write when available
        const performSave = () => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
          } catch (e) {
            console.error("Failed to save progress:", e);
          }
          isSavingRef.current = false;
          // Keep indicator visible briefly for UX feedback
          setTimeout(() => setSavingIndicator(false), 300);
        };

        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(performSave, { timeout: 1000 });
        } else {
          performSave();
        }
      }, SAVE_DEBOUNCE_MS);
    };

    // Save on changes (debounced)
    saveProgressDebounced();

    // Also save periodically (direct, not debounced)
    const interval = setInterval(() => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      const progress: SavedProgress = {
        answers,
        currentIndex,
        timestamp: Date.now(),
        sessionId: sessionId.current,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      isSavingRef.current = false;
    }, AUTO_SAVE_INTERVAL);

    return () => {
      clearInterval(interval);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
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
    surveyStartTime.current = Date.now();
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnswer = useCallback(
    (value: string | number | string[] | Record<string, number>) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    },
    [currentQuestion]
  );

  const handleNext = useCallback(async () => {
    if (currentIndex >= totalQuestions - 1) {
      // Survey questions complete - go to email verification first
      localStorage.removeItem(STORAGE_KEY);
      setStep("verify-email");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  // Handle email hash verification - submits survey after verification
  // email parameter is only provided if user wants PDF results (not stored, only used to send)
  const handleEmailHashVerified = useCallback(async (hash: string, email: string | null) => {
    // Show loading state immediately to prevent blank page during transition
    setIsTransitioning(true);

    // Calculate time spent
    const timeSpent = surveyStartTime.current > 0
      ? Date.now() - surveyStartTime.current
      : undefined;

    let submittedResponseId: string | undefined;
    
    // Get CSRF token first (needed for both submission and PDF sending)
    let csrfToken: string | null = null;
    try {
      const csrfResponse = await fetch("/api/csrf");
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        csrfToken = csrfData.token;
      }
    } catch (csrfError) {
      console.warn("Failed to get CSRF token:", csrfError);
    }

    // Submit to API with email hash
    if (consentGiven) {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (csrfToken) {
          headers["x-csrf-token"] = csrfToken;
        }

        const response = await fetch("/api/survey/submit", {
          method: "POST",
          headers,
          credentials: "include", // Include cookies for CSRF validation
          body: JSON.stringify({
            sessionId: sessionId.current,
            answers,
            metadata: {
              completedAt: new Date().toISOString(),
              startedAt: surveyStartTime.current > 0
                ? new Date(surveyStartTime.current).toISOString()
                : undefined,
              timeSpent,
              language,
            },
            consentGiven: true,
            consentVersion: "1.0",
            anonymousId: anonymousIdState,
            fingerprint: fingerprint || undefined,
            emailHash: hash,
          }),
        });

        const data = await response.json();

        // Check for any 403 error (duplicate submission OR CSRF failure)
        if (response.status === 403) {
          setIsTransitioning(false);
          if (data.code) {
            setSubmissionError({ code: data.code, message: data.error });
          } else {
            // CSRF or other validation error
            setSubmissionError({ code: "SUBMISSION_FAILED", message: data.error || "Submission failed" });
          }
          return;
        }

        // Check for other errors
        if (!response.ok) {
          setIsTransitioning(false);
          console.error("Survey submission failed:", data);
          setSubmissionError({ code: "SUBMISSION_ERROR", message: data.error || "Failed to save survey" });
          return;
        }

        // Store response ID
        if (data.responseId) {
          setResponseId(data.responseId);
          submittedResponseId = data.responseId;
        }
      } catch (error) {
        console.error("Failed to submit survey:", error);
        // Still proceed - don't block user for network errors
      }
    }

    // Send PDF immediately if email provided (email is NOT stored, only used to send)
    if (email && csrfToken) {
      try {
        const pdfHeaders: Record<string, string> = { "Content-Type": "application/json" };
        if (csrfToken) {
          pdfHeaders["x-csrf-token"] = csrfToken;
        }

        await fetch("/api/email/send-pdf", {
          method: "POST",
          headers: pdfHeaders,
          credentials: "include",
          body: JSON.stringify({
            submissionId: submittedResponseId || "demo-" + Date.now(),
            email,
            language,
            anonymousId: anonymousIdState,
            answers,
          }),
        });
        // Don't wait for response or handle errors - best effort delivery
      } catch (error) {
        console.error("Failed to send PDF:", error);
        // Don't block user - PDF sending is best effort
      }
    } else if (email && !csrfToken) {
      console.warn("Skipping PDF send because CSRF token is unavailable");
    }

    // Go directly to feedback (skip email collection step)
    setStep("feedback");
    setIsTransitioning(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [consentGiven, answers, language, anonymousIdState, fingerprint]);

  // Handle when email already used (from hash verification)
  const handleEmailAlreadyUsed = useCallback(() => {
    setSubmissionError({
      code: "EMAIL_ALREADY_USED",
      message: "This email has already been used to complete the survey."
    });
  }, []);

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

  // Auto-scroll on question change
  useEffect(() => {
    if (step === "questions") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex, step]);

  // Show loading state until hydrated (prevents hydration mismatch for dev mode URL navigation)
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/80 rounded-full animate-spin" />
      </div>
    );
  }

  // Show loading state during step transitions (prevents blank page when clicking fast)
  if (isTransitioning) {
    return (
      <AnimatedBackground variant="subtle" showGrid showOrbs>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">{t("survey.submitting")}</p>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  // Show error screen if submission was blocked (duplicate detected)
  if (submissionError) {
    return <AlreadySubmittedScreen errorCode={submissionError.code} />;
  }

  // Resume Modal
  if (showResumeModal && savedProgress) {
    return (
      <AnimatedBackground variant="subtle" showGrid showOrbs>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card-refined rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("session.resumeTitle")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("session.resumeDescription")}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-all flex items-center justify-center gap-2"
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

  // Email hash verification screen (required, after last question)
  if (step === "verify-email") {
    return (
      <EmailHashVerification
        onVerified={handleEmailHashVerified}
        onAlreadySubmitted={handleEmailAlreadyUsed}
      />
    );
  }

  // Email collection screen (optional, for contact)
  if (step === "email") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <EmailCollectionScreen
          answers={answers}
          anonymousId={anonymousIdState}
          responseId={responseId}
          onSuccess={handleEmailSuccess}
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
          anonymousId={anonymousIdState}
        />
      </div>
    );
  }

  // Thank you screen
  if (step === "thanks") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <ThankYouScreen onViewResults={handleViewResults} anonymousId={anonymousIdState} />
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
            {savingIndicator && (
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
          className="w-full h-1.5 bg-muted rounded-full overflow-hidden"
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
            className="flex items-center gap-1.5 px-3 py-2 -ml-3 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent transition-all duration-200 rounded-lg hover:bg-accent"
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
