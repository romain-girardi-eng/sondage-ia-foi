"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionProps {
  faqs?: FAQItem[];
  title?: string;
  subtitle?: string;
}

export default function FAQSection({
  faqs: customFaqs,
  title = "Questions Frequentes",
  subtitle = "Tout ce que vous devez savoir sur cette etude",
}: FAQSectionProps) {
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

  // Default FAQ content for the survey
  const defaultFaqs: FAQItem[] = [
    {
      q: "Pourquoi cette etude ?",
      a: "L'intelligence artificielle transforme silencieusement les pratiques religieuses, de la redaction de sermons a la priere assistee. Cette recherche academique vise a cartographier ces usages et comprendre les enjeux ethiques qu'ils soulevent pour les communautes chretiennes.",
    },
    {
      q: "Mes reponses sont-elles anonymes ?",
      a: "Oui, totalement. Aucune donnee personnelle identifiante (nom, email, adresse IP) n'est enregistree. Les reponses sont agregees uniquement a des fins statistiques, dans le respect du RGPD.",
    },
    {
      q: "Combien de temps dure le sondage ?",
      a: "Entre 3 et 5 minutes selon votre profil. Le nombre de questions varie : les membres du clerge repondent a des questions supplementaires sur leur ministere.",
    },
    {
      q: "Qui peut participer ?",
      a: "Toute personne se reconnaissant dans la foi chretienne, quelle que soit sa denomination (catholique, protestant, orthodoxe, evangelique) et son niveau d'engagement (clerge, laic engage, pratiquant occasionnel).",
    },
    {
      q: "Comment mes donnees seront-elles utilisees ?",
      a: "Les resultats seront publies sous forme agregee dans des publications academiques et presentes lors de conferences. Aucune reponse individuelle ne sera jamais divulguee.",
    },
    {
      q: "Qu'est-ce que le score CRS-5 ?",
      a: "Le CRS-5 (Centrality of Religiosity Scale) est une echelle scientifique validee par Huber & Huber (2012) qui mesure 5 dimensions de la religiosite : intellect, ideologie, pratique publique, pratique privee et experience spirituelle.",
    },
    {
      q: "Qu'est-ce que l'indice de resistance spirituelle ?",
      a: "C'est un indicateur original de cette etude qui mesure la difference entre votre usage general de l'IA et votre usage spirituel. Un indice positif suggere une reticence specifique a utiliser l'IA pour des taches spirituelles.",
    },
    {
      q: "Puis-je voir les resultats ?",
      a: "Oui ! A la fin du sondage, vous recevez un profil personnalise avec vos scores et votre typologie. Vous pouvez ensuite consulter les resultats agreges de l'ensemble des participants.",
    },
  ];

  const faqs = customFaqs || defaultFaqs;

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
              placeholder="Rechercher..."
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
              Aucune question ne correspond a votre recherche.
            </p>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/10 pt-6 text-xs text-muted-foreground/50 text-center">
          Etude academique sur l&apos;IA et la vie spirituelle - {new Date().getFullYear()}
        </footer>
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
