"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Shield, Sparkles } from "lucide-react";

interface ScaleVisualizerProps {
  translations: {
    validatedScalesTitle: string;
    crs5Title: string;
    crs5Description: string;
    crs5Citation: string;
    marloweCrowneTitle: string;
    marloweCrowneDescription: string;
    marloweCrowneCitation: string;
    aiasTitle: string;
    aiasDescription: string;
    aiasCitation: string;
  };
}

type Tab = "crs5" | "marlowe" | "aias";

export function ScaleVisualizer({ translations: t }: ScaleVisualizerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("crs5");

  const tabs = [
    { id: "crs5" as Tab, label: "CRS-5", icon: BookOpen },
    { id: "marlowe" as Tab, label: "Marlowe-Crowne", icon: Shield },
    { id: "aias" as Tab, label: "AIAS", icon: Sparkles },
  ];

  const content = {
    crs5: {
      title: t.crs5Title,
      description: t.crs5Description,
      citation: t.crs5Citation,
      color: "#6366F1",
      dimensions: [
        { name: "Intellect", desc: "Fréquence de réflexion sur les questions religieuses" },
        { name: "Idéologie", desc: "Conviction dans les croyances religieuses" },
        { name: "Pratique publique", desc: "Fréquence de participation aux services" },
        { name: "Pratique privée", desc: "Fréquence de prière personnelle" },
        { name: "Expérience", desc: "Intensité des expériences spirituelles" },
      ],
    },
    marlowe: {
      title: t.marloweCrowneTitle,
      description: t.marloweCrowneDescription,
      citation: t.marloweCrowneCitation,
      color: "#10B981",
      dimensions: [
        { name: "Item 1", desc: "Facilité à travailler sans encouragement" },
        { name: "Item 2", desc: "N'avoir jamais détesté quelqu'un" },
        { name: "Item 3", desc: "Ne jamais être ennuyé par les demandes d'aide" },
        { name: "Item 4", desc: "Toujours être courtois" },
        { name: "Item 5", desc: "N'avoir jamais profité de quelqu'un" },
      ],
    },
    aias: {
      title: t.aiasTitle,
      description: t.aiasDescription,
      citation: t.aiasCitation,
      color: "#EC4899",
      dimensions: [
        { name: "Opacité", desc: "Inquiétude face à l'incompréhensibilité de l'IA" },
        { name: "Remplacement", desc: "Peur d'être remplacé par l'IA" },
        { name: "Conscience", desc: "Questionnement sur la conscience de l'IA" },
        { name: "Imago Dei", desc: "Rapport à l'image de Dieu dans l'humain" },
      ],
    },
  };

  const current = content[activeTab];

  return (
    <div className="glass-card-refined rounded-2xl p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground text-center">
        {t.validatedScalesTitle}
      </h2>

      {/* Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-white text-slate-900"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div
          className="p-4 rounded-xl"
          style={{ backgroundColor: `${current.color}15` }}
        >
          <h3 className="font-bold text-lg mb-2" style={{ color: current.color }}>
            {current.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Dimension visualization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {current.dimensions.map((dim, index) => (
            <motion.div
              key={dim.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-3 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: current.color }}
                />
                <span className="text-sm font-medium text-foreground">{dim.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{dim.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Citation */}
        <div className="text-xs text-muted-foreground/60 italic border-l-2 pl-3"
             style={{ borderColor: current.color }}>
          {current.citation}
        </div>
      </motion.div>
    </div>
  );
}
