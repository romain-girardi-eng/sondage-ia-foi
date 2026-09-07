"use client";

import { motion } from "framer-motion";
import { Calculator, TrendingUp, Target, Shield } from "lucide-react";

interface FormulaDisplayProps {
  translations: {
    statsTitle: string;
    weightedAverageTitle: string;
    weightedAverageDesc: string;
    weightedAverageFormula: string;
    empiricalRankTitle: string;
    empiricalRankDesc: string;
    empiricalRankFormula: string;
    profileMatchingTitle: string;
    profileMatchingDesc: string;
    profileMatchingFormula: string;
    desirabilityTitle: string;
    desirabilityDesc: string;
    desirabilityFormula: string;
    distributionTitle: string;
    distributionCaption: string;
  };
}

/** Illustrative shape of an observed distribution, not real data. */
const OBSERVED_BARS = [3, 6, 11, 18, 24, 29, 26, 19, 12, 7, 4];

export function FormulaDisplay({ translations: t }: FormulaDisplayProps) {
  const methods = [
    {
      icon: Calculator,
      title: t.weightedAverageTitle,
      description: t.weightedAverageDesc,
      formula: t.weightedAverageFormula,
      color: "#6366F1",
    },
    {
      icon: TrendingUp,
      title: t.empiricalRankTitle,
      description: t.empiricalRankDesc,
      formula: t.empiricalRankFormula,
      color: "#10B981",
    },
    {
      icon: Target,
      title: t.profileMatchingTitle,
      description: t.profileMatchingDesc,
      formula: t.profileMatchingFormula,
      color: "#F59E0B",
    },
    {
      icon: Shield,
      title: t.desirabilityTitle,
      description: t.desirabilityDesc,
      formula: t.desirabilityFormula,
      color: "#EC4899",
    },
  ];

  const maxBar = Math.max(...OBSERVED_BARS);
  const barWidth = 300 / OBSERVED_BARS.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground text-center">{t.statsTitle}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method, index) => (
          <motion.div
            key={method.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="glass-card-refined rounded-xl p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${method.color}20` }}
              >
                <method.icon className="w-5 h-5" style={{ color: method.color }} />
              </div>
              <h3 className="font-bold text-foreground">{method.title}</h3>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {method.description}
            </p>

            {/* Formula - code style */}
            <div
              className="font-mono text-sm p-3 rounded-lg overflow-x-auto"
              style={{ backgroundColor: `${method.color}10`, color: method.color }}
            >
              <code>{method.formula}</code>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Observed distribution: the rank is read off the collected responses,
          never off a modelled normal population. */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="glass-card-refined rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-foreground mb-4 text-center">
          {t.distributionTitle}
        </h3>
        <svg viewBox="0 0 400 150" className="w-full max-w-md mx-auto" role="img" aria-hidden="true">
          {/* Axes */}
          <line x1="50" y1="120" x2="350" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="50" y1="20" x2="50" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

          {/* Observed bars */}
          {OBSERVED_BARS.map((value, index) => {
            const height = (value / maxBar) * 90;
            return (
              <rect
                key={index}
                x={50 + index * barWidth + 2}
                y={120 - height}
                width={barWidth - 4}
                height={height}
                fill="#10B981"
                opacity={0.45}
                rx="2"
              />
            );
          })}

          {/* Respondent marker */}
          <line x1="270" y1="20" x2="270" y2="120" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx="270" cy="20" r="4" fill="#F59E0B" />

          {/* Axis labels */}
          <text x="50" y="136" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">1</text>
          <text x="200" y="136" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">3</text>
          <text x="350" y="136" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">5</text>
        </svg>
        <p className="text-xs text-muted-foreground text-center mt-4">
          {t.distributionCaption}
        </p>
      </motion.div>
    </div>
  );
}
