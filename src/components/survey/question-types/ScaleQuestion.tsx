"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { cn, useLanguage } from "@/lib";
import { type ScaleQuestionProps } from "./types";

export function ScaleQuestion({
  value,
  onChange,
  onNext,
  questionText,
  minLabel,
  maxLabel,
  language,
}: ScaleQuestionProps) {
  const { t } = useLanguage();

  const handleScaleClick = useCallback(
    (num: number) => {
      onChange(num);
      setTimeout(() => {
        onNext();
      }, 250);
    },
    [onChange, onNext]
  );

  return (
    <fieldset className="border-0">
      <legend className="sr-only">
        {questionText} - {t("survey.scaleFrom", { min: minLabel || "1", max: maxLabel || "5" })}
      </legend>
      <div className="space-y-8 py-4 md:py-8">
        {/* Scale Labels */}
        <div
          className="flex justify-between text-xs md:text-sm text-muted-foreground px-1 font-medium"
          aria-hidden="true"
        >
          <span className="max-w-[40%] text-left opacity-70">{minLabel}</span>
          <span className="max-w-[40%] text-right opacity-70">{maxLabel}</span>
        </div>

        {/* Scale Buttons */}
        <div
          className="flex justify-between items-center gap-3 md:gap-4 px-1"
          role="radiogroup"
          aria-label={t("survey.scaleFrom", { min: minLabel || "1", max: maxLabel || "5" })}
        >
          {[1, 2, 3, 4, 5].map((num, idx) => {
            const isSelected = value === num;
            return (
              <motion.button
                key={num}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * idx, duration: 0.3 }}
                onClick={() => handleScaleClick(num)}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${num} ${language === 'fr' ? 'sur' : 'of'} 5${num === 1 ? ` - ${minLabel}` : ""}${num === 5 ? ` - ${maxLabel}` : ""}`}
                tabIndex={0}
                className={cn(
                  "flex-1 aspect-square max-w-[56px] md:max-w-[72px] rounded-2xl flex items-center justify-center",
                  "text-lg md:text-2xl font-medium transition-all duration-300",
                  "touch-manipulation active:scale-90",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-lg scale-110 z-10"
                    : "glass-card-refined text-foreground hover:scale-105"
                )}
              >
                {num}
              </motion.button>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[10px] md:text-xs text-muted-foreground/40 uppercase tracking-widest"
          aria-hidden="true"
        >
          {t("survey.selectValue")}
        </motion.p>
      </div>
    </fieldset>
  );
}
