"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib";

export interface BarChartColor {
  bg: string;
  text: string;
  glow: string;
  hex: string;
}

interface AnimatedBarChartProps {
  data: { name: string; value: number; percentage: number }[];
  maxValue: number;
  color: BarChartColor;
}

export function AnimatedBarChart({
  data,
  maxValue,
  color,
}: AnimatedBarChartProps) {
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
