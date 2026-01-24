"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Users, Brain, Shield, Target, AlertTriangle, Lightbulb, ChevronRight } from "lucide-react";
import { cn, useLanguage } from "@/lib";
import { AnimatedBackground, LanguageSwitcher } from "@/components/ui";
import { PDFDownloadButton } from "@/components/sharing";
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
  getPercentileComparison,
  // New advanced profiling
  calculateProfileSpectrum,
  PROFILE_DEFINITIONS,
  SUB_PROFILE_DEFINITIONS,
  DIMENSION_LABELS,
  DIMENSION_COLORS,
  type ProfileSpectrum,
} from "@/lib/scoring";

interface FeedbackScreenProps {
  answers: Answers;
  onContinue: () => void;
  anonymousId?: string;
}

export function FeedbackScreen({ answers, onContinue, anonymousId }: FeedbackScreenProps) {
  const { t, language } = useLanguage();

  // Calculate all scores using the new advanced profiling system
  const spectrum: ProfileSpectrum = calculateProfileSpectrum(answers);

  // Legacy scores for backward compatibility
  const crsScore = calculateCRS5Score(answers);
  const religiosityLevel = getReligiosityLevel(crsScore);
  const aiScore = calculateAIAdoptionScore(answers);
  const aiLevel = getAIAdoptionLevel(aiScore);
  const generalAIScore = calculateGeneralAIScore(answers);
  const resistanceIndex = calculateSpiritualResistanceIndex(answers);
  const resistanceLevel = getResistanceLevel(resistanceIndex);
  const religiosityPercentile = getPercentileComparison(crsScore, 'religiosity');
  const aiPercentile = getPercentileComparison(aiScore, 'ai_adoption');

  // New advanced profile data
  const primaryMatch = spectrum.primary;
  const profileDef = PROFILE_DEFINITIONS[primaryMatch.profile];
  const subProfileMatch = spectrum.subProfile;
  const subProfileDef = subProfileMatch ? SUB_PROFILE_DEFINITIONS[subProfileMatch.subProfile as keyof typeof SUB_PROFILE_DEFINITIONS] : null;
  const insights = spectrum.insights;
  const tensions = spectrum.tensions;
  const growthAreas = spectrum.growthAreas;

  // Get resistance description based on level and language
  const getResistanceDescription = () => {
    if (resistanceIndex > 1) {
      return t("feedback.resistanceHigh");
    } else if (resistanceIndex > 0) {
      return t("feedback.resistanceMedium");
    }
    return t("feedback.resistanceLow");
  };

  return (
    <AnimatedBackground variant="default" showGrid showOrbs>
      <LanguageSwitcher />
      <div className="flex flex-col items-center justify-start min-h-[100dvh] px-4 max-w-4xl mx-auto py-12 space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-refined text-purple-300 text-xs font-medium uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("feedback.badge")}</span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient-animated">
              {t("feedback.title")}
            </span>
          </h1>
        </motion.header>

        {/* Main Profile Card */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="group w-full max-w-2xl glass-card-refined rounded-2xl p-6 md:p-8 relative overflow-hidden"
          aria-labelledby="profile-heading"
        >
          {/* Hover glow */}
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity duration-500 opacity-50 group-hover:opacity-100"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-30 group-hover:opacity-70"
            aria-hidden="true"
          />

          <div className="relative z-10 text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              {profileDef.emoji}
            </motion.div>
            <h2
              id="profile-heading"
              className="text-2xl md:text-3xl font-bold text-gradient-animated"
            >
              {profileDef.title}
            </h2>

            {/* Profile Match Confidence */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Correspondance:</span>
              <span className="text-purple-400 font-semibold">{primaryMatch.matchScore}%</span>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              {profileDef.shortDescription}
            </p>

            {/* Sub-profile Badge */}
            {subProfileDef && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30"
              >
                <span className="text-lg">{subProfileDef.emoji}</span>
                <span className="text-sm font-medium text-purple-300">{subProfileDef.title}</span>
              </motion.div>
            )}

            {/* Sub-profile description */}
            {subProfileDef && (
              <p className="text-sm text-muted-foreground/80 italic max-w-md mx-auto">
                {subProfileDef.description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-left">
              <div className="glass-card-refined rounded-xl p-4 group/card hover:border-emerald-500/30 transition-colors">
                <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
                  {t("feedback.yourStrength")}
                </div>
                <p className="text-sm text-white">{profileDef.coreMotivation}</p>
              </div>
              <div className="glass-card-refined rounded-xl p-4 group/card hover:border-amber-500/30 transition-colors">
                <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">
                  {t("feedback.yourChallenge")}
                </div>
                <p className="text-sm text-white">{profileDef.primaryFear}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Profile Spectrum - Top 3 matches */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="w-full max-w-2xl glass-card-refined rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Spectre de votre profil
          </h3>
          <div className="space-y-3">
            {spectrum.allMatches.slice(0, 3).map((match, index) => {
              const matchDef = PROFILE_DEFINITIONS[match.profile];
              return (
                <motion.div
                  key={match.profile}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-2xl">{matchDef.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        index === 0 ? "text-white" : "text-muted-foreground"
                      )}>
                        {matchDef.title}
                      </span>
                      <span className={cn(
                        "text-sm font-bold",
                        index === 0 ? "text-purple-400" : "text-muted-foreground"
                      )}>
                        {match.matchScore}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${match.matchScore}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                        className={cn(
                          "h-full rounded-full",
                          index === 0
                            ? "bg-gradient-to-r from-purple-500 to-purple-400"
                            : "bg-white/20"
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* 7 Dimensions Visualization */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="w-full max-w-2xl glass-card-refined rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Vos 7 dimensions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(spectrum.dimensions).map(([key, dimension], index) => {
              const dimLabel = DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS];
              const color = DIMENSION_COLORS[key as keyof typeof DIMENSION_COLORS];
              // Generate interpretation based on value
              const interpretation = dimension.value >= 4
                ? dimLabel.highDescription
                : dimension.value <= 2
                ? dimLabel.lowDescription
                : dimLabel.description;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="glass-card-refined rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{dimLabel.label}</span>
                    <span className="text-sm font-bold text-white">
                      {dimension.value.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dimension.value / 5) * 100}%` }}
                      transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {interpretation}
                  </p>
                </motion.div>
              );
            })}
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="group glass-card-refined rounded-xl p-5 hover:border-blue-500/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{t("feedback.religiosity")}</h3>
                <p className="text-xs text-muted-foreground">{t("feedback.huberScale")}</p>
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
                  <span>{t("feedback.vsOthers")}</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {t("feedback.top", { percent: 100 - religiosityPercentile })}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(crsScore / 5) * 100}%` }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            </div>
          </motion.div>

          {/* AI Adoption Score */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="group glass-card-refined rounded-xl p-5 hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{t("feedback.aiAdoption")}</h3>
                <p className="text-xs text-muted-foreground">{t("feedback.usageLevel")}</p>
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
                  <span>{t("feedback.vsOthers")}</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {t("feedback.top", { percent: 100 - aiPercentile })}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(aiScore / 5) * 100}%` }}
                transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
          </motion.div>

          {/* Spiritual Resistance Index - Full width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="md:col-span-2 group glass-card-refined rounded-xl p-5 hover:border-amber-500/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{t("feedback.spiritualResistance")}</h3>
                <p className="text-xs text-muted-foreground">{t("feedback.generalVsSpiritual")}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-2">
                  <div>
                    <span className="text-xs text-muted-foreground">{t("feedback.generalAI")}</span>
                    <div className="text-xl font-bold text-white">{generalAIScore.toFixed(1)}/5</div>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div>
                    <span className="text-xs text-muted-foreground">{t("feedback.spiritualAI")}</span>
                    <div className="text-xl font-bold text-white">{(generalAIScore - resistanceIndex).toFixed(1)}/5</div>
                  </div>
                  <div className="text-2xl text-muted-foreground">=</div>
                  <div>
                    <span className="text-xs text-muted-foreground">{t("feedback.gap")}</span>
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
                {getResistanceDescription()}
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Tensions - Points of internal conflict */}
        {tensions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="w-full max-w-2xl glass-card-refined rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Points de tension
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Ces tensions internes peuvent enrichir votre réflexion et votre discernement.
            </p>
            <div className="space-y-3">
              {tensions.map((tension, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-amber-400 text-xs font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">
                      <span className="text-amber-400">{DIMENSION_LABELS[tension.dimension1].label}</span>
                      <span className="text-muted-foreground"> vs </span>
                      <span className="text-amber-400">{DIMENSION_LABELS[tension.dimension2].label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{tension.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Growth Areas */}
        {growthAreas.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="w-full max-w-2xl glass-card-refined rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Pistes de croissance
            </h3>
            <div className="space-y-3">
              {growthAreas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20"
                >
                  <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">{area.area}</h4>
                    <p className="text-xs text-muted-foreground mb-1">{area.potentialGrowth}</p>
                    <p className="text-xs text-emerald-400/80">{area.actionableStep}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Personalized Insights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="w-full max-w-2xl space-y-3"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {t("feedback.insightsTitle")}
          </h3>

          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                className="group glass-card-refined rounded-xl p-4 flex gap-4 hover:border-white/20 transition-colors"
              >
                <div className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{insight.icon}</div>
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

        {/* PDF Download Button */}
        {anonymousId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="pt-4"
          >
            <PDFDownloadButton
              language={language}
              anonymousId={anonymousId}
              completedAt={new Date().toISOString()}
              answers={answers}
              profile={{
                religiosityScore: crsScore,
                iaComfortScore: aiScore,
                theologicalOrientation: profileDef.title,
              }}
            />
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="pt-4"
        >
          <button
            onClick={onContinue}
            className={cn(
              "group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg",
              "hover:scale-105 active:scale-[0.98] transition-all duration-300",
              "shadow-lg shadow-white/10",
              "flex items-center gap-3 mx-auto",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-background",
              "btn-glow overflow-hidden"
            )}
          >
            <span className="relative z-10">{t("feedback.viewGlobalResults")}</span>
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10"
              aria-hidden="true"
            />
            <span className="absolute inset-0 animate-shimmer" />
          </button>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-xs text-muted-foreground/50 text-center max-w-md"
        >
          {t("feedback.disclaimer")}
        </motion.p>
      </div>
    </AnimatedBackground>
  );
}
