"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { type Question } from "@/data";
import { CircularProgress } from "./CircularProgress";

interface ScaleVisualizationProps {
  data: { name: string; value: number }[];
  question: Question;
  total: number;
}

export function ScaleVisualization({
  data,
  question,
  total,
}: ScaleVisualizationProps) {
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
