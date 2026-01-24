"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Share2, BarChart3, Heart, Sparkles, Copy, Database } from "lucide-react";
import { cn, useLanguage } from "@/lib";
import { AnimatedBackground, LanguageSwitcher } from "@/components/ui";
import { QRCodeShare } from "@/components/sharing";
import Link from "next/link";

interface ThankYouScreenProps {
  onViewResults: () => void;
  anonymousId?: string;
}

export function ThankYouScreen({ onViewResults, anonymousId }: ThankYouScreenProps) {
  const { t, language } = useLanguage();
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch real participant count
  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch("/api/results/aggregated");
        if (response.ok) {
          const data = await response.json();
          setParticipantCount(data.participantCount);
        }
      } catch {
        // Fall back to placeholder
      }
    }
    fetchCount();
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: "Sondage IA & Vie Spirituelle",
      text: t("thanks.shareText"),
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert(t("thanks.linkCopied"));
    }
  };

  const handleCopyId = async () => {
    if (anonymousId) {
      await navigator.clipboard.writeText(anonymousId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatedBackground variant="default" showGrid showOrbs>
      <LanguageSwitcher />
      <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 max-w-3xl mx-auto py-12">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl scale-150 animate-pulse" />
          <div className="relative p-6 glass-card-refined rounded-full">
            <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-emerald-400" />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient-animated">
              {t("thanks.title")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("thanks.description")}
          </p>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-md mt-10 glass-card-refined rounded-2xl p-6 text-center relative overflow-hidden group"
        >
          {/* Hover glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm">{t("thanks.community")}</span>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              {participantCount !== null ? participantCount.toLocaleString() : "1,500+"}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("thanks.contributed")}
            </p>
          </div>
        </motion.div>

        {/* Anonymous ID Card */}
        {anonymousId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-md mt-4 glass-card-refined rounded-xl p-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">
                    {language === "fr" ? "Votre identifiant anonyme" : "Your anonymous ID"}
                  </p>
                  <p className="text-sm font-mono text-white truncate max-w-[200px] sm:max-w-xs">
                    {anonymousId}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyId}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Copy className={cn("w-4 h-4", copied ? "text-emerald-400" : "text-white/60")} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-3">
              {language === "fr"
                ? "Conservez cet identifiant pour accéder à vos données ou les supprimer."
                : "Keep this ID to access or delete your data."}
            </p>
            <Link
              href="/mes-donnees"
              className="inline-block mt-2 text-xs text-blue-400 hover:underline"
            >
              {language === "fr" ? "Gérer mes données →" : "Manage my data →"}
            </Link>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-md"
        >
          <button
            onClick={onViewResults}
            className={cn(
              "flex-1 group relative px-6 py-4 bg-white text-slate-900 rounded-2xl font-semibold",
              "hover:scale-[1.02] transition-all duration-300",
              "shadow-lg shadow-white/10",
              "flex items-center justify-center gap-3",
              "btn-glow overflow-hidden"
            )}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="relative z-10">{t("thanks.viewResults")}</span>
            <span className="absolute inset-0 animate-shimmer" />
          </button>

          <button
            onClick={handleShare}
            className={cn(
              "flex-1 px-6 py-4 glass-card-refined rounded-2xl font-semibold",
              "hover:scale-[1.02] transition-all duration-300",
              "flex items-center justify-center gap-3 text-white"
            )}
          >
            <Share2 className="w-5 h-5" />
            <span>{t("thanks.share")}</span>
          </button>
        </motion.div>

        {/* QR Code Share */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-md mt-6"
        >
          <QRCodeShare language={language} className="w-full" />
        </motion.div>

        {/* Bonus badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-refined text-xs text-muted-foreground"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t("thanks.profileAvailable")}</span>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-xs text-muted-foreground/50 text-center max-w-md"
        >
          {t("thanks.resultsNote")}
        </motion.p>
      </div>
    </AnimatedBackground>
  );
}
