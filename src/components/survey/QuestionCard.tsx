"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { type Question } from "@/data";
import { cn, useLanguage } from "@/lib";
import { Check, ChevronRight } from "lucide-react";

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
  const { t, tQuestion, tOption, tScale, language } = useLanguage();
  const multipleSelected = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value]
  );

  // Get translated question text (fall back to original if not found)
  const questionText = tQuestion(question.id) !== question.id
    ? tQuestion(question.id)
    : question.text;

  // Get translated option label
  const getOptionLabel = (opt: { value: string; label: string }) => {
    const translated = tOption(opt.value);
    return translated !== opt.value ? translated : opt.label;
  };

  // Get translated scale labels
  const getScaleLabel = (key: string | undefined, fallback: string | undefined) => {
    if (!key) return fallback;
    const translated = tScale(key);
    return translated !== key ? translated : fallback;
  };

  const handleChoiceClick = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setTimeout(() => {
        onNext();
      }, 250);
    },
    [onChange, onNext]
  );

  const handleMultipleToggle = useCallback(
    (optionValue: string) => {
      const newSelection = multipleSelected.includes(optionValue)
        ? multipleSelected.filter((v) => v !== optionValue)
        : [...multipleSelected, optionValue];
      onChange(newSelection);
    },
    [multipleSelected, onChange]
  );

  const handleScaleClick = useCallback(
    (num: number) => {
      onChange(num);
      setTimeout(() => {
        onNext();
      }, 250);
    },
    [onChange, onNext]
  );

  const handleMultipleSubmit = useCallback(() => {
    if (multipleSelected.length > 0) {
      onNext();
    }
  }, [multipleSelected, onNext]);

  // Get min/max labels for scale questions
  const minLabel = question.minLabelKey
    ? getScaleLabel(question.minLabelKey, question.minLabel)
    : question.minLabel;
  const maxLabel = question.maxLabelKey
    ? getScaleLabel(question.maxLabelKey, question.maxLabel)
    : question.maxLabel;

  return (
    <article
      className="w-full max-w-2xl mx-auto space-y-8 md:space-y-10"
      aria-labelledby={`question-${question.id}`}
    >
      {/* Question Title */}
      <motion.h2
        id={`question-${question.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-2xl md:text-4xl font-light text-center leading-snug px-2 text-balance text-gradient-animated"
      >
        {questionText}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        {/* TYPE: SINGLE CHOICE */}
        {question.type === "choice" && question.options && (
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
        )}

        {/* TYPE: MULTIPLE CHOICE */}
        {question.type === "multiple" && question.options && (
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
        )}

        {/* TYPE: SCALE (LIKERT 1-5) */}
        {question.type === "scale" && (
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
        )}

        {/* TYPE: TEXT (Open question) */}
        {question.type === "text" && (
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
        )}
      </motion.div>
    </article>
  );
}
