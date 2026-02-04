"use client";

import { motion } from "framer-motion";
import { cn, useLanguage } from "@/lib";
import { type TextQuestionProps } from "./types";

export function TextQuestion({
  question,
  value,
  onChange,
  onNext,
}: TextQuestionProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 pb-4">
      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || t("survey.textPlaceholder")}
        rows={5}
        className={cn(
          "w-full p-4 md:p-5 rounded-2xl resize-none transition-all duration-300",
          "bg-input border border-border text-foreground placeholder:text-muted-foreground/50",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "focus:bg-accent"
        )}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={onNext}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 relative overflow-hidden",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            "bg-primary text-primary-foreground hover:shadow-lg btn-glow"
          )}
        >
          <span className="relative z-10">
            {t("survey.continue")}
          </span>
          <span className="absolute inset-0 animate-shimmer" />
        </button>
        <p className="text-center text-xs text-muted-foreground/60 mt-3">
          {t("survey.optionalQuestion")}
        </p>
      </motion.div>
    </div>
  );
}
