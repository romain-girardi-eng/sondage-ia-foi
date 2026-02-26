"use client";

import { motion } from "framer-motion";
import { Cross } from "lucide-react";

interface ConfessionalTreeProps {
  translations: {
    confessionalTitle: string;
    confessionalDesc: string;
    catholic: string;
    protestantMainline: string;
    protestantEvangelical: string;
    protestantPentecostal: string;
    orthodox: string;
    orthodoxEastern: string;
    orthodoxOriental: string;
    anglican: string;
    otherChristian: string;
  };
}

export function ConfessionalTree({ translations: t }: ConfessionalTreeProps) {
  const branches = [
    {
      name: t.catholic,
      color: "#6366F1",
      sub: ["Paroissial", "Charismatique", "Traditionaliste"],
      percentage: "~45%",
    },
    {
      name: "Protestant",
      color: "#10B981",
      sub: [t.protestantMainline, t.protestantEvangelical, t.protestantPentecostal],
      percentage: "~30%",
    },
    {
      name: t.orthodox,
      color: "#F59E0B",
      sub: [t.orthodoxEastern, t.orthodoxOriental],
      percentage: "~8%",
    },
    {
      name: t.anglican,
      color: "#8B5CF6",
      sub: [],
      percentage: "~5%",
    },
    {
      name: t.otherChristian,
      color: "#EC4899",
      sub: ["Adventiste", "Quaker", "Autre"],
      percentage: "~5%",
    },
  ];

  return (
    <div className="glass-card-refined rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.confessionalTitle}</h2>
        <p className="text-muted-foreground text-sm">{t.confessionalDesc}</p>
      </div>

      {/* Tree visualization with SVG connections */}
      <div className="relative pt-4">
        {/* SVG for connection lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* Main trunk from cross to horizontal line */}
          <line
            x1="50%"
            y1="64"
            x2="50%"
            y2="120"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          {/* Horizontal distribution line */}
          <line
            x1="10%"
            y1="120"
            x2="90%"
            y2="120"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          {/* Vertical lines to each branch - 5 branches at 10%, 30%, 50%, 70%, 90% */}
          <line x1="10%" y1="120" x2="10%" y2="145" stroke="#6366F1" strokeWidth="2" />
          <line x1="30%" y1="120" x2="30%" y2="145" stroke="#10B981" strokeWidth="2" />
          <line x1="50%" y1="120" x2="50%" y2="145" stroke="#F59E0B" strokeWidth="2" />
          <line x1="70%" y1="120" x2="70%" y2="145" stroke="#8B5CF6" strokeWidth="2" />
          <line x1="90%" y1="120" x2="90%" y2="145" stroke="#EC4899" strokeWidth="2" />
        </svg>

        {/* Central trunk icon */}
        <div className="flex flex-col items-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/30"
          >
            <Cross className="w-8 h-8 text-foreground/80" />
          </motion.div>
        </div>

        {/* Spacing for SVG lines */}
        <div className="h-20" />

        {/* Branches */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 relative z-10">
          {branches.map((branch, index) => (
            <motion.div
              key={branch.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Branch card */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${branch.color}15` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="font-bold text-sm"
                    style={{ color: branch.color }}
                  >
                    {branch.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {branch.percentage}
                  </span>
                </div>

                {/* Sub-branches */}
                <div className="space-y-1">
                  {branch.sub.map((sub) => (
                    <div
                      key={sub}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: branch.color }}
                      />
                      {sub}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-muted-foreground/60 text-center">
        Les pourcentages sont indicatifs et basés sur les réponses collectées
      </p>
    </div>
  );
}
