"use client";

import { motion } from "framer-motion";
import { Calculator, TrendingUp, Target, Shield } from "lucide-react";

interface FormulaDisplayProps {
  translations: {
    statsTitle: string;
    weightedAverageTitle: string;
    weightedAverageDesc: string;
    weightedAverageFormula: string;
    percentileTitle: string;
    percentileDesc: string;
    percentileFormula: string;
    profileMatchingTitle: string;
    profileMatchingDesc: string;
    biasAdjustmentTitle: string;
    biasAdjustmentDesc: string;
  };
}

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
      title: t.percentileTitle,
      description: t.percentileDesc,
      formula: t.percentileFormula,
      color: "#10B981",
    },
    {
      icon: Target,
      title: t.profileMatchingTitle,
      description: t.profileMatchingDesc,
      formula: "distance = √Σ(wi × (xi - [min,max])²)",
      color: "#F59E0B",
    },
    {
      icon: Shield,
      title: t.biasAdjustmentTitle,
      description: t.biasAdjustmentDesc,
      formula: "adjusted = raw - (bias × sensitivity × 0.05)",
      color: "#EC4899",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">{t.statsTitle}</h2>

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
              <h3 className="font-bold text-white">{method.title}</h3>
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

      {/* Normal distribution curve illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="glass-card-refined rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 text-center">
          Distribution Normale (CDF)
        </h3>
        <svg viewBox="0 0 400 150" className="w-full max-w-md mx-auto">
          {/* Axes */}
          <line x1="50" y1="120" x2="350" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="50" y1="20" x2="50" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

          {/* Normal curve */}
          <path
            d="M 50,120 Q 100,120 125,110 Q 150,95 175,60 Q 200,25 225,60 Q 250,95 275,110 Q 300,120 350,120"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
          />

          {/* Filled area under curve */}
          <path
            d="M 50,120 Q 100,120 125,110 Q 150,95 175,60 Q 200,25 225,60 Q 250,95 275,110 Q 300,120 350,120 L 350,120 L 50,120 Z"
            fill="url(#curveGradient)"
            opacity="0.3"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Labels */}
          <text x="50" y="135" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">-3σ</text>
          <text x="125" y="135" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">-2σ</text>
          <text x="200" y="135" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">μ</text>
          <text x="275" y="135" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">+2σ</text>
          <text x="350" y="135" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">+3σ</text>

          {/* Percentile markers */}
          <line x1="125" y1="110" x2="125" y2="120" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3" />
          <text x="125" y="105" fill="#F59E0B" fontSize="9" textAnchor="middle">2.3%</text>

          <line x1="275" y1="110" x2="275" y2="120" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3" />
          <text x="275" y="105" fill="#F59E0B" fontSize="9" textAnchor="middle">97.7%</text>
        </svg>
        <p className="text-xs text-muted-foreground text-center mt-4">
          La fonction CDF (Φ) convertit un z-score en percentile avec une précision mathématique
        </p>
      </motion.div>
    </div>
  );
}
