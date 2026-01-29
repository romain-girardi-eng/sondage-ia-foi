"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, useLanguage, useHasAnimated } from "@/lib";
import { AnimatedBackground, LanguageSwitcher } from "@/components/ui";
import type { Answers } from "@/data";
import { useCSRF } from "@/hooks/useCSRF";

interface EmailCollectionScreenProps {
  answers: Answers;
  anonymousId: string;
  responseId?: string;
  onSuccess: () => void;
}

type SubmissionState = "idle" | "loading" | "success" | "error" | "duplicate";

export function EmailCollectionScreen({
  answers,
  anonymousId,
  responseId,
  onSuccess,
}: EmailCollectionScreenProps) {
  const { t, language } = useLanguage();
  const hasAnimated = useHasAnimated();
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { fetchWithCSRF, token: csrfToken, isLoading: isCsrfLoading } = useCSRF();

  // Simple email validation
  const isValidEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setSubmissionState("error");
      setErrorMessage(t("email.invalidEmail"));
      return;
    }

    setSubmissionState("loading");
    setErrorMessage("");

    if (!csrfToken) {
      setSubmissionState("error");
      setErrorMessage(t("email.error"));
      return;
    }

    try {
      const response = await fetchWithCSRF("/api/email/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          responseId,
          anonymousId,
          marketingConsent,
          language,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.duplicate) {
          setSubmissionState("duplicate");
          setErrorMessage(t("email.duplicate"));
        } else {
          setSubmissionState("error");
          setErrorMessage(data.error || t("email.error"));
        }
        return;
      }

      setSubmissionState("success");

      // Proceed to feedback after a short delay to show success state
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch {
      setSubmissionState("error");
      setErrorMessage(t("email.error"));
    }
  };

  const getButtonContent = () => {
    switch (submissionState) {
      case "loading":
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t("email.sending")}</span>
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>{t("email.sent")}</span>
          </>
        );
      default:
        return (
          <>
            <Send className="w-5 h-5" />
            <span>{t("email.submit")}</span>
          </>
        );
    }
  };

  const getButtonClasses = () => {
    const base = "w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300";

    if (submissionState === "success") {
      return cn(base, "bg-emerald-500 text-white cursor-default");
    }
    if (submissionState === "loading") {
      return cn(base, "bg-blue-500/50 text-white cursor-wait");
    }

    return cn(
      base,
      "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
      "hover:from-blue-600 hover:to-purple-700 hover:scale-[1.02]",
      "active:scale-[0.98]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    );
  };

  return (
    <AnimatedBackground variant="default" showGrid showOrbs>
      <LanguageSwitcher />
      <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 max-w-lg mx-auto py-12">
        {/* Header */}
        <motion.header
          initial={hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-8"
        >
          <motion.div
            initial={hasAnimated ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-border"
          >
            <Mail className="w-10 h-10 text-blue-500" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span className="text-gradient-animated">{t("email.title")}</span>
          </h1>

          <p className="text-muted-foreground max-w-sm mx-auto">
            {t("email.subtitle")}
          </p>
        </motion.header>

        {/* Form Card */}
        <motion.form
          initial={hasAnimated ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="w-full glass-card-refined rounded-2xl p-6 md:p-8 space-y-6"
        >
          {/* Email Input */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submissionState === "error" || submissionState === "duplicate") {
                    setSubmissionState("idle");
                    setErrorMessage("");
                  }
                }}
                placeholder={t("email.placeholder")}
                disabled={submissionState === "loading" || submissionState === "success"}
                className={cn(
                  "w-full px-5 py-4 rounded-xl bg-input border text-foreground placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
                  "transition-all duration-200",
                  submissionState === "error" || submissionState === "duplicate"
                    ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                    : "border-border"
                )}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Error Message */}
            {(submissionState === "error" || submissionState === "duplicate") && errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </div>

          {/* Marketing Consent */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                disabled={submissionState === "loading" || submissionState === "success"}
                className="peer sr-only"
              />
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 transition-all duration-200",
                  "border-muted-foreground/30 bg-input",
                  "peer-checked:border-blue-500 peer-checked:bg-blue-500",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/50"
                )}
              />
              <svg
                className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {t("email.marketingConsent")}
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              !email ||
              submissionState === "loading" ||
              submissionState === "success" ||
              isCsrfLoading ||
              !csrfToken
            }
            className={getButtonClasses()}
          >
            {getButtonContent()}
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-center text-muted-foreground/60">
            {t("email.privacyNote")}
          </p>
        </motion.form>

      </div>
    </AnimatedBackground>
  );
}
