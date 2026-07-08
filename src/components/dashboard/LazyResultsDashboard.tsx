"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib";

// Rendered by next/dynamic while the ResultsDashboard chunk loads. This still
// sits inside the app's LanguageProvider (mounted in the root layout), so
// useLanguage() resolves normally here.
function DashboardLoadingFallback() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
        <p className="text-white/60">{t("dashboard.loading")}</p>
      </div>
    </div>
  );
}

const ResultsDashboard = dynamic(
  () => import("./ResultsDashboard").then((mod) => mod.ResultsDashboard),
  {
    loading: () => <DashboardLoadingFallback />,
    ssr: false,
  }
);

export { ResultsDashboard as LazyResultsDashboard };
