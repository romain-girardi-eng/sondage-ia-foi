"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ResultsDashboard = dynamic(
  () => import("./ResultsDashboard").then((mod) => mod.ResultsDashboard),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
          <p className="text-white/60">Chargement des résultats...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export { ResultsDashboard as LazyResultsDashboard };
