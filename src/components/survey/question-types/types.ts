/**
 * Shared types for question type components
 */

import { type Question } from "@/data";

export type AnswerValue = string | number | string[] | Record<string, number>;

export interface QuestionTypeProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (val: AnswerValue) => void;
  // The value being committed is passed along so the container can branch on
  // the fresh answer (screen-out) instead of the stale render-time state.
  onNext: (committedValue?: AnswerValue) => void;
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

export interface TextQuestionProps extends QuestionTypeProps {
  placeholder: string | undefined;
}
