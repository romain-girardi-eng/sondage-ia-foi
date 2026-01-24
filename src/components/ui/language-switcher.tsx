"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
      className={cn(
        "fixed top-4 right-4 z-50",
        "flex items-center gap-2 px-3 py-2 rounded-full",
        "glass-card-refined hover:border-white/30",
        "transition-all duration-300 hover:scale-105",
        "text-sm font-medium text-white/80 hover:text-white",
        className
      )}
      aria-label={language === "fr" ? "Switch to English" : "Passer en français"}
    >
      {language === "fr" ? (
        <>
          {/* UK Flag */}
          <svg
            className="w-5 h-5 rounded-sm shadow-sm"
            viewBox="0 0 60 30"
            aria-hidden="true"
          >
            <clipPath id="a">
              <path d="M0 0v30h60V0z" />
            </clipPath>
            <clipPath id="b">
              <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
            </clipPath>
            <g clipPath="url(#a)">
              <path d="M0 0v30h60V0z" fill="#012169" />
              <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
              <path
                d="M0 0l60 30m0-30L0 30"
                clipPath="url(#b)"
                stroke="#C8102E"
                strokeWidth="4"
              />
              <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
              <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
            </g>
          </svg>
          <span className="hidden sm:inline">EN</span>
        </>
      ) : (
        <>
          {/* French Flag */}
          <svg
            className="w-5 h-5 rounded-sm shadow-sm"
            viewBox="0 0 30 20"
            aria-hidden="true"
          >
            <rect width="30" height="20" fill="#ED2939" />
            <rect width="20" height="20" fill="#fff" />
            <rect width="10" height="20" fill="#002395" />
          </svg>
          <span className="hidden sm:inline">FR</span>
        </>
      )}
    </motion.button>
  );
}
