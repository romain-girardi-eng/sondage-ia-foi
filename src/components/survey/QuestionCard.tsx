"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { type Question } from "@/data";
import { useLanguage } from "@/lib";
import {
  ChoiceQuestion,
  MultipleQuestion,
  ScaleQuestion,
  MatrixQuestion,
  TextQuestion,
} from "./question-types";

interface QuestionCardProps {
  question: Question;
  value: string | number | string[] | Record<string, number> | undefined;
  onChange: (val: string | number | string[] | Record<string, number>) => void;
  onNext: () => void;
}

export function QuestionCard({
  question,
  value,
  onChange,
  onNext,
}: QuestionCardProps) {
  const { tQuestion, tOption, tScale, tMatrixColumn, tMatrixRow, language } = useLanguage();

  const multipleSelected = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value]
  );

  // For matrix questions, the value is Record<string, number>
  const matrixValue = useMemo(
    () => (typeof value === 'object' && !Array.isArray(value) ? value as Record<string, number> : {}),
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

  // Get translated matrix row label
  const getMatrixRowLabel = (row: { value: string; label: string }) => {
    const translated = tMatrixRow(row.value);
    return translated !== row.value ? translated : row.label;
  };

  // Get translated matrix column label
  const getMatrixColumnLabel = (col: { value: number; label: string }) => {
    const translated = tMatrixColumn(col.value);
    return translated !== `matrix_col_${col.value}` ? translated : col.label;
  };

  // Get min/max labels for scale questions
  const minLabel = question.minLabelKey
    ? getScaleLabel(question.minLabelKey, question.minLabel)
    : question.minLabel;
  const maxLabel = question.maxLabelKey
    ? getScaleLabel(question.maxLabelKey, question.maxLabel)
    : question.maxLabel;

  // Shared props for all question types
  const baseProps = {
    question,
    value,
    onChange,
    onNext,
    questionText,
  };

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
        {question.type === "choice" && (
          <ChoiceQuestion
            {...baseProps}
            getOptionLabel={getOptionLabel}
          />
        )}

        {question.type === "multiple" && (
          <MultipleQuestion
            {...baseProps}
            getOptionLabel={getOptionLabel}
            multipleSelected={multipleSelected}
          />
        )}

        {question.type === "matrix" && (
          <MatrixQuestion
            {...baseProps}
            matrixValue={matrixValue}
            getMatrixRowLabel={getMatrixRowLabel}
            getMatrixColumnLabel={getMatrixColumnLabel}
          />
        )}

        {question.type === "scale" && (
          <ScaleQuestion
            {...baseProps}
            minLabel={minLabel}
            maxLabel={maxLabel}
            language={language}
          />
        )}

        {question.type === "text" && (
          <TextQuestion {...baseProps} />
        )}
      </motion.div>
    </article>
  );
}
