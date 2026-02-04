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
import { cn, useLanguage, type AggregatedResult } from "@/lib";
import { type Question } from "@/data";
import { AnimatedBarChart, ScaleVisualization, type BarChartColor } from "./charts";

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
  data: AggregatedResult;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ModernChartCard({ question, data, index, isExpanded, onToggle }: ModernChartCardProps) {
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
                    total={totalResponses}
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
