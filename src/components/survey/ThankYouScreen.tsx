"use client";

import { motion } from "framer-motion";
import { CheckCircle, Share2, BarChart3, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThankYouScreenProps {
  onViewResults: () => void;
}

export function ThankYouScreen({ onViewResults }: ThankYouScreenProps) {
  const handleShare = async () => {
    const shareData = {
      title: "Sondage IA & Vie Spirituelle",
      text: "J'ai participé à cette étude sur l'IA dans les pratiques religieuses. Participez aussi !",
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
      alert("Lien copié dans le presse-papier !");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 max-w-3xl mx-auto py-12">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl scale-150" />
        <div className="relative p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20">
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
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-emerald-200">
            Merci pour votre participation
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Votre contribution est précieuse pour faire avancer la recherche sur
          les transformations numériques de la vie spirituelle.
        </p>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full max-w-md mt-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-sm">Rejoignez notre communauté de participants</span>
        </div>
        <div className="text-4xl md:text-5xl font-bold text-white mb-2">
          1,543+
        </div>
        <p className="text-sm text-muted-foreground">
          personnes ont contribue a cette etude
        </p>
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
            "flex-1 group relative px-6 py-4 bg-white text-slate-900 rounded-xl font-semibold",
            "hover:bg-blue-50 hover:scale-[1.02] transition-all duration-300",
            "shadow-lg shadow-white/10",
            "flex items-center justify-center gap-3"
          )}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Voir les resultats</span>
        </button>

        <button
          onClick={handleShare}
          className={cn(
            "flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold",
            "hover:bg-white/10 hover:scale-[1.02] transition-all duration-300",
            "flex items-center justify-center gap-3 text-white"
          )}
        >
          <Share2 className="w-5 h-5" />
          <span>Partager</span>
        </button>
      </motion.div>

      {/* Footer Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-xs text-muted-foreground/50 text-center max-w-md"
      >
        Les resultats presentes sont des tendances anonymisees et agregees.
        Aucune donnee individuelle n&apos;est accessible.
      </motion.p>
    </div>
  );
}
