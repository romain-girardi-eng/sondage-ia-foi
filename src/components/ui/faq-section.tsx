"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/lib";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionProps {
  faqs?: FAQItem[];
}

export default function FAQSection({ faqs: customFaqs }: FAQSectionProps) {
  const { t, language } = useLanguage();
  const spiralRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");

  // Spiral configuration - simplified for production
  const cfg = useMemo(() => ({
    points: 600,
    dotRadius: 1.5,
    duration: 4.0,
    color: "#60a5fa", // blue-400
    gradient: "ocean" as "none" | "ocean" | "spiritual",
    pulseEffect: true,
    opacityMin: 0.2,
    opacityMax: 0.7,
    sizeMin: 0.5,
    sizeMax: 1.3,
  }), []);

  // Gradient presets
  const gradients: Record<string, string[]> = useMemo(
    () => ({
      none: [],
      ocean: ["#3b82f6", "#06b6d4", "#8b5cf6"], // blue-500, cyan-500, violet-500
      spiritual: ["#8b5cf6", "#ec4899", "#f59e0b"], // violet, pink, amber
    }),
    []
  );

  // Generate spiral SVG
  useEffect(() => {
    if (!spiralRef.current) return;

    const SIZE = 560;
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
    const N = cfg.points;
    const DOT = cfg.dotRadius;
    const CENTER = SIZE / 2;
    const PADDING = 4;
    const MAX_R = CENTER - PADDING - DOT;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", String(SIZE));
    svg.setAttribute("height", String(SIZE));
    svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);

    // Gradient
    if (cfg.gradient !== "none") {
      const defs = document.createElementNS(svgNS, "defs");
      const g = document.createElementNS(svgNS, "linearGradient");
      g.setAttribute("id", "spiralGradient");
      g.setAttribute("gradientUnits", "userSpaceOnUse");
      g.setAttribute("x1", "0%");
      g.setAttribute("y1", "0%");
      g.setAttribute("x2", "100%");
      g.setAttribute("y2", "100%");
      gradients[cfg.gradient]?.forEach((color, idx, arr) => {
        const stop = document.createElementNS(svgNS, "stop");
        stop.setAttribute("offset", `${(idx * 100) / (arr.length - 1)}%`);
        stop.setAttribute("stop-color", color);
        g.appendChild(stop);
      });
      defs.appendChild(g);
      svg.appendChild(defs);
    }

    for (let i = 0; i < N; i++) {
      const idx = i + 0.5;
      const frac = idx / N;
      const r = Math.sqrt(frac) * MAX_R;
      const theta = idx * GOLDEN_ANGLE;
      const x = CENTER + r * Math.cos(theta);
      const y = CENTER + r * Math.sin(theta);

      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", x.toFixed(3));
      c.setAttribute("cy", y.toFixed(3));
      c.setAttribute("r", String(DOT));
      c.setAttribute("fill", cfg.gradient === "none" ? cfg.color : "url(#spiralGradient)");
      c.setAttribute("opacity", "0.5");

      if (cfg.pulseEffect) {
        const animR = document.createElementNS(svgNS, "animate");
        animR.setAttribute("attributeName", "r");
        animR.setAttribute("values", `${DOT * cfg.sizeMin};${DOT * cfg.sizeMax};${DOT * cfg.sizeMin}`);
        animR.setAttribute("dur", `${cfg.duration}s`);
        animR.setAttribute("begin", `${(frac * cfg.duration).toFixed(3)}s`);
        animR.setAttribute("repeatCount", "indefinite");
        animR.setAttribute("calcMode", "spline");
        animR.setAttribute("keySplines", "0.4 0 0.6 1;0.4 0 0.6 1");
        c.appendChild(animR);

        const animO = document.createElementNS(svgNS, "animate");
        animO.setAttribute("attributeName", "opacity");
        animO.setAttribute("values", `${cfg.opacityMin};${cfg.opacityMax};${cfg.opacityMin}`);
        animO.setAttribute("dur", `${cfg.duration}s`);
        animO.setAttribute("begin", `${(frac * cfg.duration).toFixed(3)}s`);
        animO.setAttribute("repeatCount", "indefinite");
        animO.setAttribute("calcMode", "spline");
        animO.setAttribute("keySplines", "0.4 0 0.6 1;0.4 0 0.6 1");
        c.appendChild(animO);
      }

      svg.appendChild(c);
    }

    spiralRef.current.innerHTML = "";
    spiralRef.current.appendChild(svg);
  }, [cfg, gradients]);

  // FAQ content with translations
  const faqContent: Record<string, FAQItem[]> = {
    fr: [
      {
        q: "Pourquoi cette étude ?",
        a: "L'intelligence artificielle transforme silencieusement les pratiques religieuses, de la rédaction de sermons à la prière assistée. Cette recherche académique vise à cartographier ces usages et comprendre les enjeux éthiques qu'ils soulèvent pour les communautés chrétiennes.",
      },
      {
        q: "Mes réponses sont-elles anonymes ?",
        a: "Oui, totalement. Aucune donnée personnelle identifiante (nom, email, adresse IP) n'est enregistrée. Les réponses sont agrégées uniquement à des fins statistiques, dans le respect du RGPD.",
      },
      {
        q: "Combien de temps dure le sondage ?",
        a: "Entre 3 et 5 minutes selon votre profil. Le nombre de questions varie : les membres du clergé répondent à des questions supplémentaires sur leur ministère.",
      },
      {
        q: "Qui peut participer ?",
        a: "Toute personne se reconnaissant dans la foi chrétienne, quelle que soit sa dénomination (catholique, protestant, orthodoxe, évangélique) et son niveau d'engagement (clergé, laïc engagé, pratiquant occasionnel).",
      },
      {
        q: "Comment mes données seront-elles utilisées ?",
        a: "Les résultats seront publiés sous forme agrégée dans des publications académiques et présentés lors de conférences. Aucune réponse individuelle ne sera jamais divulguée.",
      },
      {
        q: "Qu'est-ce que le score CRS-5 ?",
        a: "Le CRS-5 (Centrality of Religiosity Scale) est une échelle scientifique validée par Huber & Huber (2012) qui mesure 5 dimensions de la religiosité : intellect, idéologie, pratique publique, pratique privée et expérience spirituelle.",
      },
      {
        q: "Qu'est-ce que l'indice de résistance spirituelle ?",
        a: "C'est un indicateur original de cette étude qui mesure la différence entre votre usage général de l'IA et votre usage spirituel. Un indice positif suggère une réticence spécifique à utiliser l'IA pour des tâches spirituelles.",
      },
      {
        q: "Puis-je voir les résultats ?",
        a: "Oui ! À la fin du sondage, vous recevez un profil personnalisé avec vos scores et votre typologie. Vous pouvez ensuite consulter les résultats agrégés de l'ensemble des participants.",
      },
    ],
    en: [
      {
        q: "Why this study?",
        a: "Artificial intelligence is silently transforming religious practices, from sermon writing to AI-assisted prayer. This academic research aims to map these uses and understand the ethical issues they raise for Christian communities.",
      },
      {
        q: "Are my responses anonymous?",
        a: "Yes, completely. No personally identifiable data (name, email, IP address) is recorded. Responses are aggregated solely for statistical purposes, in compliance with GDPR.",
      },
      {
        q: "How long does the survey take?",
        a: "Between 3 and 5 minutes depending on your profile. The number of questions varies: clergy members answer additional questions about their ministry.",
      },
      {
        q: "Who can participate?",
        a: "Anyone who identifies with the Christian faith, regardless of denomination (Catholic, Protestant, Orthodox, Evangelical) and level of engagement (clergy, committed layperson, occasional practitioner).",
      },
      {
        q: "How will my data be used?",
        a: "Results will be published in aggregated form in academic publications and presented at conferences. No individual responses will ever be disclosed.",
      },
      {
        q: "What is the CRS-5 score?",
        a: "The CRS-5 (Centrality of Religiosity Scale) is a scientifically validated scale by Huber & Huber (2012) that measures 5 dimensions of religiosity: intellect, ideology, public practice, private practice, and spiritual experience.",
      },
      {
        q: "What is the spiritual resistance index?",
        a: "It's an original indicator from this study that measures the difference between your general AI usage and your spiritual usage. A positive index suggests a specific reluctance to use AI for spiritual tasks.",
      },
      {
        q: "Can I see the results?",
        a: "Yes! At the end of the survey, you receive a personalized profile with your scores and typology. You can then view the aggregated results from all participants.",
      },
    ],
  };

  const faqs = customFaqs || faqContent[language];
  const title = t("faq.title");
  const subtitle = t("faq.subtitle");
  const searchPlaceholder = t("faq.searchPlaceholder");
  const noResults = t("faq.noResults");

  const filtered = query
    ? faqs.filter(({ q, a }) => (q + a).toLowerCase().includes(query.toLowerCase()))
    : faqs;

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white bg-background">
      {/* Background Spiral */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20 [mask-image:radial-gradient(circle_at_center,rgba(255,255,255,1),rgba(255,255,255,0.1)_60%,transparent_75%)]"
        style={{ mixBlendMode: "screen" }}
      >
        <div ref={spiralRef} />
      </div>

      {/* Layout */}
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-white/20 pb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-blue-200">
              {title}
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full md:w-56 rounded-xl border border-white/20 bg-white/5 px-4 text-sm outline-none transition focus:border-blue-500/60 focus:bg-white/10 placeholder:text-muted-foreground"
            />
          </div>
        </header>

        {/* Content */}
        <section className="relative">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((item, i) => (
              <FAQItemCard key={i} q={item.q} a={item.a} index={i + 1} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {noResults}
            </p>
          )}
        </section>

      </div>
    </div>
  );
}

function FAQItemCard({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 transition hover:border-white/20 hover:bg-white/[0.07]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <div className="flex items-baseline gap-3">
          <span className="text-xs text-blue-400/60 font-mono">{String(index).padStart(2, "0")}</span>
          <h3 className="text-base md:text-lg font-semibold leading-tight text-white">{q}</h3>
        </div>
        <span className="ml-4 text-white/40 transition group-hover:text-white text-xl font-light">
          {open ? "-" : "+"}
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${open ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}
