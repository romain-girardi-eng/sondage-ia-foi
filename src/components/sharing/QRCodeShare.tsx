"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Copy, Check, Share2 } from "lucide-react";
import { generateQRCodeDataURL, getSurveyShareURL } from "@/lib/qrcode/generateQR";
import { cn, useLanguage } from "@/lib";

interface QRCodeShareProps {
  language: "fr" | "en";
  className?: string;
}

export function QRCodeShare({ language, className }: QRCodeShareProps) {
  const { t } = useLanguage();
  const [qrCodeDataURL, setQRCodeDataURL] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const shareURL = getSurveyShareURL(language);

  useEffect(() => {
    generateQRCodeDataURL(shareURL, { width: 200 })
      .then(setQRCodeDataURL)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [shareURL]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement("a");
    link.href = qrCodeDataURL;
    link.download = `sondage-ia-foi-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("sharing.shareTitle"),
          text: t("sharing.shareDescription"),
          url: shareURL,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{t("sharing.title")}</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* QR Code */}
        <div className="bg-white rounded-xl p-3">
          {isLoading ? (
            <div className="w-[176px] h-[176px] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : qrCodeDataURL ? (
            <img
              src={qrCodeDataURL}
              alt="QR Code"
              className="w-44 h-44"
            />
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex-1 space-y-4">
          <p className="text-white/60 text-sm">{t("sharing.scanQR")}</p>

          <div className="space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">
              {t("sharing.orCopyLink")}
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  copied
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t("sharing.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t("sharing.copyLink")}
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                disabled={!qrCodeDataURL}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {t("sharing.download")}
              </button>

              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  {t("sharing.share")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
