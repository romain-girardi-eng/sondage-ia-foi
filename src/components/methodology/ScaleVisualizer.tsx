"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Shield, Sparkles, Bot } from "lucide-react";

interface ScaleItem {
  readonly name: string;
  readonly desc: string;
}

interface ScaleVisualizerProps {
  translations: {
    scalesTitle: string;
    scalesNote: string;
    statusAdapted: string;
    statusAdHoc: string;
    statusInspired: string;
    crs5Title: string;
    crs5Description: string;
    crs5Citation: string;
    crs5Items: readonly ScaleItem[];
    marloweCrowneTitle: string;
    marloweCrowneDescription: string;
    marloweCrowneCitation: string;
    marloweCrowneItems: readonly ScaleItem[];
    godspeedTitle: string;
    godspeedDescription: string;
    godspeedCitation: string;
    godspeedItems: readonly ScaleItem[];
    aiasTitle: string;
    aiasDescription: string;
    aiasCitation: string;
    aiasItems: readonly ScaleItem[];
  };
}

type Tab = "crs5" | "marlowe" | "godspeed" | "aias";

export function ScaleVisualizer({ translations: t }: ScaleVisualizerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("crs5");

  const tabs = [
    { id: "crs5" as Tab, label: "CRS-5", icon: BookOpen },
    { id: "marlowe" as Tab, label: "Marlowe-Crowne", icon: Shield },
    { id: "godspeed" as Tab, label: "Godspeed", icon: Bot },
    { id: "aias" as Tab, label: "AIAS", icon: Sparkles },
  ];

  const content: Record<
    Tab,
    {
      title: string;
      status: string;
      description: string;
      citation: string;
      color: string;
      items: readonly ScaleItem[];
    }
  > = {
    crs5: {
      title: t.crs5Title,
      status: t.statusAdapted,
      description: t.crs5Description,
      citation: t.crs5Citation,
      color: "#6366F1",
      items: t.crs5Items,
    },
    marlowe: {
      title: t.marloweCrowneTitle,
      status: t.statusAdHoc,
      description: t.marloweCrowneDescription,
      citation: t.marloweCrowneCitation,
      color: "#10B981",
      items: t.marloweCrowneItems,
    },
    godspeed: {
      title: t.godspeedTitle,
      status: t.statusInspired,
      description: t.godspeedDescription,
      citation: t.godspeedCitation,
      color: "#F59E0B",
      items: t.godspeedItems,
    },
    aias: {
      title: t.aiasTitle,
      status: t.statusInspired,
      description: t.aiasDescription,
      citation: t.aiasCitation,
      color: "#EC4899",
      items: t.aiasItems,
    },
  };

  const current = content[activeTab];

  return (
    <div className="glass-card-refined rounded-2xl p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{t.scalesTitle}</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{t.scalesNote}</p>
      </div>

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
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="font-bold text-lg" style={{ color: current.color }}>
              {current.title}
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider border"
              style={{ color: current.color, borderColor: `${current.color}60` }}
            >
              {current.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {current.items.map((item, index) => (
            <motion.div
              key={item.name}
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
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
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
