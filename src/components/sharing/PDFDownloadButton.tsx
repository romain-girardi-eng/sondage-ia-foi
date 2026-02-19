"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText, Download, Loader2 } from "lucide-react";
import { cn, useLanguage } from "@/lib";
import type { ProfileSpectrum } from "@/lib/scoring/types";
import { ReportDocument, type ReportData } from "@/lib/pdf/reportDocument";

interface PDFDownloadButtonProps {
  language: "fr" | "en";
  anonymousId: string;
  completedAt: string;
  answers: Record<string, string | string[] | number>;
  profile: {
    religiosityScore: number;
    iaComfortScore: number;
    theologicalOrientation: string;
  };
  className?: string;
}

export function PDFDownloadButton({
  language,
  anonymousId,
  completedAt,
  answers,
  profile,
  className,
}: PDFDownloadButtonProps) {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [spectrum, setSpectrum] = useState<ProfileSpectrum | null>(null);

  const filename = language === "fr"
    ? `rapport-ia-foi-${anonymousId.slice(0, 8)}.pdf`
    : `ai-faith-report-${anonymousId.slice(0, 8)}.pdf`;

  // Calculate spectrum on client side
  useEffect(() => {
    setIsClient(true);
    // Dynamically import the scoring function
    import("@/lib/scoring/profiles").then(({ calculateProfileSpectrum }) => {
      const calculatedSpectrum = calculateProfileSpectrum(answers as Record<string, string | number | string[]>);
      setSpectrum(calculatedSpectrum);
    });
  }, [answers]);

  const reportData: ReportData = {
    language,
    anonymousId,
    completedAt,
    answers,
    profile,
  };

  if (!isClient || !spectrum) {
    return (
      <button
        disabled
        className={cn(
          "flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all",
          "bg-gradient-to-r from-blue-600 to-purple-600",
          "text-white shadow-lg shadow-blue-500/25",
          "opacity-70 cursor-not-allowed",
          className
        )}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        {t("pdf.preparing")}
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ReportDocument data={reportData} spectrum={spectrum} />}
      fileName={filename}
      className={cn(
        "flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all",
        "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500",
        "text-white shadow-lg shadow-blue-500/25",
        className
      )}
    >
      {({ loading }) =>
        loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t("pdf.generating")}
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            {t("pdf.download")}
            <Download className="w-4 h-4" />
          </>
        )
      }
    </PDFDownloadLink>
  );
}
