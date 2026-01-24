"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { SURVEY_QUESTIONS, type Question } from "@/data";
import { getMockResults, type AggregatedResult, useLanguage } from "@/lib";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Users,
  TrendingUp,
  ChevronDown,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
} from "lucide-react";
import { cn } from "@/lib";

// Modern color palette
const COLORS = [
  { bg: "from-blue-500 to-blue-600", text: "text-blue-400", glow: "shadow-blue-500/20" },
  { bg: "from-emerald-500 to-emerald-600", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  { bg: "from-amber-500 to-amber-600", text: "text-amber-400", glow: "shadow-amber-500/20" },
  { bg: "from-rose-500 to-rose-600", text: "text-rose-400", glow: "shadow-rose-500/20" },
  { bg: "from-violet-500 to-violet-600", text: "text-violet-400", glow: "shadow-violet-500/20" },
  { bg: "from-cyan-500 to-cyan-600", text: "text-cyan-400", glow: "shadow-cyan-500/20" },
];

const FLAT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [end, duration, delay, isInView]);

  return { count, ref };
}

// Animated circular progress component
function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  delay = 0,
  children,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  delay?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const ref = useRef<SVGCircleElement>(null);
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
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/5"
        />
        {/* Progress circle */}
        <circle
          ref={ref}
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
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// Modern horizontal bar component
function HorizontalBar({
  label,
  value,
  total,
  color,
  index,
  maxValue,
}: {
  label: string;
  value: number;
  total: number;
  color: typeof COLORS[0];
  index: number;
  maxValue: number;
}) {
  const percentage = (value / total) * 100;
  const widthPercentage = (value / maxValue) * 100;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/80 truncate max-w-[70%] group-hover:text-white transition-colors">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold", color.text)}>
            {percentage.toFixed(1)}%
          </span>
          <span className="text-xs text-white/40">({value})</span>
        </div>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${widthPercentage}%` } : {}}
          transition={{ delay: index * 0.08 + 0.2, duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            color.bg,
            "shadow-lg",
            color.glow
          )}
        />
      </div>
    </motion.div>
  );
}

// Radial chart for choice questions
function RadialChart({
  data,
  total,
}: {
  data: { name: string; value: number; fullName: string }[];
  total: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  // Calculate the dominant response
  const maxEntry = data.reduce((max, entry) => entry.value > max.value ? entry : max, data[0]);
  const maxPercentage = (maxEntry.value / total) * 100;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6">
      {/* Central radial visualization */}
      <div className="relative">
        <CircularProgress
          percentage={maxPercentage}
          size={140}
          strokeWidth={10}
          color={FLAT_COLORS[0]}
          delay={200}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="text-3xl font-bold text-white"
            >
              {maxPercentage.toFixed(0)}%
            </motion.div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider mt-1">
              Majoritaire
            </div>
          </div>
        </CircularProgress>

        {/* Floating indicators */}
        {data.slice(0, 4).map((entry, idx) => {
          const angle = (idx / 4) * Math.PI * 2 - Math.PI / 2;
          const radius = 90;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const percentage = (entry.value / total) * 100;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + idx * 0.1, type: "spring" }}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px - 16px)`,
                top: `calc(50% + ${y}px - 16px)`,
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-all duration-300",
                  "bg-gradient-to-br",
                  COLORS[idx % COLORS.length].bg,
                  hoveredIndex === idx ? "scale-125 shadow-lg" : "scale-100"
                )}
              >
                {percentage.toFixed(0)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="w-full space-y-2 max-h-[180px] overflow-y-auto scrollbar-thin">
        {data.map((entry, idx) => {
          const percentage = (entry.value / total) * 100;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 + idx * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
                hoveredIndex === idx ? "bg-white/10" : "hover:bg-white/5"
              )}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full bg-gradient-to-br shrink-0",
                  COLORS[idx % COLORS.length].bg
                )}
              />
              <span className="text-xs text-white/70 truncate flex-1" title={entry.fullName}>
                {entry.name}
              </span>
              <span className={cn("text-xs font-semibold", COLORS[idx % COLORS.length].text)}>
                {percentage.toFixed(1)}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Scale visualization component
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

  // Calculate weighted average
  const weightedSum = data.reduce((sum, entry, idx) => {
    const numValue = parseInt(entry.name) || idx + 1;
    return sum + numValue * entry.value;
  }, 0);
  const average = weightedSum / total;

  // Find max for scaling
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div ref={ref} className="space-y-6">
      {/* Average indicator */}
      <div className="flex items-center justify-center gap-4">
        <CircularProgress
          percentage={(average / 5) * 100}
          size={100}
          strokeWidth={8}
          color={average >= 3.5 ? "#10b981" : average >= 2.5 ? "#f59e0b" : "#ef4444"}
          delay={200}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{average.toFixed(1)}</div>
            <div className="text-[9px] text-white/50">/5</div>
          </div>
        </CircularProgress>
      </div>

      {/* Scale bars */}
      <div className="flex items-end justify-center gap-2 h-32">
        {data.map((entry, idx) => {
          const percentage = (entry.value / maxValue) * 100;
          return (
            <motion.div
              key={idx}
              className="flex flex-col items-center gap-2 flex-1 max-w-16"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1 }}
            >
              <motion.div
                className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 relative overflow-hidden group cursor-pointer"
                initial={{ height: 0 }}
                animate={isInView ? { height: `${Math.max(percentage, 10)}%` } : {}}
                transition={{ delay: idx * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }}
                style={{ minHeight: "20px" }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: idx * 0.1 + 0.8 }}
                  className="absolute inset-x-0 top-1 text-center text-[10px] font-bold text-white"
                >
                  {((entry.value / total) * 100).toFixed(0)}%
                </motion.div>
              </motion.div>
              <span className="text-sm font-medium text-white/60">{entry.name}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-white/40 px-1">
        <span className="max-w-[40%] truncate">{question.minLabel}</span>
        <span className="max-w-[40%] truncate text-right">{question.maxLabel}</span>
      </div>
    </div>
  );
}

// Category filter pills
const CATEGORIES = [
  { id: "all", label: "Tous", labelEn: "All" },
  { id: "profile", label: "Profil", labelEn: "Profile" },
  { id: "religiosity", label: "Religiosité", labelEn: "Religiosity" },
  { id: "usage", label: "Usage IA", labelEn: "AI Usage" },
  { id: "theology", label: "Théologie", labelEn: "Theology" },
  { id: "psychology", label: "Psychologie", labelEn: "Psychology" },
];

export function ResultsDashboard() {
  const { language } = useLanguage();
  const [results, setResults] = useState<AggregatedResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { count: participantCount, ref: countRef } = useAnimatedCounter(1543, 2000, 500);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(getMockResults());
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-16 h-16"
        >
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/60 font-light"
        >
          {language === "fr" ? "Analyse des données en cours..." : "Analyzing data..."}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20 space-y-10">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 pt-8"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white/70">
            {language === "fr" ? "Résultats de l'étude" : "Study Results"}
          </span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-extralight tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200">
            {language === "fr" ? "Visualisation des Données" : "Data Visualization"}
          </span>
        </h1>

        <p className="text-white/50 max-w-xl mx-auto text-lg font-light">
          {language === "fr"
            ? "Explorez les tendances et insights de notre communauté de participants"
            : "Explore trends and insights from our participant community"}
        </p>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 pt-4"
        >
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">
                <span ref={countRef}>{participantCount.toLocaleString()}</span>
              </div>
              <div className="text-xs text-white/50">
                {language === "fr" ? "Participants" : "Participants"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">{filteredQuestions.length}</div>
              <div className="text-xs text-white/50">
                {language === "fr" ? "Questions analysées" : "Questions analyzed"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">
                {language === "fr" ? "Simulées" : "Simulated"}
              </div>
              <div className="text-xs text-white/50">
                {language === "fr" ? "Données de démo" : "Demo data"}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 flex-wrap"
      >
        <Filter className="w-4 h-4 text-white/40 mr-2" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              selectedCategory === cat.id
                ? "bg-white text-slate-900 shadow-lg shadow-white/10"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
            )}
          >
            {language === "fr" ? cat.label : cat.labelEn}
          </button>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
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
        transition={{ delay: 0.8 }}
        className="text-center pt-12 space-y-6"
      >
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-[1.02]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{language === "fr" ? "Recommencer le sondage" : "Restart survey"}</span>
        </button>

        <p className="text-xs text-white/30">
          {language === "fr"
            ? "Merci pour votre contribution à cette recherche académique."
            : "Thank you for your contribution to this academic research."}
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
  const chartData = useMemo(() => {
    return Object.entries(data.distribution)
      .map(([key, value]) => {
        let label = key;
        let fullLabel = key;
        if (question.options) {
          const opt = question.options.find((o) => o.value === key);
          fullLabel = opt ? opt.label : key;
          label = fullLabel.length > 25 ? fullLabel.substring(0, 25) + "..." : fullLabel;
        }
        return { name: label, value, fullName: fullLabel };
      })
      .sort((a, b) => b.value - a.value);
  }, [data.distribution, question.options]);

  const totalResponses = useMemo(() => {
    return Object.values(data.distribution).reduce((sum, val) => sum + val, 0);
  }, [data.distribution]);

  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.3 },
        y: { duration: 0.3, delay: index * 0.03 },
      }}
      className={cn(
        "group relative rounded-3xl",
        "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
        "border border-white/10 hover:border-white/20",
        "backdrop-blur-xl transition-colors duration-300",
        "hover:shadow-2xl hover:shadow-blue-500/5"
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {question.type === "scale" ? (
                <BarChart3 className="w-4 h-4 text-blue-400" />
              ) : (
                <PieChartIcon className="w-4 h-4 text-purple-400" />
              )}
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                {question.category.replace("_", " ")}
              </span>
            </div>
            <h2 className="text-base font-medium text-white leading-snug">
              {question.text}
            </h2>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors shrink-0"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 text-white/50 transition-transform duration-300",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
          <span>{totalResponses} réponses</span>
          <span>•</span>
          <span className="text-emerald-400">
            {((chartData[0]?.value || 0) / totalResponses * 100).toFixed(0)}% majoritaire
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative px-6 pb-6 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {question.type === "scale" ? (
            <motion.div
              key="scale"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ScaleVisualization
                data={chartData}
                question={question}
                total={totalResponses}
              />
            </motion.div>
          ) : isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {chartData.map((entry, idx) => (
                <HorizontalBar
                  key={idx}
                  label={entry.fullName}
                  value={entry.value}
                  total={totalResponses}
                  color={COLORS[idx % COLORS.length]}
                  index={idx}
                  maxValue={maxValue}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="radial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RadialChart data={chartData} total={totalResponses} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
