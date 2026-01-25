"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Users, Brain, Shield, Target, AlertTriangle, Lightbulb, ChevronRight } from "lucide-react";
import { cn, useLanguage, useHasAnimated } from "@/lib";
import { AnimatedBackground, LanguageSwitcher } from "@/components/ui";
import { GlowingEffect } from "@/components/ui/glowing-effect";
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

// Reusable card wrapper with glowing effect
function GlowCard({
  children,
  className,
  area,
}: {
  children: React.ReactNode;
  className?: string;
  area?: string;
}) {
  return (
    <div className={cn("min-h-[10rem] list-none", area)}>
      <div className="relative h-full rounded-2xl border border-white/10 p-2">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-5 shadow-lg",
          className
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function FeedbackScreen({ answers, onContinue, anonymousId }: FeedbackScreenProps) {
  const { t, language } = useLanguage();
  const hasAnimated = useHasAnimated();

  // Calculate all scores
  const spectrum: ProfileSpectrum = calculateProfileSpectrum(answers);
  const crsScore = calculateCRS5Score(answers);
  const religiosityLevel = getReligiosityLevel(crsScore);
  const aiScore = calculateAIAdoptionScore(answers);
  const aiLevel = getAIAdoptionLevel(aiScore);
  const generalAIScore = calculateGeneralAIScore(answers);
  const resistanceIndex = calculateSpiritualResistanceIndex(answers);
  const resistanceLevel = getResistanceLevel(resistanceIndex);
  const religiosityPercentile = getPercentileComparison(crsScore, 'religiosity');
  const aiPercentile = getPercentileComparison(aiScore, 'ai_adoption');

  // Profile data
  const primaryMatch = spectrum.primary;
  const profileDef = PROFILE_DEFINITIONS[primaryMatch.profile];
  const subProfileMatch = spectrum.subProfile;
  const subProfileDef = subProfileMatch ? SUB_PROFILE_DEFINITIONS[subProfileMatch.subProfile as keyof typeof SUB_PROFILE_DEFINITIONS] : null;
  const insights = spectrum.insights;
  const tensions = spectrum.tensions;
  const growthAreas = spectrum.growthAreas;

  const getResistanceDescription = () => {
    if (resistanceIndex > 1) return t("feedback.resistanceHigh");
    if (resistanceIndex > 0) return t("feedback.resistanceMedium");
    return t("feedback.resistanceLow");
  };

  return (
    <AnimatedBackground variant="default" showGrid showOrbs>
      <LanguageSwitcher />
      <div className="min-h-[100dvh] px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {/* Header */}
        <motion.header
          initial={hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            initial={hasAnimated ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-refined text-purple-300 text-xs font-medium uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("feedback.badge")}</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient-animated">
            {t("feedback.title")}
          </h1>
        </motion.header>

        {/* Dashboard Grid */}
        <motion.div
          initial={hasAnimated ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <ul className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
            {/* Main Profile Card - Large */}
            <GlowCard area="md:col-span-8 lg:col-span-5" className="justify-between">
              <div className="flex items-start justify-between">
                <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-4xl">{profileDef.emoji}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Match</span>
                  <p className="text-2xl font-bold text-purple-400">{primaryMatch.matchScore}%</p>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white">{profileDef.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{profileDef.shortDescription}</p>
                {subProfileDef && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <span>{subProfileDef.emoji}</span>
                    <span className="text-xs font-medium text-purple-300">{subProfileDef.title}</span>
                  </div>
                )}
              </div>
            </GlowCard>

            {/* CRS-5 Score */}
            <GlowCard area="md:col-span-4 lg:col-span-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{t("feedback.religiosity")}</h3>
                  <p className="text-xs text-muted-foreground">CRS-5</p>
                </div>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-3xl font-bold text-white">{crsScore.toFixed(1)}<span className="text-lg text-muted-foreground">/5</span></p>
                  <p className="text-sm text-blue-400">{RELIGIOSITY_LABELS[religiosityLevel]}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> vs others</p>
                  <p className="text-lg font-semibold text-white">Top {100 - religiosityPercentile}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={hasAnimated ? false : { width: 0 }}
                  animate={{ width: `${(crsScore / 5) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                />
              </div>
            </GlowCard>

            {/* AI Adoption Score */}
            <GlowCard area="md:col-span-6 lg:col-span-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{t("feedback.aiAdoption")}</h3>
                  <p className="text-xs text-muted-foreground">{t("feedback.usageLevel")}</p>
                </div>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-3xl font-bold text-white">{aiScore.toFixed(1)}<span className="text-lg text-muted-foreground">/5</span></p>
                  <p className="text-sm text-emerald-400">{AI_ADOPTION_LABELS[aiLevel]}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> vs others</p>
                  <p className="text-lg font-semibold text-white">Top {100 - aiPercentile}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={hasAnimated ? false : { width: 0 }}
                  animate={{ width: `${(aiScore / 5) * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                />
              </div>
            </GlowCard>

            {/* Spiritual Resistance */}
            <GlowCard area="md:col-span-6 lg:col-span-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">{t("feedback.spiritualResistance")}</h3>
              </div>
              <div className="flex items-center gap-4 mt-auto">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">{t("feedback.generalAI")}</span>
                  <span className="text-lg font-bold text-white">{generalAIScore.toFixed(1)}</span>
                </div>
                <span className="text-xl text-muted-foreground">→</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">{t("feedback.spiritualAI")}</span>
                  <span className="text-lg font-bold text-white">{(generalAIScore - resistanceIndex).toFixed(1)}</span>
                </div>
                <span className="text-xl text-muted-foreground">=</span>
                <div className={cn("text-xl font-bold", resistanceIndex > 0 ? "text-amber-400" : "text-emerald-400")}>
                  {resistanceIndex > 0 ? "+" : ""}{resistanceIndex.toFixed(1)}
                </div>
              </div>
              <p className={cn("text-sm mt-2", resistanceIndex > 1 ? "text-amber-400" : resistanceIndex > 0 ? "text-amber-300" : "text-emerald-400")}>
                {RESISTANCE_LABELS[resistanceLevel]}
              </p>
            </GlowCard>

            {/* Profile Spectrum */}
            <GlowCard area="md:col-span-12 lg:col-span-7">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {language === "fr" ? "Spectre de votre profil" : "Your Profile Spectrum"}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {spectrum.allMatches.slice(0, 3).map((match, index) => {
                  const matchDef = PROFILE_DEFINITIONS[match.profile];
                  return (
                    <motion.div
                      key={match.profile}
                      initial={hasAnimated ? false : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-2xl">{matchDef.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", index === 0 ? "text-white" : "text-muted-foreground")}>
                          {matchDef.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={hasAnimated ? false : { width: 0 }}
                              animate={{ width: `${match.matchScore}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                              className={cn("h-full rounded-full", index === 0 ? "bg-purple-500" : "bg-white/20")}
                            />
                          </div>
                          <span className={cn("text-xs font-bold", index === 0 ? "text-purple-400" : "text-muted-foreground")}>
                            {match.matchScore}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlowCard>

            {/* 7 Dimensions */}
            <GlowCard area="md:col-span-12 lg:col-span-12">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {language === "fr" ? "Vos 7 dimensions" : "Your 7 Dimensions"}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {Object.entries(spectrum.dimensions).map(([key, dimension], index) => {
                  const dimLabel = DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS];
                  const color = DIMENSION_COLORS[key as keyof typeof DIMENSION_COLORS];
                  return (
                    <motion.div
                      key={key}
                      initial={hasAnimated ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div className="relative w-12 h-12 mx-auto mb-2">
                        <svg className="w-12 h-12 -rotate-90">
                          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                          <motion.circle
                            cx="24" cy="24" r="20"
                            fill="none"
                            stroke={color}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${(dimension.value / 5) * 125.6} 125.6`}
                            initial={hasAnimated ? false : { strokeDasharray: "0 125.6" }}
                            animate={{ strokeDasharray: `${(dimension.value / 5) * 125.6} 125.6` }}
                            transition={{ delay: 0.6 + index * 0.05, duration: 0.8 }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                          {dimension.value.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">{dimLabel.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            </GlowCard>

            {/* Insights */}
            {insights.slice(0, 2).map((insight, index) => (
              <GlowCard key={insight.title} area="md:col-span-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{insight.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </GlowCard>
            ))}

            {/* Growth Areas */}
            {growthAreas.length > 0 && (
              <GlowCard area="md:col-span-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                    {language === "fr" ? "Piste de croissance" : "Growth Area"}
                  </h3>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">{growthAreas[0].area}</h4>
                    <p className="text-xs text-emerald-400/80">{growthAreas[0].actionableStep}</p>
                  </div>
                </div>
              </GlowCard>
            )}

            {/* Tensions */}
            {tensions.length > 0 && (
              <GlowCard area="md:col-span-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                    {language === "fr" ? "Point de tension" : "Tension Point"}
                  </h3>
                </div>
                <div className="text-sm text-white mb-1">
                  <span className="text-amber-400">{DIMENSION_LABELS[tensions[0].dimension1].label}</span>
                  <span className="text-muted-foreground"> vs </span>
                  <span className="text-amber-400">{DIMENSION_LABELS[tensions[0].dimension2].label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{tensions[0].description}</p>
              </GlowCard>
            )}
          </ul>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={hasAnimated ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-10"
        >
          <button
            onClick={onContinue}
            className={cn(
              "group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg",
              "hover:scale-105 active:scale-[0.98] transition-all duration-300",
              "shadow-lg shadow-white/10 flex items-center gap-3 mx-auto",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "btn-glow overflow-hidden"
            )}
          >
            <span className="relative z-10">{t("feedback.viewGlobalResults")}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            <span className="absolute inset-0 animate-shimmer" />
          </button>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={hasAnimated ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-xs text-muted-foreground/50 text-center max-w-md mx-auto mt-8"
        >
          {t("feedback.disclaimer")}
        </motion.p>
      </div>
    </AnimatedBackground>
  );
}
