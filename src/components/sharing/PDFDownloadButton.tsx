"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FileText, Download, Loader2 } from "lucide-react";
import { cn, useLanguage } from "@/lib";

// Dynamically import PDF components to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

// Dynamically import the document component
const ReportDocument = dynamic(
  () => import("@/lib/pdf/generateReport").then((mod) => mod.ReportDocument),
  { ssr: false }
);

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
  const [spectrum, setSpectrum] = useState<any>(null);

  const filename = language === "fr"
    ? `rapport-ia-foi-${anonymousId.slice(0, 8)}.pdf`
    : `ai-faith-report-${anonymousId.slice(0, 8)}.pdf`;

  // Calculate spectrum on client side
  useEffect(() => {
    setIsClient(true);
    // Dynamically import the scoring function
    import("@/lib/scoring/profiles").then(({ calculateProfileSpectrum }) => {
      const calculatedSpectrum = calculateProfileSpectrum(answers as any);
      setSpectrum(calculatedSpectrum);
    });
  }, [answers]);

  const reportData = {
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
        {t.preparing}
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
            {t.generating}
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            {t.download}
            <Download className="w-4 h-4" />
          </>
        )
      }
    </PDFDownloadLink>
  );
}
