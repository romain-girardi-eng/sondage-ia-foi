"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib";
import { Check, ChevronRight } from "lucide-react";
import { type ChoiceQuestionProps } from "./types";

export function ChoiceQuestion({
  question,
  value,
  onChange,
  onNext,
  questionText,
  getOptionLabel,
}: ChoiceQuestionProps) {

  const handleChoiceClick = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setTimeout(() => {
        onNext();
      }, 250);
    },
    [onChange, onNext]
  );

  if (!question.options) return null;

  return (
    <fieldset className="border-0">
      <legend className="sr-only">{questionText}</legend>
      <div className="grid grid-cols-1 gap-3 pb-8" role="radiogroup">
        {question.options.map((opt, idx) => {
          const isSelected = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.4 }}
              onClick={() => handleChoiceClick(opt.value)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              className={cn(
                "group w-full p-4 md:p-5 rounded-2xl text-left transition-all duration-300 border relative overflow-hidden",
                "touch-manipulation active:scale-[0.98]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg font-medium"
                  : "glass-card-refined text-foreground"
              )}
            >
              {/* Hover glow effect */}
              {!isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}

              <div className="relative flex items-center justify-between gap-4">
                <span className="text-base md:text-lg leading-snug">
                  {getOptionLabel(opt)}
                </span>
                {isSelected ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}
