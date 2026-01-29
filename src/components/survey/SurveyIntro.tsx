"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Database, Clock, Lock, Sparkles, X } from "lucide-react";
import { cn, useLanguage, useHasAnimated } from "@/lib";
import { AnimatedBackground, Spotlight, LanguageSwitcher } from "@/components/ui";

interface SurveyIntroProps {
  onStart: () => void;
}

export function SurveyIntro({ onStart }: SurveyIntroProps) {
  const { t } = useLanguage();
  const hasAnimated = useHasAnimated();
  const [showVideo, setShowVideo] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Show video after component mounts (avoid SSR issues)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration pattern
    setMounted(true);
     
    setShowVideo(true);
  }, []);

  // Auto-hide video after 28 seconds
  useEffect(() => {
    if (showVideo && mounted) {
      const timer = setTimeout(() => setShowVideo(false), 28000);
      return () => clearTimeout(timer);
    }
  }, [showVideo, mounted]);

  return (
    <AnimatedBackground variant="default" showGrid showOrbs>
        <LanguageSwitcher />
      <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 max-w-4xl mx-auto space-y-10 md:space-y-12 py-12">
        {/* Spotlight effect */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#3b82f6"
        />

        {/* Header */}
        <motion.header
          initial={hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={hasAnimated ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-refined text-blue-300 text-xs font-medium uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("intro.badge")}</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="text-gradient-animated">
              {t("intro.title1")}
            </span>
            <br />
            <span className="text-blue-400">&</span>{" "}
            <span className="text-gradient-animated">
              {t("intro.title2")}
            </span>
          </h1>

          <motion.p
            initial={hasAnimated ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance"
          >
            {t("intro.description")}
          </motion.p>
        </motion.header>

        {/* Privacy Card */}
        <motion.section
          initial={hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="group w-full max-w-2xl glass-card-refined rounded-2xl p-6 md:p-8 relative overflow-hidden"
          aria-labelledby="privacy-heading"
        >
          {/* Hover glow */}
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity duration-500 opacity-50 group-hover:opacity-100"
            aria-hidden="true"
          />

          <div className="flex items-start gap-5 relative z-10">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-4">
              <h2
                id="privacy-heading"
                className="font-semibold text-white text-lg"
              >
                {t("intro.privacyTitle")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("intro.privacyDescription")}
              </p>
              <ul className="text-sm text-muted-foreground space-y-3">
                <li className="flex items-start gap-3">
                  <Lock
                    className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="text-white">{t("intro.anonymity")}</strong>{" "}
                    {t("intro.anonymityDesc")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Database
                    className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="text-white">{t("intro.academic")}</strong>{" "}
                    {t("intro.academicDesc")}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.div
          initial={hasAnimated ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-4"
        >
          <button
            onClick={onStart}
            className={cn(
              "group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg",
              "hover:scale-105 active:scale-[0.98] transition-all duration-300",
              "flex items-center gap-3 mx-auto",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-background",
              "btn-glow"
            )}
          >
            <span>{t("intro.cta")}</span>
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
            {/* Shimmer effect */}
            <span className="absolute inset-0 rounded-full animate-shimmer" />
          </button>

          <p className="text-xs text-muted-foreground/50 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("intro.time")}</span>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={hasAnimated ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground/30 max-w-md space-y-2"
        >
          <p>{t("intro.consent")}</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/faq"
              className="inline-block text-blue-400/60 hover:text-blue-400 transition-colors underline underline-offset-2"
            >
              {t("intro.faqLink")}
            </Link>
            <span className="text-muted-foreground/20">|</span>
            <Link
              href="/fr/methodology"
              className="inline-block text-blue-400/60 hover:text-blue-400 transition-colors underline underline-offset-2"
            >
              {t("methodology.learnMore")}
            </Link>
          </div>
        </motion.footer>
      </div>

      {/* Video Modal Overlay - only render after mount */}
      {mounted && showVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95">
          {/* Skip Button */}
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10000] flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all border border-white/20"
          >
            <span>{t("intro.skipVideo")}</span>
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
              {t("intro.videoNotSupported")}
            </video>
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10 cursor-pointer"
            onClick={() => setShowVideo(false)}
          />
        </div>
      )}
    </AnimatedBackground>
  );
}
