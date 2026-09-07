/**
 * Pure helpers backing the in-progress survey stored in localStorage.
 *
 * Two invariants matter here:
 * - a saved session belongs to one instrument version. Resuming v1 answers
 *   into the v2 questionnaire would submit v1 option codes stamped as v2, so
 *   a version mismatch discards the saved progress instead;
 * - an exclusive `aucun*` selection cannot coexist with other selections
 *   (mirror of the server-side refine), otherwise a resumed session would be
 *   rejected with a generic 400 at submission time.
 */

import { INSTRUMENT_VERSION, isExclusiveOptionValue } from "@/data/surveySchema";

export type SurveyAnswerValue = string | number | string[] | Record<string, number>;
export type SurveyAnswers = Record<string, SurveyAnswerValue>;

export interface SavedProgress {
  answers: SurveyAnswers;
  currentIndex: number;
  timestamp: number;
  sessionId: string;
  instrumentVersion: string;
}

/** Saved progress older than this is never offered for resuming. */
export const RESUME_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Keep only the exclusive value when an `aucun*` option was stored alongside
 * other selections (stale v1 data, or a race in an older client).
 */
export function sanitizeExclusiveSelections(answers: SurveyAnswers): SurveyAnswers {
  let changed = false;
  const sanitized: SurveyAnswers = {};

  for (const [questionId, value] of Object.entries(answers)) {
    if (Array.isArray(value) && value.length > 1) {
      const exclusive = value.find(isExclusiveOptionValue);
      if (exclusive !== undefined) {
        sanitized[questionId] = [exclusive];
        changed = true;
        continue;
      }
    }
    sanitized[questionId] = value;
  }

  return changed ? sanitized : answers;
}

function isAnswerValue(value: unknown): value is SurveyAnswerValue {
  if (typeof value === "string" || typeof value === "number") return true;
  if (Array.isArray(value)) return value.every((item) => typeof item === "string");
  if (typeof value === "object" && value !== null) {
    return Object.values(value).every((item) => typeof item === "number");
  }
  return false;
}

function isAnswers(value: unknown): value is SurveyAnswers {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.values(value).every(isAnswerValue);
}

interface ParseOptions {
  instrumentVersion?: string;
  now?: number;
}

/**
 * Parse the raw localStorage payload into resumable progress, or null when it
 * must be discarded (unreadable, empty, too old, or written by another
 * instrument version).
 */
export function parseSavedProgress(
  raw: string | null,
  options: ParseOptions = {}
): SavedProgress | null {
  if (!raw) return null;

  const instrumentVersion = options.instrumentVersion ?? INSTRUMENT_VERSION;
  const now = options.now ?? Date.now();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  const candidate = parsed as Record<string, unknown>;

  // No version stamp means the session predates the versioned format: it is
  // v1 data, so it cannot be resumed into the current instrument either.
  if (candidate.instrumentVersion !== instrumentVersion) return null;

  if (!isAnswers(candidate.answers)) return null;
  if (Object.keys(candidate.answers).length === 0) return null;

  if (typeof candidate.timestamp !== "number") return null;
  if (now - candidate.timestamp >= RESUME_MAX_AGE_MS) return null;

  if (typeof candidate.sessionId !== "string") return null;

  const currentIndex =
    typeof candidate.currentIndex === "number" && candidate.currentIndex >= 0
      ? Math.floor(candidate.currentIndex)
      : 0;

  return {
    answers: sanitizeExclusiveSelections(candidate.answers),
    currentIndex,
    timestamp: candidate.timestamp,
    sessionId: candidate.sessionId,
    instrumentVersion,
  };
}
