"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn, useLanguage } from "@/lib";
import { Check } from "lucide-react";
import { type MatrixQuestionProps } from "./types";

export function MatrixQuestion({
  question,
  onChange,
  onNext,
  questionText,
  matrixValue,
  getMatrixRowLabel,
  getMatrixColumnLabel,
}: MatrixQuestionProps) {
  const { t } = useLanguage();

  const handleMatrixCellClick = useCallback(
    (rowValue: string, columnValue: number) => {
      const newValue = { ...matrixValue, [rowValue]: columnValue };
      onChange(newValue);
    },
    [matrixValue, onChange]
  );

  const isMatrixComplete = useMemo(() => {
    if (question.type !== 'matrix' || !question.rows) return false;
    return question.rows.every(row => typeof matrixValue[row.value] === 'number');
  }, [question, matrixValue]);

  const handleMatrixSubmit = useCallback(() => {
    if (isMatrixComplete) {
      onNext();
    }
  }, [isMatrixComplete, onNext]);

  if (!question.rows || !question.columns) return null;

  const matrixRows = question.rows;
  const matrixCols = question.columns;

  return (
    <fieldset className="border-0">
      <legend className="sr-only">{questionText}</legend>
      <div className="space-y-4 pb-4">
        {/* Rows - each with labeled buttons */}
        {matrixRows.map((row, rowIdx) => {
          const selectedValue = matrixValue[row.value];
          return (
            <motion.div
              key={row.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * rowIdx, duration: 0.4 }}
              className="glass-card-refined rounded-2xl p-4 space-y-4"
            >
              {/* Row label */}
              <div className="text-base font-medium text-foreground">
                {getMatrixRowLabel(row)}
              </div>

              {/* Buttons with labels - same on mobile and desktop */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="radiogroup">
                {matrixCols.map((col) => {
                  const isSelected = selectedValue === col.value;
                  return (
                    <button
                      key={col.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleMatrixCellClick(row.value, col.value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-xl transition-all duration-200 min-h-[80px]",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        isSelected
                          ? "bg-blue-500 text-white shadow-lg scale-[1.02]"
                          : "bg-muted/50 hover:bg-accent border border-border hover:border-blue-500/50"
                      )}
                    >
                      <span className={cn(
                        "text-xs md:text-sm font-medium text-center leading-tight",
                        isSelected ? "text-white" : "text-foreground"
                      )}>
                        {getMatrixColumnLabel(col)}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Check className="w-5 h-5" strokeWidth={3} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Submit button for matrix */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-6"
        >
          <button
            onClick={handleMatrixSubmit}
            disabled={!isMatrixComplete}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 relative overflow-hidden",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              isMatrixComplete
                ? "bg-primary text-primary-foreground hover:shadow-lg btn-glow"
                : "bg-muted text-muted-foreground/50 cursor-not-allowed border border-border"
            )}
          >
            <span className="relative z-10">
              {t("survey.continue")}
            </span>
            {isMatrixComplete && (
              <span className="absolute inset-0 animate-shimmer" />
            )}
          </button>
        </motion.div>
      </div>
    </fieldset>
  );
}
