"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Shield, Lock, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib";
import { AnimatedBackground } from "@/components/ui";

interface EmailHashVerificationProps {
  onVerified: (emailHash: string, email: string | null) => void;
  onAlreadySubmitted: () => void;
}

export function EmailHashVerification({
  onVerified,
  onAlreadySubmitted,
}: EmailHashVerificationProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [hash, setHash] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantsPdf, setWantsPdf] = useState(true); // Default to true

  // Prevent double submissions
  const hasSubmittedRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    // Prevent multiple submissions
    if (!email || isChecking || hasSubmittedRef.current) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("emailHash.invalidEmail"));
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/survey/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 409) {
        // Email already used
        hasSubmittedRef.current = true; // Prevent retries
        onAlreadySubmitted();
        return;
      }

      if (!response.ok) {
        setError(data.error || t("emailHash.verificationFailed"));
        setIsChecking(false); // Allow retry on error
        return;
      }

      if (!data.emailHash) {
        setError(t("emailHash.verificationFailed"));
        setIsChecking(false); // Allow retry on error
        return;
      }

      // Success - mark as submitted to prevent double calls
      hasSubmittedRef.current = true;
      setHash(data.emailHash);
      // Pass email only if user wants PDF results (email not stored, only used to send)
      // Keep isChecking true - don't reset it, parent will transition away
      onVerified(data.emailHash, wantsPdf ? email : null);
    } catch (err) {
      console.error("Email verification error:", err);
      setError(t("emailHash.networkError"));
      setIsChecking(false); // Allow retry on network error
    }
    // Note: No finally block - isChecking stays true after successful submission
    // to prevent double-clicks while parent processes the result
  }, [email, isChecking, wantsPdf, onVerified, onAlreadySubmitted, t]);

  const isValidEmail = email.includes("@") && email.includes(".");

  return (
    <AnimatedBackground variant="subtle" showGrid showOrbs>
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full"
        >
          <div className="glass-card-refined rounded-3xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center"
              >
                <Shield className="w-8 h-8 text-blue-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {t("emailHash.title")}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t("emailHash.subtitle")}
              </p>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t("emailHash.emailLabel")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (hash) {
                      setHash("");
                    }
                  }}
                  placeholder={t("emailHash.emailPlaceholder")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Hash Display */}
            {hash && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-foreground">
                    {t("emailHash.yourHash")}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 font-mono text-xs text-green-600 dark:text-green-400 break-all">
                  {hash}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("emailHash.hashExplanation")}
                </p>
              </motion.div>
            )}

            {/* Trust Indicators */}
            <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                {t("emailHash.privacyTitle")}
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {t("emailHash.privacy1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {t("emailHash.privacy2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {t("emailHash.privacy3")}
                </li>
              </ul>
            </div>

            {/* PDF Option */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={wantsPdf}
                  onChange={(e) => setWantsPdf(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border-2 transition-all duration-200 border-muted-foreground/30 bg-background/50 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/50" />
                <svg
                  className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">
                  {t("emailHash.sendPdfLabel")}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("emailHash.sendPdfNote")}
                </p>
              </div>
            </label>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isValidEmail || isChecking}
              className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-muted disabled:cursor-not-allowed text-white font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("emailHash.verifying")}
                </>
              ) : (
                <>
                  {t("emailHash.continueButton")}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Footer Note */}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {t("emailHash.footerNote")}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
}
