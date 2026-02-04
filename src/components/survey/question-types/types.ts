/**
 * Shared types for question type components
 */

import { type Question } from "@/data";

export interface QuestionTypeProps {
  question: Question;
  value: string | number | string[] | Record<string, number> | undefined;
  onChange: (val: string | number | string[] | Record<string, number>) => void;
  onNext: () => void;
  questionText: string;
}

export interface ChoiceQuestionProps extends QuestionTypeProps {
  getOptionLabel: (opt: { value: string; label: string }) => string;
}

export interface MultipleQuestionProps extends QuestionTypeProps {
  getOptionLabel: (opt: { value: string; label: string }) => string;
  multipleSelected: string[];
}

export interface ScaleQuestionProps extends QuestionTypeProps {
  minLabel: string | undefined;
  maxLabel: string | undefined;
  language: string;
}

export interface MatrixQuestionProps extends QuestionTypeProps {
  matrixValue: Record<string, number>;
  getMatrixRowLabel: (row: { value: string; label: string }) => string;
  getMatrixColumnLabel: (col: { value: number; label: string }) => string;
}

export type TextQuestionProps = QuestionTypeProps;
