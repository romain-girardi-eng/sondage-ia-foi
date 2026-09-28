"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  CONSENT_VERSION,
  INSTRUMENT_VERSION,
  getVisibleQuestions,
  isScreenedOut,
} from "@/data/surveySchema";
import { useLanguage } from "@/lib";
import { useFingerprint } from "@/lib/hooks/useFingerprint";
import {
  parseSavedProgress,
  type SavedProgress,
  type SurveyAnswers,
  type SurveyAnswerValue,
} from "@/lib/hooks/surveyProgress";
import { LazyResultsDashboard as ResultsDashboard } from "@/components/dashboard";
import { AnimatedBackground, LanguageSwitcher } from "@/components/ui";
import { SurveyIntroShader } from "./SurveyIntroShader";
import { QuestionCard } from "./QuestionCard";
import { FeedbackScreen } from "./FeedbackScreen";
import { ThankYouScreen } from "./ThankYouScreen";
import { AlreadySubmittedScreen } from "./AlreadySubmittedScreen";
import { EmailHashVerification } from "./EmailHashVerification";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Save, RotateCcw, PlayCircle, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { useCSRF } from "@/hooks/useCSRF";

type SurveyStep =
  | "intro"
  | "questions"
  | "verify-email"
  | "feedback"
  | "thanks"
  | "screen-out-confirm"
  | "screened-out"
  | "results";

const STORAGE_KEY = "survey-progress";
const SESSION_KEY = "survey-session";
const ANONYMOUS_ID_KEY = "survey-anonymous-id";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const SAVE_DEBOUNCE_MS = 1000; // 1 second debounce for localStorage writes
// Server-side progress save (sessions.partial_answers): the only record of an
// abandoned questionnaire, which the pre-registered attrition analysis needs.
const SERVER_SAVE_DEBOUNCE_MS = 2000;
const ALLOW_VIEW_OVERRIDE = process.env.NEXT_PUBLIC_ENABLE_SURVEY_VIEW_OVERRIDE === "true" || process.env.NODE_ENV !== "production";

// Check URL for direct navigation (dev mode) - only call after mount
function getViewFromUrl(): SurveyStep | null {
  if (typeof window === "undefined") return null;
  if (!ALLOW_VIEW_OVERRIDE) return null;
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (view === "results") return "results";
  if (view === "feedback") return "feedback";
  if (view === "thanks") return "thanks";
  if (view === "screened-out") return "screened-out";
  return null;
}

// Presence of the session or anonymous-id key is itself proof the user
// already consented and started the survey in a previous visit (both are
// only ever written post-consent, see getSessionId/getAnonymousId below).
// Used to decide, on mount, whether it's safe to re-hydrate (not create).
function hasExistingSurveyIdentity(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(SESSION_KEY) || localStorage.getItem(ANONYMOUS_ID_KEY));
}

// Get or create session ID - using native crypto API instead of uuid package.
// CRITICAL: only call after consent has been given - this writes to localStorage.
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// Get anonymous ID for GDPR.
// CRITICAL: only call after consent has been given - this writes to localStorage.
function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
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

interface SubmitResponseBody {
  error?: string;
  code?: string;
  questionId?: string;
  responseId?: string;
}

interface SurveyContainerProps {
  initialLanguage?: "fr" | "en";
  // Landing variant: "cnef" renders the CNEF co-branded intro.
  variant?: "general" | "cnef";
  // Pre-filled answers (e.g. CNEF deep-link seeds profil_confession=protestant).
  initialAnswers?: SurveyAnswers;
}

export function SurveyContainer({ initialLanguage, variant = "general", initialAnswers }: SurveyContainerProps = {}) {
  const { t, language, setLanguage } = useLanguage();
  const hasInitializedLanguage = useRef(false);

  // Fingerprinting probes the device and must only start after consent
  // (CNIL/ePrivacy): enabled once the user ticks consent and starts the
  // survey (handleStart), or immediately on mount for a returning user who
  // already consented in a previous visit (see hasExistingSurveyIdentity).
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const { fingerprint } = useFingerprint({ enabled: fingerprintEnabled });
  const { fetchWithCSRF, token: csrfToken } = useCSRF();

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
  const [requestedIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>(() => ({ ...initialAnswers }));
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  // Use state for IDs that are passed to child components (required during render)
  const [anonymousIdState, setAnonymousIdState] = useState<string>("");
  // Track when survey started for time spent calculation
  const surveyStartTime = useRef<number>(0);
  // Lowest reachable question index (CNEF deep-link locks earlier, pre-filled
  // questions so the seeded confession cannot be silently changed).
  const [minIndex, setMinIndex] = useState(0);
  // Submission error state
  const [submissionError, setSubmissionError] = useState<{ code: string; message: string } | null>(null);
  // Transitioning state to prevent blank pages during step transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Email hash for verification (stored only as hash, never the actual email)
  // Last verification result, kept only to retry submission after a network
  // failure - never persisted, cleared once the survey is actually submitted.
  const lastEmailHashRef = useRef<string>("");
  const lastEmailForPdfRef = useRef<string | null>(null);
  // Which submission a retry should replay after a network failure.
  const retryModeRef = useRef<"email" | "screen-out">("email");

  // Use refs for values only used internally (not during render)
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>("");
  const isSavingRef = useRef(false);
  const [savingIndicator, setSavingIndicator] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Question the server rejected for an exclusive-option conflict: the
  // respondent is sent back to it with an inline notice.
  const [conflictQuestionId, setConflictQuestionId] = useState<string | null>(null);

  // Filter questions based on conditions. A respondent outside the studied
  // population (profil_confession = sans_religion) is screened out: the
  // schema helper then exposes the confession question only.
  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);

  const totalQuestions = visibleQuestions.length;
  // A shrinking visible list (a changed ancestor answer, or a resumed session)
  // can leave the requested index past the end of the list: clamp it while
  // rendering rather than correcting the state from an effect.
  const currentIndex = totalQuestions > 0 ? Math.min(requestedIndex, totalQuestions - 1) : 0;
  const currentQuestion = visibleQuestions[currentIndex];
  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;

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
    // A returning user who already has a session/anonymous-id in
    // localStorage necessarily consented and started in a prior visit
    // (these keys are only ever written post-consent, in handleStart).
    // It's safe to re-hydrate them - and re-enable fingerprinting - here,
    // without waiting for a fresh consent tick.
    if (hasExistingSurveyIdentity()) {
      sessionId.current = getSessionId();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration pattern
      setAnonymousIdState(getAnonymousId());
      setFingerprintEnabled(true);
    }

    // Check for saved progress (only if not navigating via URL)
    const viewFromUrl = getViewFromUrl();
    if (viewFromUrl) return; // Skip resume modal for dev mode URL navigation

    // Saved progress is only resumable when it belongs to the current
    // instrument version: v1 answers carry v1 option codes and would be
    // submitted stamped as v2. Anything else is silently discarded.
    const progress = parseSavedProgress(localStorage.getItem(STORAGE_KEY));
    if (progress) {
      setSavedProgress(progress);
      setShowResumeModal(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
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
          instrumentVersion: INSTRUMENT_VERSION,
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
        instrumentVersion: INSTRUMENT_VERSION,
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

  // Server-side progress save. The latest payload waits in a ref and is sent
  // after a short debounce, or at once when the respondent leaves the question
  // flow or hides the page (keepalive lets the request outlive the tab).
  const pendingServerSaveRef = useRef<string | null>(null);
  const serverSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushServerSave = useCallback(() => {
    if (serverSaveTimerRef.current) {
      clearTimeout(serverSaveTimerRef.current);
      serverSaveTimerRef.current = null;
    }
    const body = pendingServerSaveRef.current;
    if (!body) return;
    pendingServerSaveRef.current = null;
    fetchWithCSRF("/api/survey/partial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch((error: unknown) => {
      console.warn("Failed to save progress to the server:", error);
    });
  }, [fetchWithCSRF]);

  useEffect(() => {
    if (step !== "questions") {
      // Leaving the question flow (email step, screen-out confirmation): the
      // last answers must reach the server before any further step.
      flushServerSave();
      return;
    }
    if (!sessionId.current || !anonymousIdState || !csrfToken) return;

    const visibleIds = new Set(visibleQuestions.map((q) => q.id));
    pendingServerSaveRef.current = JSON.stringify({
      sessionId: sessionId.current,
      anonymousId: anonymousIdState,
      answers: Object.fromEntries(
        Object.entries(answers).filter(([key]) => visibleIds.has(key))
      ),
      lastQuestionIndex: currentIndex,
      language,
      instrumentVersion: INSTRUMENT_VERSION,
      entryVariant: variant,
    });

    if (serverSaveTimerRef.current) clearTimeout(serverSaveTimerRef.current);
    serverSaveTimerRef.current = setTimeout(flushServerSave, SERVER_SAVE_DEBOUNCE_MS);
  }, [answers, anonymousIdState, csrfToken, currentIndex, flushServerSave, language, step, variant, visibleQuestions]);

  useEffect(() => {
    const handleHide = () => {
      if (document.visibilityState === "hidden") flushServerSave();
    };
    window.addEventListener("pagehide", flushServerSave);
    document.addEventListener("visibilitychange", handleHide);
    return () => {
      window.removeEventListener("pagehide", flushServerSave);
      document.removeEventListener("visibilitychange", handleHide);
    };
  }, [flushServerSave]);

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
    // The start button is disabled until the consent checkbox is ticked
    // (see spiritual-shader-hero.tsx), so consent is guaranteed here: only
    // now do we create the session/anonymous identifiers and start probing
    // the device for a fingerprint.
    sessionId.current = getSessionId();
    setAnonymousIdState(getAnonymousId());
    setFingerprintEnabled(true);
    // CNEF deep-link: confession (Protestant) and Protestant background
    // (évangélique) are pre-filled, so land directly on the charismatic /
    // non-charismatic question.
    if (variant === "cnef") {
      const idx = visibleQuestions.findIndex((q) => q.id === "profil_confession_evangelique");
      if (idx >= 0) {
        setCurrentIndex(idx);
        setMinIndex(idx);
      } else if (process.env.NODE_ENV !== "production") {
        console.warn("CNEF deep-link target 'profil_confession_evangelique' not found in schema");
      }
    }
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [variant, visibleQuestions]);

  const handleAnswer = useCallback(
    (value: SurveyAnswerValue) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      if (conflictQuestionId === currentQuestion.id) {
        setConflictQuestionId(null);
      }
    },
    [conflictQuestionId, currentQuestion]
  );

  // Single submission path, shared by the normal end of the questionnaire and
  // by the screen-out shortcut. Returns the created response id on success.
  const submitAnswers = useCallback(
    async (
      options: { emailHash?: string; screenedOut?: boolean }
    ): Promise<{ ok: true; responseId?: string } | { ok: false }> => {
      // Submit only answers whose question is currently visible: a respondent
      // who backtracked and changed an ancestor (e.g. confession) can leave
      // stale sub-answers that would otherwise pollute the public aggregates.
      const visibleIds = new Set(visibleQuestions.map((q) => q.id));
      const cleanAnswers = Object.fromEntries(
        Object.entries(answers).filter(([key]) => visibleIds.has(key))
      );

      const timeSpent = surveyStartTime.current > 0
        ? Date.now() - surveyStartTime.current
        : undefined;

      try {
        const response = await fetchWithCSRF("/api/survey/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId.current,
            answers: cleanAnswers,
            metadata: {
              completedAt: new Date().toISOString(),
              startedAt: surveyStartTime.current > 0
                ? new Date(surveyStartTime.current).toISOString()
                : undefined,
              timeSpent,
              language,
              instrumentVersion: INSTRUMENT_VERSION,
              entryVariant: variant,
              ...(options.screenedOut ? { screenedOut: true } : {}),
            },
            consentGiven: true,
            consentVersion: CONSENT_VERSION,
            anonymousId: anonymousIdState,
            fingerprint: fingerprint || undefined,
            emailHash: options.emailHash,
          }),
        });

        const data = (await response.json()) as SubmitResponseBody;

        // Check for any 403 error (duplicate submission OR CSRF failure)
        if (response.status === 403) {
          setIsTransitioning(false);
          setSubmissionError(
            data.code
              ? { code: data.code, message: data.error ?? "Submission failed" }
              : { code: "SUBMISSION_FAILED", message: data.error || "Submission failed" }
          );
          return { ok: false };
        }

        // An exclusive "aucun" option combined with others is recoverable:
        // the server names the offending question, so send the respondent
        // back to it instead of the dead-end error screen.
        if (response.status === 400 && data.code === "EXCLUSIVE_OPTION_CONFLICT" && data.questionId) {
          const conflictIndex = visibleQuestions.findIndex((q) => q.id === data.questionId);
          if (conflictIndex >= 0) {
            setConflictQuestionId(data.questionId);
            setCurrentIndex(conflictIndex);
            setStep("questions");
            setIsTransitioning(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return { ok: false };
          }
        }

        if (!response.ok) {
          setIsTransitioning(false);
          console.error("Survey submission failed:", data);
          setSubmissionError({
            code: "SUBMISSION_ERROR",
            message: data.error ?? "Failed to save survey",
          });
          return { ok: false };
        }

        return { ok: true, responseId: data.responseId };
      } catch (error) {
        // Network failure: this is an academic dataset, so we must not lose
        // the response silently. Surface a retry state instead of advancing
        // as if the submission succeeded.
        console.error("Failed to submit survey:", error);
        setIsTransitioning(false);
        setSubmissionError({
          code: "SUBMISSION_NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error",
        });
        return { ok: false };
      }
    },
    [answers, anonymousIdState, fetchWithCSRF, fingerprint, language, variant, visibleQuestions]
  );

  // Screened-out respondent: store the response (flagged, never scored) and
  // end on a short thank-you screen, with no email step and no profile.
  const handleScreenOutSubmit = useCallback(async () => {
    retryModeRef.current = "screen-out";
    setIsTransitioning(true);
    localStorage.removeItem(STORAGE_KEY);

    if (consentGiven) {
      const result = await submitAnswers({ screenedOut: true });
      if (!result.ok) return;
    }

    setStep("screened-out");
    setIsTransitioning(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [consentGiven, submitAnswers]);

  // The click handler that calls this ran before React re-rendered with the
  // new answer, so the value being committed is passed along: screen-out must
  // be decided on it, not on the state captured by the closure.
  const handleNext = useCallback(
    (committedValue?: SurveyAnswerValue) => {
      const nextAnswers: SurveyAnswers =
        committedValue !== undefined && currentQuestion
          ? { ...answers, [currentQuestion.id]: committedValue }
          : answers;

      // Leaving the studied population never submits on a single click: it
      // asks for a confirmation first (an adjacent mis-click would otherwise
      // end the questionnaire for good).
      if (isScreenedOut(nextAnswers)) {
        setStep("screen-out-confirm");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // The answer just committed can add or remove conditional questions, so
      // the next position is resolved against the list it produces.
      const nextVisible = getVisibleQuestions(nextAnswers);
      const positionInNextList = currentQuestion
        ? nextVisible.findIndex((q) => q.id === currentQuestion.id)
        : -1;
      const nextIndex = positionInNextList >= 0 ? positionInNextList + 1 : currentIndex + 1;

      if (nextIndex >= nextVisible.length) {
        // Survey questions complete - go to email verification first
        localStorage.removeItem(STORAGE_KEY);
        setStep("verify-email");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setCurrentIndex(nextIndex);
      }
    },
    [answers, currentIndex, currentQuestion]
  );

  // "Revenir" from the confirmation: back to the confession question, with the
  // mis-clicked option still selected and every option still choosable.
  const handleScreenOutBack = useCallback(() => {
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle email hash verification - submits survey after verification
  // email parameter is only provided if user wants PDF results (not stored, only used to send)
  const handleEmailHashVerified = useCallback(async (hash: string, email: string | null) => {
    // Show loading state immediately to prevent blank page during transition
    setIsTransitioning(true);
    // Keep the last verification result around so a network failure below
    // can be retried without asking the user to re-verify their email.
    retryModeRef.current = "email";
    lastEmailHashRef.current = hash;
    lastEmailForPdfRef.current = email;

    let submittedResponseId: string | undefined;

    if (consentGiven) {
      const result = await submitAnswers({ emailHash: hash });
      if (!result.ok) return;
      submittedResponseId = result.responseId;
    }

    // Send PDF immediately if email provided (email is NOT stored, only used to send)
    if (email && csrfToken) {
      const visibleIds = new Set(visibleQuestions.map((q) => q.id));
      const cleanAnswers = Object.fromEntries(
        Object.entries(answers).filter(([key]) => visibleIds.has(key))
      );
      try {
        await fetchWithCSRF("/api/email/send-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: submittedResponseId || "demo-" + Date.now(),
            email,
            language,
            anonymousId: anonymousIdState,
            answers: cleanAnswers,
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
  }, [answers, anonymousIdState, consentGiven, csrfToken, fetchWithCSRF, language, submitAnswers, visibleQuestions]);

  // Retry the submission after a network failure, reusing the email hash
  // already obtained (no need to re-verify the email against the API).
  const handleRetrySubmission = useCallback(() => {
    setSubmissionError(null);
    if (retryModeRef.current === "screen-out") {
      void handleScreenOutSubmit();
      return;
    }
    void handleEmailHashVerified(lastEmailHashRef.current, lastEmailForPdfRef.current);
  }, [handleEmailHashVerified, handleScreenOutSubmit]);

  // Handle when email already used (from hash verification)
  const handleEmailAlreadyUsed = useCallback(() => {
    setSubmissionError({
      code: "EMAIL_ALREADY_USED",
      message: "This email has already been used to complete the survey."
    });
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentIndex > minIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, minIndex]);

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

  // Network failure during final submission: recoverable, so offer a retry
  // instead of the duplicate/CSRF "blocked" screen below (data must not be
  // silently lost for an academic dataset).
  if (submissionError?.code === "SUBMISSION_NETWORK_ERROR") {
    return (
      <AnimatedBackground variant="subtle" showGrid showOrbs>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card-refined rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("errors.submissionFailedTitle")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("errors.submissionFailedDesc")}
            </p>
            <button
              onClick={handleRetrySubmission}
              className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t("errors.retry")}
            </button>
          </motion.div>
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
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRestart}
                className="w-full sm:flex-1 min-w-0 px-4 sm:px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                {t("session.restartButton")}
              </button>
              <button
                onClick={handleResume}
                className="w-full sm:flex-1 min-w-0 px-4 sm:px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-4 h-4 shrink-0" />
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
        variant={variant}
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

  // Feedback screen (personalized results)
  if (step === "feedback") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <FeedbackScreen
          answers={answers}
          onContinue={handleFeedbackContinue}
          anonymousId={anonymousIdState}
          entryVariant={variant}
        />
      </div>
    );
  }

  // Screen-out confirmation: a single click on "no religion / other" must
  // never end the questionnaire on its own - the adjacent option is "other
  // Christian" - so the respondent confirms or goes back to correct it.
  if (step === "screen-out-confirm") {
    return (
      <AnimatedBackground variant="subtle" showGrid showOrbs>
        <LanguageSwitcher />
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card-refined rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("screenedOut.confirmTitle")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t("screenedOut.confirmDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleScreenOutBack}
                className="w-full sm:flex-1 min-w-0 px-4 sm:px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                {t("screenedOut.back")}
              </button>
              <button
                onClick={handleScreenOutSubmit}
                className="w-full sm:flex-1 min-w-0 px-4 sm:px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                {t("screenedOut.confirm")}
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatedBackground>
    );
  }

  // Screened-out screen: outside the studied population, no scoring, no
  // profile, no email step - only an acknowledgement.
  if (step === "screened-out") {
    return (
      <AnimatedBackground variant="subtle" showGrid showOrbs>
        <LanguageSwitcher />
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card-refined rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("thanks.screenedOutTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("thanks.screenedOutDescription")}
            </p>
          </motion.div>
        </div>
      </AnimatedBackground>
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
            {conflictQuestionId === currentQuestion.id && (
              <p
                role="alert"
                className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
              >
                {t("survey.exclusiveConflictNotice")}
              </p>
            )}
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
            disabled={currentIndex <= minIndex}
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
