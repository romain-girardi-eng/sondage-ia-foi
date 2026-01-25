"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            {t("errors.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("errors.description")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-all border border-border"
          >
            <RefreshCw className="w-4 h-4" />
            {t("errors.retry")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
          >
            <Home className="w-4 h-4" />
            {t("errors.goHome")}
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground/50">
            {t("errors.errorCode")} : {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
