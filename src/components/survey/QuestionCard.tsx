"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Question } from "@/data/surveySchema";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  value: string | number | string[] | undefined;
  onChange: (val: string | number | string[]) => void;
  onNext: () => void;
}

export function QuestionCard({
  question,
  value,
  onChange,
  onNext,
}: QuestionCardProps) {
  const [multipleSelected, setMultipleSelected] = useState<string[]>(
    Array.isArray(value) ? value : []
  );

  const handleChoiceClick = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setTimeout(() => {
        onNext();
      }, 200);
    },
    [onChange, onNext]
  );

  const handleMultipleToggle = useCallback(
    (optionValue: string) => {
      setMultipleSelected((prev) => {
        const newSelection = prev.includes(optionValue)
          ? prev.filter((v) => v !== optionValue)
          : [...prev, optionValue];
        onChange(newSelection);
        return newSelection;
      });
    },
    [onChange]
  );

  const handleScaleClick = useCallback(
    (num: number) => {
      onChange(num);
      setTimeout(() => {
        onNext();
      }, 200);
    },
    [onChange, onNext]
  );

  const handleMultipleSubmit = useCallback(() => {
    if (multipleSelected.length > 0) {
      onNext();
    }
  }, [multipleSelected, onNext]);

  return (
    <article
      className="w-full max-w-2xl mx-auto space-y-6 md:space-y-8"
      aria-labelledby={`question-${question.id}`}
    >
      {/* Question Title */}
      <motion.h2
        id={`question-${question.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl font-light text-center leading-snug px-2 text-balance"
      >
        {question.text}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        {/* TYPE: SINGLE CHOICE */}
        {question.type === "choice" && question.options && (
          <fieldset className="border-0">
            <legend className="sr-only">{question.text}</legend>
            <div className="grid grid-cols-1 gap-3 pb-8" role="radiogroup">
              {question.options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleChoiceClick(opt.value)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    className={cn(
                      "w-full p-4 md:p-5 rounded-xl text-left transition-all duration-200 border relative overflow-hidden group",
                      "touch-manipulation active:scale-[0.98]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isSelected
                        ? "bg-white text-slate-900 border-white shadow-lg font-medium"
                        : "bg-white/5 border-white/10 text-slate-100 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base md:text-lg leading-snug">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* TYPE: MULTIPLE CHOICE */}
        {question.type === "multiple" && question.options && (
          <fieldset className="border-0">
            <legend className="sr-only">{question.text}</legend>
            <div className="space-y-3 pb-4">
              {question.options.map((opt) => {
                const isSelected = multipleSelected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleMultipleToggle(opt.value)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    className={cn(
                      "w-full p-4 md:p-5 rounded-xl text-left transition-all duration-200 border relative overflow-hidden",
                      "touch-manipulation active:scale-[0.98]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isSelected
                        ? "bg-blue-500/20 text-white border-blue-500/50"
                        : "bg-white/5 border-white/10 text-slate-100 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-white/30"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-base md:text-lg leading-snug">
                        {opt.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Submit button for multiple choice */}
            <div className="pt-4">
              <button
                onClick={handleMultipleSubmit}
                disabled={multipleSelected.length === 0}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  multipleSelected.length > 0
                    ? "bg-white text-slate-900 hover:bg-blue-50"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                )}
              >
                Continuer
                {multipleSelected.length > 0 && (
                  <span className="ml-2 text-sm opacity-60">
                    ({multipleSelected.length} selection
                    {multipleSelected.length > 1 ? "s" : ""})
                  </span>
                )}
              </button>
            </div>
          </fieldset>
        )}

        {/* TYPE: SCALE (LIKERT 1-5) */}
        {question.type === "scale" && (
          <fieldset className="border-0">
            <legend className="sr-only">
              {question.text} - Echelle de 1 a 5
            </legend>
            <div className="space-y-8 py-4 md:py-8">
              {/* Scale Labels */}
              <div
                className="flex justify-between text-xs md:text-sm text-muted-foreground px-1 font-medium"
                aria-hidden="true"
              >
                <span className="max-w-[40%] text-left">{question.minLabel}</span>
                <span className="max-w-[40%] text-right">{question.maxLabel}</span>
              </div>

              {/* Scale Buttons */}
              <div
                className="flex justify-between items-center gap-2 md:gap-4 px-1"
                role="radiogroup"
                aria-label={`Echelle de 1 (${question.minLabel}) a 5 (${question.maxLabel})`}
              >
                {[1, 2, 3, 4, 5].map((num) => {
                  const isSelected = value === num;
                  return (
                    <button
                      key={num}
                      onClick={() => handleScaleClick(num)}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${num} sur 5${num === 1 ? ` - ${question.minLabel}` : ""}${num === 5 ? ` - ${question.maxLabel}` : ""}`}
                      tabIndex={0}
                      className={cn(
                        "flex-1 aspect-square max-w-[60px] md:max-w-[80px] rounded-full flex items-center justify-center",
                        "text-lg md:text-2xl font-medium transition-all duration-200 border",
                        "touch-manipulation active:scale-90",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isSelected
                          ? "bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-110 z-10"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <p
                className="text-center text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-widest"
                aria-hidden="true"
              >
                Selectionnez une valeur
              </p>
            </div>
          </fieldset>
        )}
      </motion.div>
    </article>
  );
}
