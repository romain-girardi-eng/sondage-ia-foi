"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Beaker,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { translations } from "@/lib/i18n/translations";
import { AnimatedBackground, Spotlight } from "@/components/ui";
import {
  DimensionWheel,
  ProfileGallery,
  ScaleVisualizer,
  FormulaDisplay,
  ConfessionalTree,
} from "@/components/methodology";
import { getLocalizedPath } from "@/lib";

type Language = "fr" | "en";

export default function MethodologyPage() {
  const params = useParams();
  const lang = (params.lang as Language) || "fr";
  const t = translations[lang].methodologyPage;
  const homeLink = getLocalizedPath(lang);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <AnimatedBackground variant="default" showGrid showOrbs>
      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href={homeLink}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToSurvey}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Beaker className="w-4 h-4" />
              <span>{t.badge}</span>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-24">
          {/* Hero Section */}
          <motion.section {...fadeInUp} className="text-center relative">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#3b82f6" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-refined text-blue-300 text-xs font-medium uppercase tracking-wider mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.badge}</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-gradient-animated">{t.title}</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              {t.heroDescription}
            </p>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-muted-foreground/50"
            >
              <ChevronDown className="w-6 h-6 mx-auto" />
              <span className="text-xs">{t.scrollToExplore}</span>
            </motion.div>
          </motion.section>

          {/* Scientific Context */}
          <motion.section {...fadeInUp} className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground text-center">
              {t.scientificContextTitle}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* What it is */}
              <div className="glass-card-refined rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-foreground">{t.whatItIs}</h3>
                </div>
                <ul className="space-y-3">
                  {t.whatItIsPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What it is not */}
              <div className="glass-card-refined rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="font-bold text-foreground">{t.whatItIsNot}</h3>
                </div>
                <ul className="space-y-3">
                  {t.whatItIsNotPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Validated Scales */}
          <motion.section {...fadeInUp}>
            <ScaleVisualizer translations={t} />
          </motion.section>

          {/* 7 Dimensions Wheel */}
          <motion.section {...fadeInUp} className="glass-card-refined rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              {t.dimensionsTitle}
            </h2>
            <DimensionWheel translations={t} />
          </motion.section>

          {/* 8 Profiles Gallery */}
          <motion.section {...fadeInUp}>
            <ProfileGallery translations={t} />
          </motion.section>

          {/* Statistical Methods */}
          <motion.section {...fadeInUp}>
            <FormulaDisplay translations={t} />
          </motion.section>

          {/* Transparency */}
          <motion.section {...fadeInUp} className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground text-center">
              {t.transparencyTitle}
            </h2>

            {/* Trade-offs Table */}
            <div className="glass-card-refined rounded-2xl p-6 overflow-x-auto">
              <h3 className="font-bold text-foreground mb-4">{t.tradeoffsTitle}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-white/10">
                    <th className="pb-3 pr-4">Aspect</th>
                    <th className="pb-3 pr-4 text-emerald-400">Engagement</th>
                    <th className="pb-3 text-blue-400">Rigueur</th>
                  </tr>
                </thead>
                <tbody>
                  {t.tradeoffs.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-foreground">{row.aspect}</td>
                      <td className="py-3 pr-4 text-emerald-300">{row.engagement}</td>
                      <td className="py-3 text-blue-300">{row.rigor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Limitations */}
            <div className="glass-card-refined rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-foreground">{t.limitationsTitle}</h3>
              </div>
              <ul className="space-y-2">
                {t.limitations.map((lim, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-400">•</span>
                    {lim}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suitable for / Not suitable for */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card-refined rounded-xl p-5">
                <h4 className="font-bold text-emerald-400 mb-3">{t.suitableFor}</h4>
                <ul className="space-y-2">
                  {t.suitableForPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card-refined rounded-xl p-5">
                <h4 className="font-bold text-amber-400 mb-3">{t.notSuitableFor}</h4>
                <ul className="space-y-2">
                  {t.notSuitableForPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Confessional Structure */}
          <motion.section {...fadeInUp}>
            <ConfessionalTree translations={t} />
          </motion.section>

          {/* Research Hypotheses */}
          <motion.section {...fadeInUp} className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">{t.hypothesesTitle}</h2>
              <p className="text-muted-foreground">{t.hypothesesDesc}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {t.hypotheses.map((hyp, i) => (
                <motion.div
                  key={hyp.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="glass-card-refined rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold shrink-0">
                    {hyp.id}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{hyp.text}</p>
                    <span className="text-xs text-muted-foreground/60">{t.statusToVerify}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Citations */}
          <motion.section {...fadeInUp} className="glass-card-refined rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-foreground">{t.citationsTitle}</h2>
            </div>
            <ul className="space-y-3">
              {t.citations.map((citation, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground pl-4 border-l-2 border-blue-500/30 hover:border-blue-500 transition-colors"
                >
                  {citation}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Back to survey CTA */}
          <motion.div {...fadeInUp} className="text-center">
              <Link
                href={homeLink}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
              {t.backToSurvey}
            </Link>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
