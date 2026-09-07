"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { SURVEY_QUESTIONS } from "@/data";
import { useLanguage, cn } from "@/lib";
import { motion, useInView, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  RefreshCw,
  Users,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  Award,
  ArrowRight,
  Brain,
  Heart,
  Church,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { DonutChart } from "./charts";
import { ModernChartCard, K_ANONYMITY_BUCKET, type DashboardResult } from "./ModernChartCard";

// Below this the API answers `mode: "insufficient"` and publishes no figure.
const MIN_PARTICIPANTS_FOR_PUBLICATION = 30;

const RELIGIOSITY_QUESTION_IDS = [
  "crs_intellect",
  "crs_ideology",
  "crs_public_practice",
  "crs_private_practice",
  "crs_experience",
];

const SPIRITUAL_CONTEXT_OPTION = "spirituel";

type SummaryStats = {
  catholicShare: number | null;
  aiRegularShare: number | null;
  aiAnyUseShare: number | null;
  crsAverage: number | null;
  spiritualUsageShare: number | null;
};

const INITIAL_SUMMARY_STATS: SummaryStats = {
  catholicShare: null,
  aiRegularShare: null,
  aiAnyUseShare: null,
  crsAverage: null,
  spiritualUsageShare: null,
};

function findAggregatedResult(results: DashboardResult[], questionId: string) {
  return results.find((result) => result.questionId === questionId);
}

/** Total of a distribution, k-anonymity bucket included: it holds real answers. */
function totalOf(distribution: Record<string, number>): number {
  return Object.values(distribution).reduce((sum, count) => sum + count, 0);
}

function calculatePercentage(
  result: DashboardResult | undefined,
  predicate: (value: string) => boolean
): number | null {
  if (!result) return null;
  const total = totalOf(result.distribution);
  if (!total) return null;
  const matched = Object.entries(result.distribution).reduce((sum, [key, count]) => {
    // The merged bucket has no identifiable modality: it can never match.
    if (key === K_ANONYMITY_BUCKET) return sum;
    return predicate(key) ? sum + count : sum;
  }, 0);
  return (matched / total) * 100;
}

function computeAverageScore(questionId: string, results: DashboardResult[]): number | null {
  const aggregated = findAggregatedResult(results, questionId);
  if (!aggregated) return null;
  const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return null;

  let totalResponses = 0;
  let weightedSum = 0;

  if (question.options && question.options.length > 0) {
    question.options.forEach((option, idx) => {
      const count = aggregated.distribution[option.value] ?? 0;
      totalResponses += count;
      weightedSum += count * (idx + 1);
    });
  } else {
    Object.entries(aggregated.distribution).forEach(([key, count]) => {
      const numericKey = Number(key);
      if (!Number.isNaN(numericKey)) {
        totalResponses += count;
        weightedSum += count * numericKey;
      }
    });
  }

  if (!totalResponses) return null;
  return weightedSum / totalResponses;
}

/**
 * Share of participants who selected one option of a multi-select question.
 * Since migration 011 the SQL aggregate expands arrays, so the distribution
 * holds one cell per option and the count is directly readable. An option
 * merged into the k-anonymity bucket is reported as unknown, not as zero.
 */
function calculateOptionShare(
  result: DashboardResult | undefined,
  optionValue: string,
  participantCount: number | null
): number | null {
  if (!result) return null;
  const optionCount = result.distribution[optionValue];
  if (optionCount === undefined) {
    return K_ANONYMITY_BUCKET in result.distribution ? null : 0;
  }
  if (participantCount && participantCount > 0) {
    return (optionCount / participantCount) * 100;
  }
  const totalSelections = totalOf(result.distribution);
  if (!totalSelections) return null;
  return (optionCount / totalSelections) * 100;
}

function calculateSummary(results: DashboardResult[], participantCount: number | null): SummaryStats {
  const confessionResult = findAggregatedResult(results, "profil_confession");
  const catholicShare = calculatePercentage(confessionResult, (value) => value === "catholique");

  const aiFrequencyResult = findAggregatedResult(results, "ctrl_ia_frequence");
  const aiRegularShare = calculatePercentage(
    aiFrequencyResult,
    (value) => value === "regulier" || value === "quotidien"
  );
  const aiAnyUseShare = calculatePercentage(aiFrequencyResult, (value) => value !== "jamais");

  const aiContextResult = findAggregatedResult(results, "ctrl_ia_contextes");
  const spiritualUsageShare = calculateOptionShare(
    aiContextResult,
    SPIRITUAL_CONTEXT_OPTION,
    participantCount
  );

  const religiosityScores = RELIGIOSITY_QUESTION_IDS.map((id) =>
    computeAverageScore(id, results)
  ).filter((value): value is number => typeof value === "number");

  const crsAverage =
    religiosityScores.length > 0
      ? religiosityScores.reduce((sum, value) => sum + value, 0) / religiosityScores.length
      : null;

  return {
    catholicShare,
    aiRegularShare,
    aiAnyUseShare,
    crsAverage,
    spiritualUsageShare,
  };
}

/**
 * Usage split for the highlight donut, built only from measured shares.
 * Returns null as soon as one of them is missing: no placeholder slice.
 */
function buildUsageSplit(summary: SummaryStats) {
  const { aiAnyUseShare, spiritualUsageShare } = summary;
  if (aiAnyUseShare === null || spiritualUsageShare === null) return null;
  const spiritual = Math.min(spiritualUsageShare, aiAnyUseShare);
  return {
    spiritual,
    otherUse: Math.max(0, aiAnyUseShare - spiritual),
    noUse: Math.max(0, 100 - aiAnyUseShare),
  };
}

// Animated counter with spring physics
function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: [0.32, 0.72, 0, 1],
      });
      return controls.stop;
    }
  }, [isInView, motionValue, value, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", setDisplayValue);
    return unsubscribe;
  }, [rounded]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
}

// Pre-computed random values for particles to avoid calling Math.random during render
const PARTICLE_CONFIGS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  initialX: (i * 5 + 7) % 100,
  initialY: (i * 7 + 13) % 100,
  duration: 10 + (i % 10),
  delay: (i * 0.25) % 5,
}));

// Floating particles background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLE_CONFIGS.map((config) => (
        <motion.div
          key={config.id}
          className="absolute w-1 h-1 bg-foreground/10 rounded-full"
          initial={{
            x: config.initialX + "%",
            y: config.initialY + "%",
          }}
          animate={{
            y: [null, "-20%", "120%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            delay: config.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Key insight card with animation
function InsightCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  value: string | number | React.ReactNode;
  subtitle: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-foreground/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-6 rounded-3xl glass-card-refined overflow-hidden">
        {/* Decorative gradient */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"
          style={{ backgroundColor: color }}
        />

        <div className="relative z-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: color }} />
          </div>

          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Category filter pills - use translation keys
const CATEGORY_KEYS = [
  { id: "all", translationKey: "dashboard.all", icon: Sparkles },
  { id: "profile", translationKey: "dashboard.profile", icon: Users },
  { id: "religiosity", translationKey: "dashboard.religiosity", icon: Church },
  { id: "usage", translationKey: "dashboard.usage", icon: Brain },
  { id: "theology", translationKey: "dashboard.theology", icon: Heart },
  { id: "psychology", translationKey: "dashboard.psychology", icon: Target },
];

export function ResultsDashboard() {
  const { t, language } = useLanguage();
  const [results, setResults] = useState<DashboardResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>(INITIAL_SUMMARY_STATS);
  // The API withholds every figure below the publication floor.
  const [isBelowPublicationFloor, setIsBelowPublicationFloor] = useState(false);
  // Only set when the fetch itself fails (network/HTTP error).
  const [hasLoadError, setHasLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      setIsLoading(true);
      setHasLoadError(false);
      try {
        const response = await fetch("/api/results/aggregated", {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch results: ${response.status}`);
        }

        const data: {
          mode?: "ok" | "insufficient";
          participantCount?: number;
          results?: DashboardResult[];
          lastUpdated?: string;
        } = await response.json();

        if (!isMounted) {
          return;
        }

        const count = typeof data.participantCount === "number" ? data.participantCount : 0;
        setParticipantCount(count);
        setLastUpdated(data.lastUpdated ?? null);

        if (data.mode !== "ok" || !Array.isArray(data.results)) {
          setIsBelowPublicationFloor(true);
          setResults([]);
          setSummaryStats(INITIAL_SUMMARY_STATS);
          setExpandedCards(new Set());
          return;
        }

        setIsBelowPublicationFloor(false);
        setResults(data.results);
        setSummaryStats(calculateSummary(data.results, count));
        // Expand all cards by default so charts are visible
        setExpandedCards(new Set(data.results.map((r) => r.questionId)));
      } catch (error) {
        console.error("Unable to load aggregated results:", error);
        if (isMounted) {
          setHasLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadResults();
    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const handleRetryLoad = () => {
    setRetryCount((prev) => prev + 1);
  };

  const filteredQuestions = useMemo(() => {
    return SURVEY_QUESTIONS.filter((q) => {
      if (selectedCategory === "all") return true;
      return q.category === selectedCategory || q.category.startsWith(selectedCategory);
    });
  }, [selectedCategory]);

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
        <motion.div
          className="relative w-24 h-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Middle ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-purple-500/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Center dot */}
          <motion.div
            className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <p className="text-foreground/80 font-medium">
            {t("dashboard.analyzingData")}
          </p>
          <p className="text-muted-foreground text-sm">
            {t("dashboard.preparingViz")}
          </p>
        </motion.div>
      </div>
    );
  }

  if (hasLoadError) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card-refined rounded-3xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("dashboard.loadErrorTitle")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("dashboard.loadErrorDesc")}
          </p>
          <button
            onClick={handleRetryLoad}
            className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t("errors.retry")}
          </button>
        </motion.div>
      </div>
    );
  }

  if (isBelowPublicationFloor) {
    const collected = participantCount ?? 0;
    const progress = Math.min(100, (collected / MIN_PARTICIPANTS_FOR_PUBLICATION) * 100);

    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="max-w-lg w-full glass-card-refined rounded-3xl p-8 text-center space-y-6"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-blue-400" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-light text-foreground">
              {language === "fr"
                ? "Collecte en cours, résultats publiés à partir de 30 participants"
                : "Collection in progress, results are published from 30 participants"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === "fr"
                ? "Aucun chiffre n’est affiché avant ce seuil : un échantillon plus petit n’aurait pas la stabilité qu’un pourcentage laisse croire."
                : "No figure is shown below that threshold: a smaller sample would not have the stability a percentage suggests."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
              />
            </div>
            <p className="text-xs text-muted-foreground/70">
              {language === "fr"
                ? `${collected} sur ${MIN_PARTICIPANTS_FOR_PUBLICATION} participants`
                : `${collected} of ${MIN_PARTICIPANTS_FOR_PUBLICATION} participants`}
            </p>
          </div>

          <button
            onClick={handleRetryLoad}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-muted hover:bg-accent text-foreground text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t("errors.retry")}
          </button>
        </motion.div>
      </div>
    );
  }

  // French sets a narrow no-break space before "%"; English does not.
  const formatPercent = (value: number) =>
    language === "fr" ? `${value.toFixed(0)}\u202f%` : `${value.toFixed(0)}%`;

  const participantValue =
    participantCount !== null ? <AnimatedNumber value={participantCount} /> : "—";
  const catholicValue =
    summaryStats.catholicShare !== null ? formatPercent(summaryStats.catholicShare) : "—";
  const aiValue =
    summaryStats.aiRegularShare !== null ? formatPercent(summaryStats.aiRegularShare) : "—";
  const crsValue =
    summaryStats.crsAverage !== null ? `${summaryStats.crsAverage.toFixed(1)}/5` : "—";
  const aiShareText = summaryStats.aiRegularShare !== null ? summaryStats.aiRegularShare.toFixed(0) : null;
  const spiritualShareText =
    summaryStats.spiritualUsageShare !== null ? summaryStats.spiritualUsageShare.toFixed(0) : null;

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString(language === "fr" ? "fr-FR" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  // Only the measured phrasing survives: with no figure there is no insight.
  const insightTitleText =
    aiShareText !== null ? t("dashboard.insightTitleDynamic", { percent: aiShareText }) : null;
  const insightDescriptionText =
    spiritualShareText !== null
      ? t("dashboard.insightDescriptionDynamic", { percent: spiritualShareText })
      : null;
  const usageSplit = buildUsageSplit(summaryStats);
  const showHighlight = insightTitleText !== null || usageSplit !== null;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 pb-20">
      <FloatingParticles />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative pt-8 pb-12 space-y-8"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-border backdrop-blur-sm">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-sm text-muted-foreground">
              {t("dashboard.realTimeResults")}
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-tight">
            <span className="text-foreground">
              {t("dashboard.dashboardTitle")}
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
            {t("dashboard.exploreDescription")}
          </p>

          {formattedLastUpdated && (
            <p className="text-xs text-muted-foreground/70">
              {t("dashboard.lastUpdated", { date: formattedLastUpdated })}
            </p>
          )}
        </motion.div>

        {/* Key Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <InsightCard
            icon={Users}
            title={t("dashboard.participants")}
            value={participantValue}
            subtitle={t("dashboard.responsesCollected")}
            color="#3b82f6"
            delay={0.2}
          />
          <InsightCard
            icon={Church}
            title={t("dashboard.catholics")}
            value={catholicValue}
            subtitle={t("dashboard.majorityDenomination")}
            color="#8b5cf6"
            delay={0.3}
          />
          <InsightCard
            icon={Zap}
            title={t("dashboard.aiUsers")}
            value={aiValue}
            subtitle={t("dashboard.useAIRegularly")}
            color="#10b981"
            delay={0.4}
          />
          <InsightCard
            icon={Award}
            title={t("dashboard.averageScore")}
            value={crsValue}
            subtitle={t("dashboard.crs5Religiosity")}
            color="#f59e0b"
            delay={0.5}
          />
        </div>
      </motion.section>

      {/* Highlight Section - rendered only when measured on real answers */}
      {showHighlight && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative mb-12"
        >
          <div className="relative p-8 rounded-3xl glass-card-refined overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-emerald-500 font-medium">
                    {t("dashboard.keyInsight")}
                  </span>
                </div>
                {insightTitleText && (
                  <h2 className="text-2xl md:text-3xl font-light text-foreground">
                    {insightTitleText}
                  </h2>
                )}
                {insightDescriptionText && (
                  <p className="text-muted-foreground">{insightDescriptionText}</p>
                )}
                <motion.button
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <span>{t("dashboard.exploreData")}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              {usageSplit && (
                <div className="flex-shrink-0">
                  <DonutChart
                    data={[
                      {
                        name: language === "fr" ? "Usage spirituel" : "Spiritual use",
                        value: Math.round(usageSplit.spiritual),
                        color: "#8b5cf6",
                      },
                      {
                        name: language === "fr" ? "Autres usages" : "Other uses",
                        value: Math.round(usageSplit.otherUse),
                        color: "#3b82f6",
                      },
                      {
                        name: language === "fr" ? "Aucun usage" : "No use",
                        value: Math.round(usageSplit.noUse),
                        color: "#374151",
                      },
                    ]}
                    total={100}
                    size={180}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-center gap-2 flex-wrap mb-10"
      >
        {CATEGORY_KEYS.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              onClick={() => setSelectedCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border"
              )}
            >
              <Icon className="w-4 h-4" />
              {t(cat.translationKey)}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Charts Grid */}
      <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="sync">
          {filteredQuestions.map((question, index) => {
            const data = results.find((r) => r.questionId === question.id);
            if (!data || Object.keys(data.distribution).length === 0) return null;

            return (
              <ModernChartCard
                key={question.id}
                question={question}
                data={data}
                index={index}
                isExpanded={expandedCards.has(question.id)}
                onToggle={() => toggleCard(question.id)}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pt-16 space-y-6"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-foreground font-medium transition-all duration-300 border border-border hover:border-primary/30"
        >
          <RefreshCw className="w-5 h-5" />
          <span>{t("dashboard.restartSurvey")}</span>
        </motion.button>

        <p className="text-sm text-muted-foreground/60">
          {t("dashboard.thankYouFooter")}
        </p>

        {/* Scientific disclaimer */}
        <div className="max-w-2xl mx-auto pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-center gap-2 text-amber-500/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-medium">{t("scientificDisclaimer.exploratoryStudy")}</span>
          </div>
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
            <span className="font-medium text-muted-foreground/70">{t("methodology.title")}:</span>{" "}
            {t("methodology.description")}
          </p>
          <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
            {t("scientificDisclaimer.exploratoryNote")}
          </p>
          <p className="text-[9px] text-muted-foreground/30 italic">
            {t("scientificDisclaimer.footerNote")}
          </p>
        </div>

        <p className="text-xs text-muted-foreground/50">
          {t("dashboard.studyConductedBy")}
        </p>
      </motion.footer>
    </div>
  );
}

