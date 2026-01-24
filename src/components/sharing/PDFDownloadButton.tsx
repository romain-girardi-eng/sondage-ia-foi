"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { downloadPDFReport } from "@/lib/pdf/generateReport";
import { cn } from "@/lib/utils";

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
  const [isGenerating, setIsGenerating] = useState(false);

  const translations = {
    fr: {
      download: "Télécharger mon rapport PDF",
      generating: "Génération...",
    },
    en: {
      download: "Download my PDF report",
      generating: "Generating...",
    },
  };

  const t = translations[language];

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Small delay for UX feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      downloadPDFReport({
        language,
        anonymousId,
        completedAt,
        answers,
        profile,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={cn(
        "flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all",
        "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500",
        "text-white shadow-lg shadow-blue-500/25",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
    >
      {isGenerating ? (
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
      )}
    </button>
  );
}
