"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { cn, useLanguage } from "@/lib";
import type { PrimaryProfile } from "@/lib/scoring/types";
import { getArchetypeById, profileIdToSlug } from "@/lib/profil/archetypes";
import {
  getProfileShareURL,
  getProfileShareText,
  buildProfileShareLinks,
} from "@/lib/profil/share";

interface ProfileShareProps {
  profileId: PrimaryProfile;
  className?: string;
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.715zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function ProfileShare({ profileId, className }: ProfileShareProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const archetype = getArchetypeById(profileId);
  const slug = profileIdToSlug(profileId);
  const url = getProfileShareURL(slug);
  const text = getProfileShareText(archetype.title, url, language);
  const links = buildProfileShareLinks(text, url);

  const openExternal = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleWhatsApp = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ text });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    openExternal(links.whatsapp);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8",
        className,
      )}
    >
      <h3 className="text-center text-lg font-bold text-foreground md:text-xl">
        {t("profileShare.title")}
      </h3>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        {t("profileShare.subtitle")}
      </p>

      {/* WhatsApp - primary */}
      <button
        onClick={handleWhatsApp}
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-bold text-[#05300f] shadow-lg shadow-[#25D366]/20 transition-transform hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
      >
        <WhatsAppGlyph />
        {t("profileShare.whatsapp")}
      </button>

      {/* Secondary channels */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <button
          onClick={handleCopy}
          aria-label={t("profileShare.copyLink")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            copied
              ? "border-green-500/30 bg-green-500/20 text-green-400"
              : "border-white/10 bg-white/5 text-foreground hover:bg-white/10",
          )}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {copied ? t("profileShare.copied") : t("profileShare.copyLink")}
          </span>
        </button>

        <button
          onClick={() => openExternal(links.x)}
          aria-label={t("profileShare.shareOnX")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XGlyph />
          <span className="hidden sm:inline">X</span>
        </button>

        <button
          onClick={() => openExternal(links.facebook)}
          aria-label={t("profileShare.shareOnFacebook")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-[#4267B2]">
            <FacebookGlyph />
          </span>
          <span className="hidden sm:inline">Facebook</span>
        </button>
      </div>
    </motion.div>
  );
}
