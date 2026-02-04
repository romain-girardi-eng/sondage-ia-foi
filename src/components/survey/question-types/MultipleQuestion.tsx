"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { cn, useLanguage } from "@/lib";
import { Check } from "lucide-react";
import { type MultipleQuestionProps } from "./types";

export function MultipleQuestion({
  question,
  onChange,
  onNext,
  questionText,
  getOptionLabel,
  multipleSelected,
}: MultipleQuestionProps) {
  const { t } = useLanguage();

  const handleMultipleToggle = useCallback(
    (optionValue: string) => {
      const newSelection = multipleSelected.includes(optionValue)
        ? multipleSelected.filter((v) => v !== optionValue)
        : [...multipleSelected, optionValue];
      onChange(newSelection);
    },
    [multipleSelected, onChange]
  );

  const handleMultipleSubmit = useCallback(() => {
    if (multipleSelected.length > 0) {
      onNext();
    }
  }, [multipleSelected, onNext]);

  if (!question.options) return null;

  return (
    <fieldset className="border-0">
      <legend className="sr-only">{questionText}</legend>
      <div className="space-y-3 pb-4">
        {question.options.map((opt, idx) => {
          const isSelected = multipleSelected.includes(opt.value);
          return (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.4 }}
              onClick={() => handleMultipleToggle(opt.value)}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              className={cn(
                "group w-full p-4 md:p-5 rounded-2xl text-left transition-all duration-300 border relative overflow-hidden",
                "touch-manipulation active:scale-[0.98]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? "bg-blue-500/20 text-foreground border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "glass-card-refined text-foreground"
              )}
            >
              <div className="relative flex items-center gap-4">
                <div
                  className={cn(
                    "shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                    isSelected
                      ? "bg-blue-500 border-blue-500 scale-110"
                      : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
                  )}
                >
                  <motion.div
                    initial={false}
                    animate={{ scale: isSelected ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                </div>
                <span className="text-base md:text-lg leading-snug">
                  {getOptionLabel(opt)}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Submit button for multiple choice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-6"
      >
        <button
          onClick={handleMultipleSubmit}
          disabled={multipleSelected.length === 0}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 relative overflow-hidden",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            multipleSelected.length > 0
              ? "bg-primary text-primary-foreground hover:shadow-lg btn-glow"
              : "bg-muted text-muted-foreground/50 cursor-not-allowed border border-border"
          )}
        >
          <span className="relative z-10">
            {t("survey.continue")}
            {multipleSelected.length > 0 && (
              <span className="ml-2 text-sm opacity-60">
                ({multipleSelected.length > 1
                  ? t("survey.selectionsPlural", { count: multipleSelected.length })
                  : t("survey.selections", { count: multipleSelected.length })})
              </span>
            )}
          </span>
          {multipleSelected.length > 0 && (
            <span className="absolute inset-0 animate-shimmer" />
          )}
        </button>
      </motion.div>
    </fieldset>
  );
}
