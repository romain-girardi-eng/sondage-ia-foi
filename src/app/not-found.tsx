"use client";

import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20">
          <FileQuestion className="w-10 h-10 text-blue-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <h2 className="text-2xl font-semibold text-white/90">
            {t("notFound.title")}
          </h2>
          <p className="text-white/60">
            {t("notFound.description")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
          >
            <Home className="w-4 h-4" />
            {t("notFound.home")}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("notFound.back")}
          </button>
        </div>
      </div>
    </div>
  );
}
