"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib";
import { ThemeToggle } from "./theme-toggle";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isLocaleSegment = (segment?: string) =>
    segment === "fr" || segment === "en" || segment === "eng";

  const handleLanguageToggle = () => {
    const nextLanguage = language === "fr" ? "en" : "fr";
    setLanguage(nextLanguage);

    const pathSegments = pathname?.split("/").filter(Boolean) ?? [];

    if (nextLanguage === "en") {
      if (pathSegments.length === 0) {
        pathSegments.unshift("eng");
      } else if (isLocaleSegment(pathSegments[0])) {
        pathSegments[0] = "eng";
      } else {
        pathSegments.unshift("eng");
      }
    } else {
      if (isLocaleSegment(pathSegments[0])) {
        pathSegments.shift();
      }
    }

    const newPath = `/${pathSegments.join("/")}`;
    const search = searchParams?.toString();
    const destination = search ? `${newPath}?${search}` : newPath;

    router.push(destination, { scroll: false });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className={cn("fixed top-4 right-4 z-50 flex items-center gap-2", className)}
    >
      <ThemeToggle />
      <button
        onClick={handleLanguageToggle}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full",
          "glass-card-refined hover:border-white/20",
          "transition-all duration-300 hover:scale-105",
          "text-sm font-medium text-muted-foreground hover:text-foreground"
        )}
        aria-label={language === "fr" ? "Switch to English" : "Passer en français"}
      >
        <span>{language === "fr" ? "EN" : "FR"}</span>
      </button>
    </motion.div>
  );
}
