"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DIMENSION_COLORS } from "@/lib/scoring/constants";
import type { SevenDimensions } from "@/lib/scoring/types";

interface DimensionWheelProps {
  translations: {
    dimensionsTitle: string;
    dimensionsDescription: string;
    clickToExplore: string;
    dimensionReligiosity: string;
    dimensionReligiosityDesc: string;
    dimensionAiOpenness: string;
    dimensionAiOpennessDesc: string;
    dimensionSacredBoundary: string;
    dimensionSacredBoundaryDesc: string;
    dimensionEthicalConcern: string;
    dimensionEthicalConcernDesc: string;
    dimensionPsychPerception: string;
    dimensionPsychPerceptionDesc: string;
    dimensionCommunity: string;
    dimensionCommunityDesc: string;
    dimensionFuture: string;
    dimensionFutureDesc: string;
  };
}

const dimensions: Array<{
  key: keyof SevenDimensions;
  angle: number;
}> = [
  { key: "religiosity", angle: 0 },
  { key: "aiOpenness", angle: 51.4 },
  { key: "sacredBoundary", angle: 102.8 },
  { key: "ethicalConcern", angle: 154.2 },
  { key: "psychologicalPerception", angle: 205.6 },
  { key: "communityInfluence", angle: 257 },
  { key: "futureOrientation", angle: 308.4 },
];

export function DimensionWheel({ translations: t }: DimensionWheelProps) {
  const [selected, setSelected] = useState<keyof SevenDimensions | null>(null);

  const dimensionLabels: Record<keyof SevenDimensions, { name: string; desc: string }> = {
    religiosity: { name: t.dimensionReligiosity, desc: t.dimensionReligiosityDesc },
    aiOpenness: { name: t.dimensionAiOpenness, desc: t.dimensionAiOpennessDesc },
    sacredBoundary: { name: t.dimensionSacredBoundary, desc: t.dimensionSacredBoundaryDesc },
    ethicalConcern: { name: t.dimensionEthicalConcern, desc: t.dimensionEthicalConcernDesc },
    psychologicalPerception: { name: t.dimensionPsychPerception, desc: t.dimensionPsychPerceptionDesc },
    communityInfluence: { name: t.dimensionCommunity, desc: t.dimensionCommunityDesc },
    futureOrientation: { name: t.dimensionFuture, desc: t.dimensionFutureDesc },
  };

  // SVG dimensions - wider to accommodate labels on left and right sides
  const svgWidth = 500;
  const svgHeight = 400;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const radius = 100;
  const labelRadius = 145;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      {/* SVG Wheel with integrated labels */}
      <div className="flex-shrink-0">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="drop-shadow-xl"
        >
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 15}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />

          {/* Center glow */}
          <defs>
            <radialGradient id="centerGlow">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx={centerX} cy={centerY} r="40" fill="url(#centerGlow)" />

          {/* Dimension spokes and labels */}
          {dimensions.map(({ key, angle }, index) => {
            const radians = (angle - 90) * (Math.PI / 180);
            const nodeX = centerX + radius * Math.cos(radians);
            const nodeY = centerY + radius * Math.sin(radians);
            const labelX = centerX + labelRadius * Math.cos(radians);
            const labelY = centerY + labelRadius * Math.sin(radians);
            const isSelected = selected === key;

            // Determine text anchor based on position
            let textAnchor: "start" | "middle" | "end" = "middle";
            if (labelX < centerX - 20) textAnchor = "end";
            else if (labelX > centerX + 20) textAnchor = "start";

            // Get short label (first word)
            const shortLabel = dimensionLabels[key].name.split(" ")[0];

            return (
              <g key={key}>
                {/* Spoke line */}
                <motion.line
                  x1={centerX}
                  y1={centerY}
                  x2={nodeX}
                  y2={nodeY}
                  stroke={DIMENSION_COLORS[key]}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeOpacity={isSelected ? 1 : 0.6}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                />

                {/* Node circle */}
                <motion.circle
                  cx={nodeX}
                  cy={nodeY}
                  r={isSelected ? 16 : 12}
                  fill={DIMENSION_COLORS[key]}
                  stroke="white"
                  strokeWidth={isSelected ? 3 : 2}
                  className="cursor-pointer"
                  onClick={() => setSelected(isSelected ? null : key)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                />

                {/* Number inside node */}
                <text
                  x={nodeX}
                  y={nodeY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {index + 1}
                </text>

                {/* Label text outside the wheel */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fill={DIMENSION_COLORS[key]}
                  fontSize="11"
                  fontWeight="600"
                  className="cursor-pointer select-none"
                  onClick={() => setSelected(isSelected ? null : key)}
                  style={{
                    opacity: isSelected ? 1 : 0.8,
                    transition: "opacity 0.2s"
                  }}
                >
                  {index + 1}. {shortLabel}
                </text>
              </g>
            );
          })}

          {/* Center text */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            className="select-none"
          >
            7D
          </text>
        </svg>
      </div>

      {/* Details panel */}
      <div className="flex-1 min-h-[200px] min-w-0">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card-refined p-6 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: DIMENSION_COLORS[selected] }}
                />
                <h3 className="text-xl font-bold text-foreground">
                  {dimensionLabels[selected].name}
                </h3>
              </div>
              <p className="text-muted-foreground">
                {dimensionLabels[selected].desc}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-muted-foreground/60">
                  Scale: 1 (low) → 5 (high)
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-muted-foreground p-6"
            >
              <p className="text-lg mb-2">{t.clickToExplore}</p>
              <p className="text-sm opacity-60">
                {t.dimensionsDescription}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
