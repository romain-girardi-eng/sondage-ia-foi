"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Database, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurveyIntroProps {
  onStart: () => void;
}

export function SurveyIntro({ onStart }: SurveyIntroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 max-w-4xl mx-auto space-y-10 md:space-y-12 py-12">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium uppercase tracking-wider">
          <Database className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Etude Scientifique 2026</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-blue-200">
            Intelligence Artificielle
          </span>
          <br />
          <span className="text-blue-400">&</span>{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-blue-200">
            Vie Spirituelle
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
          De la redaction de sermons a la priere assistee, l&apos;IA transforme
          silencieusement les pratiques religieuses. Cette enquete academique
          vise a cartographier ces usages et a comprendre les enjeux ethiques
          qu&apos;ils soulevent.
        </p>
      </motion.header>

      {/* Privacy Card */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden"
        aria-labelledby="privacy-heading"
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
          aria-hidden="true"
        />

        <div className="flex items-start gap-5 relative z-10">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-4">
            <h2
              id="privacy-heading"
              className="font-semibold text-white text-lg"
            >
              Protocole de Confidentialite
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Votre participation est essentielle pour la recherche. Nous
              garantissons la protection de vos droits :
            </p>
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-start gap-3">
                <Lock
                  className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-white">Anonymat total :</strong>{" "}
                  Aucune donnee personnelle identifiante (nom, email, IP) n&apos;est
                  enregistree.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Database
                  className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-white">Usage academique :</strong> Les
                  reponses sont agregees uniquement a des fins statistiques.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-4"
      >
        <button
          onClick={onStart}
          className={cn(
            "group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg",
            "hover:bg-blue-50 hover:scale-105 active:scale-[0.98] transition-all duration-300",
            "shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]",
            "flex items-center gap-3 mx-auto",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          )}
        >
          <span>J&apos;accepte et je commence</span>
          <ArrowRight
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
          />
        </button>

        <p className="text-xs text-muted-foreground/50 flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Temps estime : 3 a 5 minutes</span>
        </p>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-muted-foreground/30 max-w-md"
      >
        En cliquant sur &quot;J&apos;accepte&quot;, vous consentez a participer a cette etude
        dans le respect du RGPD.
      </motion.footer>
    </div>
  );
}
