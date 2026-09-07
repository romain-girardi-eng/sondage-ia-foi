"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Users,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { cn, useLanguage } from "@/lib";
import { type Question } from "@/data";
import { AnimatedBarChart, ScaleVisualization, type BarChartColor } from "./charts";

/**
 * One question as served by /api/results/aggregated: arrays and matrices are
 * already expanded server-side (one cell per option, or per "row:col"), and
 * cells below the k-anonymity threshold are merged into K_ANONYMITY_BUCKET.
 */
export interface DashboardResult {
  questionId: string;
  distribution: Record<string, number>;
  /**
   * Sum of the published cells: selections for a multi-select or a matrix, and
   * only what k-anonymity let through. Never a percentage denominator.
   */
  totalResponses: number;
  /**
   * Distinct people who answered the question (migration 011). Null when the
   * database predates it, in which case the cell total is the only fallback.
   */
  respondents: number | null;
}

/** Cell name used by the SQL aggregate for the merged rare modalities. */
export const K_ANONYMITY_BUCKET = "_autres";

// Modern color palette
const COLORS: BarChartColor[] = [
  { bg: "from-blue-500 to-blue-600", text: "text-blue-400", glow: "shadow-blue-500/20", hex: "#3b82f6" },
  { bg: "from-emerald-500 to-emerald-600", text: "text-emerald-400", glow: "shadow-emerald-500/20", hex: "#10b981" },
  { bg: "from-amber-500 to-amber-600", text: "text-amber-400", glow: "shadow-amber-500/20", hex: "#f59e0b" },
  { bg: "from-rose-500 to-rose-600", text: "text-rose-400", glow: "shadow-rose-500/20", hex: "#f43f5e" },
  { bg: "from-violet-500 to-violet-600", text: "text-violet-400", glow: "shadow-violet-500/20", hex: "#8b5cf6" },
  { bg: "from-cyan-500 to-cyan-600", text: "text-cyan-400", glow: "shadow-cyan-500/20", hex: "#06b6d4" },
];

export { COLORS };

interface ModernChartCardProps {
  question: Question;
  data: DashboardResult;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ModernChartCard({ question, data, index, isExpanded, onToggle }: ModernChartCardProps) {
  const { t, language } = useLanguage();
  const bucketLabel = language === "fr" ? "Autres (regroupés)" : "Other (grouped)";

  const cellLabel = useMemo(() => {
    /**
     * A matrix cell is keyed "row:col" by the SQL aggregate (migration 011).
     * Rows and columns carry their own labels in the schema, which is built
     * from the label helpers in `@/lib/i18n/questions`; an unknown key falls
     * back to itself rather than being hidden.
     */
    const matrixLabel = (key: string): string | null => {
      if (!question.rows || !question.columns) return null;
      const separator = key.lastIndexOf(":");
      if (separator <= 0) return null;
      const row = question.rows.find((r) => r.value === key.slice(0, separator));
      const column = question.columns.find(
        (c) => String(c.value) === key.slice(separator + 1)
      );
      if (!row || !column) return null;
      return `${row.label} — ${column.label}`;
    };

    return (key: string): string => {
      const fromMatrix = matrixLabel(key);
      if (fromMatrix) return fromMatrix;
      const option = question.options?.find((o) => o.value === key);
      return option ? option.label : key;
    };
  }, [question.options, question.rows, question.columns]);

  const chartData = useMemo(() => {
    return Object.entries(data.distribution)
      .map(([key, value]) => {
        const fullLabel = key === K_ANONYMITY_BUCKET ? bucketLabel : cellLabel(key);
        const label = fullLabel.length > 30 ? fullLabel.substring(0, 30) + "..." : fullLabel;
        return { name: label, value, fullName: fullLabel };
      })
      .sort((a, b) => b.value - a.value);
  }, [data.distribution, cellLabel, bucketLabel]);

  // Sum of the published cells: the weighted-average denominator of a scale.
  const publishedCells = useMemo(() => {
    return Object.values(data.distribution).reduce((sum, val) => sum + val, 0);
  }, [data.distribution]);

  // Share denominator: people, not selections. A multi-select or a matrix
  // produces several cells per respondent, so dividing by the cell total
  // understated every option. Falls back to the cell total only when the
  // database predates migration 011.
  const respondents = data.respondents ?? publishedCells;

  const maxValue = Math.max(...chartData.map((d) => d.value));
  const topPercentage = respondents > 0 ? ((chartData[0]?.value || 0) / respondents) * 100 : 0;

  const barChartData = chartData.map(item => ({
    ...item,
    percentage: respondents > 0 ? (item.value / respondents) * 100 : 0,
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
              <span className="text-xs text-muted-foreground">{respondents}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">
                {language === "fr"
                  ? `${topPercentage.toFixed(0)}\u202f%`
                  : `${topPercentage.toFixed(0)}%`}{" "}
                {t("dashboard.majority")}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Area - Collapsible */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="chart-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                {question.type === "scale" ? (
                  <ScaleVisualization
                    data={chartData}
                    question={question}
                    total={publishedCells}
                  />
                ) : (
                  <AnimatedBarChart
                    data={barChartData}
                    maxValue={maxValue}
                    color={COLORS[index % COLORS.length]}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
