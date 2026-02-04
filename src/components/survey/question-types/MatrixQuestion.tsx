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
        {/* Column headers - desktop */}
        <div className="hidden md:grid md:grid-cols-[1fr,repeat(4,80px)] gap-2 items-end pb-4 mb-2">
          <div className="text-sm font-medium text-muted-foreground">&nbsp;</div>
          {matrixCols.map((col, idx) => (
            <motion.div
              key={col.value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.3 }}
              className="text-center"
            >
              <span className="text-sm text-foreground font-semibold leading-tight block px-1">
                {getMatrixColumnLabel(col)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Rows */}
        {matrixRows.map((row, rowIdx) => {
          const selectedValue = matrixValue[row.value];
          return (
            <motion.div
              key={row.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * rowIdx, duration: 0.4 }}
              className="glass-card-refined rounded-2xl p-4 space-y-3 md:space-y-0"
            >
              {/* Row label */}
              <div className="md:hidden text-sm font-medium text-foreground mb-3">
                {getMatrixRowLabel(row)}
              </div>

              {/* Desktop layout: row label + radio buttons in grid */}
              <div className="hidden md:grid md:grid-cols-[1fr,repeat(4,80px)] gap-2 items-center">
                <div className="text-sm font-medium text-foreground pr-4">
                  {getMatrixRowLabel(row)}
                </div>
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
                        "w-full aspect-square max-w-[48px] mx-auto rounded-xl flex items-center justify-center transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        isSelected
                          ? "bg-blue-500 text-white shadow-lg scale-110"
                          : "bg-muted hover:bg-accent border border-border hover:border-blue-500/50"
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile layout: horizontal button group */}
              <div className="md:hidden flex justify-between gap-2" role="radiogroup">
                {matrixCols.map((col) => {
                  const isSelected = selectedValue === col.value;
                  return (
                    <button
                      key={col.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={getMatrixColumnLabel(col)}
                      onClick={() => handleMatrixCellClick(row.value, col.value)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        isSelected
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-muted hover:bg-accent border border-border"
                      )}
                    >
                      <span className="text-[10px] leading-tight text-center font-medium">
                        {getMatrixColumnLabel(col)}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Check className="w-3 h-3" strokeWidth={3} />
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
