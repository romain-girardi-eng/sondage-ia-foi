"use client";

import { useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  total: number;
  size?: number;
}

export function DonutChart({
  data,
  total,
  size = 160,
}: DonutChartProps) {
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
