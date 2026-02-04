"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  delay?: number;
  children?: React.ReactNode;
  showGlow?: boolean;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  delay = 0,
  children,
  showGlow = true,
}: CircularProgressProps) {
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
