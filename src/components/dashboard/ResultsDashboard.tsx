"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { SURVEY_QUESTIONS, type Question } from "@/data";
import { getMockResults, type AggregatedResult, useLanguage } from "@/lib";
import { motion, useInView, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  RefreshCw,
  Users,
  TrendingUp,
  ChevronDown,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Target,
  Award,
  ArrowRight,
  Brain,
  Heart,
  Church,
} from "lucide-react";
import { cn } from "@/lib";

// Modern color palette
const COLORS = [
  { bg: "from-blue-500 to-blue-600", text: "text-blue-400", glow: "shadow-blue-500/20", hex: "#3b82f6" },
  { bg: "from-emerald-500 to-emerald-600", text: "text-emerald-400", glow: "shadow-emerald-500/20", hex: "#10b981" },
  { bg: "from-amber-500 to-amber-600", text: "text-amber-400", glow: "shadow-amber-500/20", hex: "#f59e0b" },
  { bg: "from-rose-500 to-rose-600", text: "text-rose-400", glow: "shadow-rose-500/20", hex: "#f43f5e" },
  { bg: "from-violet-500 to-violet-600", text: "text-violet-400", glow: "shadow-violet-500/20", hex: "#8b5cf6" },
  { bg: "from-cyan-500 to-cyan-600", text: "text-cyan-400", glow: "shadow-cyan-500/20", hex: "#06b6d4" },
];

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

// Animated circular progress component with glow
function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  delay = 0,
  children,
  showGlow = true,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  delay?: number;
  children?: React.ReactNode;
  showGlow?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      setOffset(circumference - (percentage / 100) * circumference);
    }, delay);
    return () => clearTimeout(timeout);
  }, [circumference, percentage, delay, isInView]);

  return (
    <div ref={containerRef} className="relative" style={{ width: size, height: size }}>
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 transition-opacity duration-1000"
          style={{ backgroundColor: color }}
        />
      )}
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        {children}
      </div>
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

// Animated bar chart
function AnimatedBarChart({
  data,
  maxValue,
  color,
}: {
  data: { name: string; value: number; percentage: number }[];
  maxValue: number;
  color: typeof COLORS[0];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="space-y-4">
      {data.slice(0, 5).map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground truncate max-w-[60%] group-hover:text-foreground transition-colors">
              {item.name}
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: index * 0.1 + 0.3 }}
              className={cn("text-sm font-bold", color.text)}
            >
              {item.percentage.toFixed(1)}%
            </motion.span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: `${(item.value / maxValue) * 100}%` } : {}}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
                color.bg
              )}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                animate={isInView ? { x: "100%" } : {}}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
              />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Modern donut chart
function DonutChart({
  data,
  total,
  size = 160,
}: {
  data: { name: string; value: number; color: string }[];
  total: number;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Pre-compute offsets to avoid mutation during render
  const segmentsWithOffsets = useMemo(() => {
    return data.reduce<Array<{ name: string; value: number; color: string; segmentLength: number; offset: number }>>((acc, segment, index) => {
      const segmentPercentage = (segment.value / total) * 100;
      const segmentLength = (segmentPercentage / 100) * circumference;
      const offset = index === 0 ? 0 : acc[index - 1].offset + acc[index - 1].segmentLength;
      acc.push({ ...segment, segmentLength, offset });
      return acc;
    }, []);
  }, [data, total, circumference]);

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/10"
        />
        {segmentsWithOffsets.map((segment, index) => (
          <motion.circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${segment.segmentLength} ${circumference - segment.segmentLength}`}
            strokeDashoffset={-segment.offset}
            initial={{ opacity: 0, strokeDasharray: `0 ${circumference}` }}
            animate={isInView ? {
              opacity: 1,
              strokeDasharray: `${segment.segmentLength} ${circumference - segment.segmentLength}`,
            } : {}}
            transition={{ delay: index * 0.15 + 0.3, duration: 0.8, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${segment.color}40)` }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="text-3xl font-bold text-foreground"
        >
          {total}
        </motion.span>
        <span className="text-xs text-muted-foreground">réponses</span>
      </div>
    </div>
  );
}

// Scale visualization with animated bars
function ScaleVisualization({
  data,
  question,
  total,
}: {
  data: { name: string; value: number }[];
  question: Question;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const weightedSum = data.reduce((sum, entry, idx) => {
    const numValue = parseInt(entry.name) || idx + 1;
    return sum + numValue * entry.value;
  }, 0);
  const average = weightedSum / total;
  const maxValue = Math.max(...data.map((d) => d.value));

  const getBarColor = (index: number) => {
    const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
    return colors[index] || colors[0];
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Average score */}
      <div className="flex items-center justify-center">
        <CircularProgress
          percentage={(average / 5) * 100}
          size={120}
          strokeWidth={10}
          color={average >= 3.5 ? "#22c55e" : average >= 2.5 ? "#eab308" : "#ef4444"}
          delay={200}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-3xl font-bold text-foreground"
            >
              {average.toFixed(1)}
            </motion.div>
            <div className="text-xs text-muted-foreground">/5</div>
          </div>
        </CircularProgress>
      </div>

      {/* Distribution bars */}
      <div className="flex items-end justify-center gap-3 h-28">
        {data.map((entry, idx) => {
          const percentage = (entry.value / maxValue) * 100;
          const color = getBarColor(idx);

          return (
            <motion.div
              key={idx}
              className="flex flex-col items-center gap-2 flex-1 max-w-14"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="relative w-full h-full flex items-end">
                <motion.div
                  className="w-full rounded-t-xl relative overflow-hidden cursor-pointer group"
                  initial={{ height: 0 }}
                  animate={isInView ? { height: `${Math.max(percentage, 15)}%` } : {}}
                  transition={{ delay: idx * 0.1 + 0.3, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  style={{ backgroundColor: color, minHeight: "24px" }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: idx * 0.1 + 0.6 }}
                    className="absolute inset-x-0 top-1.5 text-center text-xs font-bold text-white"
                  >
                    {((entry.value / total) * 100).toFixed(0)}%
                  </motion.span>
                </motion.div>
              </div>
              <span className="text-base font-semibold text-muted-foreground">{entry.name}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground/70 px-2">
        <span>{question.minLabel}</span>
        <span className="text-right">{question.maxLabel}</span>
      </div>
    </div>
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
  const { t } = useLanguage();
  const [results, setResults] = useState<AggregatedResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/results/aggregated", {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch results: ${response.status}`);
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (Array.isArray(data?.results) && data.results.length > 0) {
          setResults(data.results);
        } else {
          setResults(getMockResults());
        }
      } catch (error) {
        console.error("Unable to load aggregated results, falling back to mock data:", error);
        if (isMounted) {
          setResults(getMockResults());
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
  }, []);

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
          className="flex justify-center"
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
            <span className="text-gradient-animated">
              {t("dashboard.dashboardTitle")}
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
            {t("dashboard.exploreDescription")}
          </p>
        </motion.div>

        {/* Key Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <InsightCard
            icon={Users}
            title={t("dashboard.participants")}
            value={<AnimatedNumber value={1543} />}
            subtitle={t("dashboard.responsesCollected")}
            color="#3b82f6"
            delay={0.2}
          />
          <InsightCard
            icon={Church}
            title={t("dashboard.catholics")}
            value="67%"
            subtitle={t("dashboard.majorityDenomination")}
            color="#8b5cf6"
            delay={0.3}
          />
          <InsightCard
            icon={Zap}
            title={t("dashboard.aiUsers")}
            value="42%"
            subtitle={t("dashboard.useAIRegularly")}
            color="#10b981"
            delay={0.4}
          />
          <InsightCard
            icon={Award}
            title={t("dashboard.averageScore")}
            value="3.8/5"
            subtitle={t("dashboard.crs5Religiosity")}
            color="#f59e0b"
            delay={0.5}
          />
        </div>
      </motion.section>

      {/* Highlight Section */}
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
              <h2 className="text-2xl md:text-3xl font-light text-foreground">
                {t("dashboard.insightTitle")}
              </h2>
              <p className="text-muted-foreground">
                {t("dashboard.insightDescription")}
              </p>
              <motion.button
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
              >
                <span>{t("dashboard.exploreData")}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex-shrink-0">
              <DonutChart
                data={[
                  { name: "IA général", value: 42, color: "#3b82f6" },
                  { name: "IA spirituel", value: 12, color: "#8b5cf6" },
                  { name: "Non utilisateurs", value: 46, color: "#374151" },
                ]}
                total={100}
                size={180}
              />
            </div>
          </div>
        </div>
      </motion.section>

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

        {/* Methodology note */}
        <div className="max-w-2xl mx-auto pt-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
            <span className="font-medium text-muted-foreground/70">{t("methodology.title")}:</span>{" "}
            {t("methodology.description")}
          </p>
        </div>

        <p className="text-xs text-muted-foreground/50">
          {t("dashboard.studyConductedBy")}
        </p>
      </motion.footer>
    </div>
  );
}

// Modern Chart Card Component
interface ModernChartCardProps {
  question: Question;
  data: AggregatedResult;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function ModernChartCard({ question, data, index, isExpanded, onToggle }: ModernChartCardProps) {
  const { t } = useLanguage();
  const chartData = useMemo(() => {
    return Object.entries(data.distribution)
      .map(([key, value]) => {
        let label = key;
        let fullLabel = key;
        if (question.options) {
          const opt = question.options.find((o) => o.value === key);
          fullLabel = opt ? opt.label : key;
          label = fullLabel.length > 30 ? fullLabel.substring(0, 30) + "..." : fullLabel;
        }
        return { name: label, value, fullName: fullLabel };
      })
      .sort((a, b) => b.value - a.value);
  }, [data.distribution, question.options]);

  const totalResponses = useMemo(() => {
    return Object.values(data.distribution).reduce((sum, val) => sum + val, 0);
  }, [data.distribution]);

  const maxValue = Math.max(...chartData.map((d) => d.value));
  const topPercentage = ((chartData[0]?.value || 0) / totalResponses * 100);

  const barChartData = chartData.map(item => ({
    ...item,
    percentage: (item.value / totalResponses) * 100,
  }));

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
        opacity: { duration: 0.4 },
        y: { duration: 0.5, delay: index * 0.05 },
      }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      <div className={cn(
        "relative rounded-3xl overflow-hidden",
        "glass-card-refined",
      )}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {question.type === "scale" ? (
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                ) : (
                  <PieChartIcon className="w-4 h-4 text-purple-500" />
                )}
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {question.category.replace("_", " ")}
                </span>
              </div>
              <h2 className="text-base font-medium text-foreground leading-relaxed">
                {question.text}
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggle}
              className="p-2.5 rounded-xl bg-muted hover:bg-accent transition-colors"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </motion.button>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{totalResponses}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">
                {topPercentage.toFixed(0)}% {t("dashboard.majority")}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait" initial={false}>
            {question.type === "scale" ? (
              <motion.div
                key="scale"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScaleVisualization
                  data={chartData}
                  question={question}
                  total={totalResponses}
                />
              </motion.div>
            ) : (
              <motion.div
                key="bars"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnimatedBarChart
                  data={barChartData}
                  maxValue={maxValue}
                  color={COLORS[index % COLORS.length]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
