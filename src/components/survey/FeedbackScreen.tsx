"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Users, Brain, Shield } from "lucide-react";
import { cn } from "@/lib";
import type { Answers } from "@/data";
import {
  calculateCRS5Score,
  getReligiosityLevel,
  RELIGIOSITY_LABELS,
  calculateAIAdoptionScore,
  getAIAdoptionLevel,
  AI_ADOPTION_LABELS,
  calculateGeneralAIScore,
  calculateSpiritualResistanceIndex,
  getResistanceLevel,
  RESISTANCE_LABELS,
  getSpiritualAIProfile,
  PROFILE_DATA,
  getPercentileComparison,
  generateInsights,
} from "@/lib/scoring";

interface FeedbackScreenProps {
  answers: Answers;
  onContinue: () => void;
}

export function FeedbackScreen({ answers, onContinue }: FeedbackScreenProps) {
  // Calculate all scores
  const crsScore = calculateCRS5Score(answers);
  const religiosityLevel = getReligiosityLevel(crsScore);
  const aiScore = calculateAIAdoptionScore(answers);
  const aiLevel = getAIAdoptionLevel(aiScore);
  const generalAIScore = calculateGeneralAIScore(answers);
  const resistanceIndex = calculateSpiritualResistanceIndex(answers);
  const resistanceLevel = getResistanceLevel(resistanceIndex);
  const profile = getSpiritualAIProfile(answers);
  const profileData = PROFILE_DATA[profile];
  const religiosityPercentile = getPercentileComparison(crsScore, 'religiosity');
  const aiPercentile = getPercentileComparison(aiScore, 'ai_adoption');
  const insights = generateInsights(answers);

  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] px-4 max-w-4xl mx-auto py-12 space-y-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Votre profil personnalisé</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-purple-200">
            Découvrez vos résultats
          </span>
        </h1>
      </motion.header>

      {/* Main Profile Card */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden"
        aria-labelledby="profile-heading"
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
          aria-hidden="true"
        />

        <div className="relative z-10 text-center space-y-4">
          <div className="text-6xl mb-4">{profileData.emoji}</div>
          <h2
            id="profile-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            {profileData.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {profileData.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-left">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
                Votre force
              </div>
              <p className="text-sm text-white">{profileData.strength}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">
                Votre défi
              </div>
              <p className="text-sm text-white">{profileData.challenge}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Scores Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* CRS-5 Score */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Brain className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Religiosité (CRS-5)</h3>
              <p className="text-xs text-muted-foreground">Échelle de Huber</p>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-white">
                {crsScore.toFixed(1)}
                <span className="text-lg text-muted-foreground">/5</span>
              </div>
              <div className="text-sm text-blue-400">
                {RELIGIOSITY_LABELS[religiosityLevel]}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Users className="w-3 h-3" />
                <span>vs autres</span>
              </div>
              <div className="text-lg font-semibold text-white">
                Top {100 - religiosityPercentile}%
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(crsScore / 5) * 100}%` }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
            />
          </div>
        </div>

        {/* AI Adoption Score */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Adoption IA</h3>
              <p className="text-xs text-muted-foreground">Niveau d&apos;usage</p>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-white">
                {aiScore.toFixed(1)}
                <span className="text-lg text-muted-foreground">/5</span>
              </div>
              <div className="text-sm text-emerald-400">
                {AI_ADOPTION_LABELS[aiLevel]}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Users className="w-3 h-3" />
                <span>vs autres</span>
              </div>
              <div className="text-lg font-semibold text-white">
                Top {100 - aiPercentile}%
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(aiScore / 5) * 100}%` }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            />
          </div>
        </div>

        {/* Spiritual Resistance Index - Full width */}
        <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Résistance Spirituelle</h3>
              <p className="text-xs text-muted-foreground">Usage général vs spirituel</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-2">
                <div>
                  <span className="text-xs text-muted-foreground">IA Général</span>
                  <div className="text-xl font-bold text-white">{generalAIScore.toFixed(1)}/5</div>
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div>
                  <span className="text-xs text-muted-foreground">IA Spirituel</span>
                  <div className="text-xl font-bold text-white">{(generalAIScore - resistanceIndex).toFixed(1)}/5</div>
                </div>
                <div className="text-2xl text-muted-foreground">=</div>
                <div>
                  <span className="text-xs text-muted-foreground">Écart</span>
                  <div className={cn(
                    "text-xl font-bold",
                    resistanceIndex > 0 ? "text-amber-400" : "text-emerald-400"
                  )}>
                    {resistanceIndex > 0 ? "+" : ""}{resistanceIndex.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className={cn(
                "text-sm",
                resistanceIndex > 1 ? "text-amber-400" : resistanceIndex > 0 ? "text-amber-300" : "text-emerald-400"
              )}>
                {RESISTANCE_LABELS[resistanceLevel]}
              </div>
            </div>

            <div className="text-sm text-muted-foreground max-w-xs">
              {resistanceIndex > 1 ? (
                "Vous utilisez l'IA régulièrement mais résistez à son usage spirituel. Cette distinction est significative."
              ) : resistanceIndex > 0 ? (
                "Légère différence entre vos usages généraux et spirituels de l'IA."
              ) : (
                "Votre usage de l'IA est cohérent entre domaines séculier et spirituel."
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Personalized Insights */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full max-w-2xl space-y-3"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Éclairages personnalisés
        </h3>

        <div className="space-y-3">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex gap-4"
            >
              <div className="text-2xl shrink-0">{insight.icon}</div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="pt-4"
      >
        <button
          onClick={onContinue}
          className={cn(
            "group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg",
            "hover:bg-purple-50 hover:scale-105 active:scale-[0.98] transition-all duration-300",
            "shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)]",
            "flex items-center gap-3 mx-auto",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          )}
        >
          <span>Voir les résultats globaux</span>
          <ArrowRight
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
          />
        </button>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-xs text-muted-foreground/50 text-center max-w-md"
      >
        Ce profil est généré à partir de vos réponses à des fins illustratives.
        Il ne constitue pas une évaluation psychologique ou spirituelle.
      </motion.p>
    </div>
  );
}
