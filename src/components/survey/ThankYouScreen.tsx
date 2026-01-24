"use client";

import { motion } from "framer-motion";
import { CheckCircle, Share2, BarChart3, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib";
import { AnimatedBackground } from "@/components/ui";

interface ThankYouScreenProps {
  onViewResults: () => void;
}

export function ThankYouScreen({ onViewResults }: ThankYouScreenProps) {
  const handleShare = async () => {
    const shareData = {
      title: "Sondage IA & Vie Spirituelle",
      text: "J'ai participe a cette etude sur l'IA dans les pratiques religieuses. Participez aussi !",
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
      alert("Lien copie dans le presse-papier !");
    }
  };

  return (
    <AnimatedBackground variant="default" showGrid showOrbs>
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
              Merci pour votre participation
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Votre contribution est precieuse pour faire avancer la recherche sur
            les transformations numeriques de la vie spirituelle.
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
              <span className="text-sm">Rejoignez notre communaute de participants</span>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              1,543+
            </div>
            <p className="text-sm text-muted-foreground">
              personnes ont contribue a cette etude
            </p>
          </div>
        </motion.div>

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
            <span className="relative z-10">Voir les resultats</span>
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
            <span>Partager</span>
          </button>
        </motion.div>

        {/* Bonus badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-refined text-xs text-muted-foreground"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Votre profil personnalise est disponible</span>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-xs text-muted-foreground/50 text-center max-w-md"
        >
          Les resultats presentes sont des tendances anonymisees et agregees.
          Aucune donnee individuelle n&apos;est accessible.
        </motion.p>
      </div>
    </AnimatedBackground>
  );
}
