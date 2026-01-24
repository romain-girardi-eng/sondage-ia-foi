"use client";

import { useEffect, useState, useMemo } from "react";
import { SURVEY_QUESTIONS, type Question } from "@/data";
import { getMockResults, type AggregatedResult } from "@/lib";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { RefreshCw, Users, TrendingUp, Info } from "lucide-react";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function ResultsDashboard() {
  const [results, setResults] = useState<AggregatedResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(getMockResults());
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRestart = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        role="status"
        aria-live="polite"
      >
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-400 font-medium">Analyse des donnees...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 space-y-8 md:space-y-12">
      {/* Header */}
      <header className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Resultats de l&apos;Etude
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Users className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <span className="text-sm font-medium">1,543 participants</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <TrendingUp className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span className="text-sm font-medium">Donnees simulees</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground flex items-center justify-center gap-2 max-w-lg mx-auto"
        >
          <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            Ces resultats sont des donnees de demonstration. Les vrais resultats
            seront disponibles a la fin de l&apos;etude.
          </span>
        </motion.p>
      </header>

      {/* Charts Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        role="list"
        aria-label="Resultats par question"
      >
        {SURVEY_QUESTIONS.map((question, index) => {
          const data = results.find((r) => r.questionId === question.id);
          if (!data || Object.keys(data.distribution).length === 0) return null;

          return (
            <ChartCard
              key={question.id}
              question={question}
              data={data}
              index={index}
            />
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="text-center pt-8 space-y-6">
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Recommencer le sondage</span>
        </button>

        <p className="text-xs text-muted-foreground/50">
          Merci pour votre contribution a cette recherche academique.
        </p>
      </div>
    </div>
  );
}

interface ChartCardProps {
  question: Question;
  data: AggregatedResult;
  index: number;
}

function ChartCard({ question, data, index }: ChartCardProps) {
  const chartData = useMemo(() => {
    return Object.entries(data.distribution).map(([key, value]) => {
      let label = key;
      if (question.options) {
        const opt = question.options.find((o) => o.value === key);
        label = opt ? opt.label : key;
        if (label.length > 20) {
          label = label.substring(0, 20) + "...";
        }
      }
      return { name: label, value, fullName: label };
    });
  }, [data.distribution, question.options]);

  const totalResponses = useMemo(() => {
    return Object.values(data.distribution).reduce((sum, val) => sum + val, 0);
  }, [data.distribution]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gray-900/40 border border-white/5 rounded-2xl p-4 md:p-6 backdrop-blur-xl flex flex-col"
      role="listitem"
    >
      <h2
        className="text-sm md:text-base font-medium mb-4 min-h-[3rem] line-clamp-2 leading-snug text-slate-200"
        title={question.text}
      >
        {question.text}
      </h2>

      <div className="flex-1 w-full min-h-[200px] md:min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          {question.type === "scale" ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  color: "#f1f5f9",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
                formatter={(value) => {
                  const numValue = Number(value) || 0;
                  return [
                    `${numValue} reponses (${((numValue / totalResponses) * 100).toFixed(1)}%)`,
                    "",
                  ];
                }}
              />
              <Bar
                dataKey="value"
                fill="#60a5fa"
                radius={[4, 4, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                animationDuration={1200}
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  color: "#f1f5f9",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => {
                  const numValue = Number(value) || 0;
                  return [
                    `${numValue} (${((numValue / totalResponses) * 100).toFixed(1)}%)`,
                    name,
                  ];
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                formatter={(value: string) =>
                  value.length > 18 ? value.substring(0, 18) + "..." : value
                }
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {question.type === "scale" && (
        <div className="flex justify-between text-[10px] text-muted-foreground mt-3 px-1 pt-3 border-t border-white/5">
          <span className="truncate max-w-[45%]">{question.minLabel}</span>
          <span className="truncate max-w-[45%] text-right">
            {question.maxLabel}
          </span>
        </div>
      )}
    </motion.article>
  );
}
