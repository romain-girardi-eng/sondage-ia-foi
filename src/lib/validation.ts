import { z } from 'zod';
import { isExclusiveOptionValue } from '@/data/surveySchema';

// Matrix answer schema: Record<string, number> where keys are row values and values are column values (0-3)
const matrixAnswerSchema = z.record(z.string(), z.number().min(0).max(3));

// Answer value union (includes matrix answers).
const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.array(z.string()),
  matrixAnswerSchema,
]);

/** Marks the issue raised when an exclusive `aucun*` option is combined. */
export const EXCLUSIVE_OPTION_ISSUE = 'exclusive_option_conflict';

/** Error code returned to the client, so it can jump back to the question. */
export const EXCLUSIVE_OPTION_ERROR_CODE = 'EXCLUSIVE_OPTION_CONFLICT';

function hasExclusiveConflict(value: unknown): boolean {
  return Array.isArray(value) && value.length > 1 && value.some(isExclusiveOptionValue);
}

// Multiple-choice answers whose value starts with `aucun` ("none of these")
// are exclusive: the client enforces it, and so does the server, so no
// response can carry a contradictory selection into the dataset. The issue is
// reported on the offending question id so the client can send the respondent
// back to that exact question instead of a generic failure screen.
const answersSchema = z
  .record(z.string(), answerValueSchema)
  .superRefine((answers, ctx) => {
    for (const [questionId, value] of Object.entries(answers)) {
      if (hasExclusiveConflict(value)) {
        ctx.addIssue({
          code: 'custom',
          path: [questionId],
          message: 'An "aucun" option cannot be combined with other selections',
          params: { issue: EXCLUSIVE_OPTION_ISSUE },
        });
      }
    }
  });

/**
 * Question id of the first exclusive-option conflict in a validation error,
 * or null when the failure is something else.
 */
export function getExclusiveConflictQuestionId(
  issues: ReadonlyArray<z.core.$ZodIssue>
): string | null {
  for (const issue of issues) {
    if (issue.code !== 'custom') continue;
    const params = issue.params as { issue?: string } | undefined;
    if (params?.issue !== EXCLUSIVE_OPTION_ISSUE) continue;
    const questionId = issue.path[issue.path.length - 1];
    if (typeof questionId === 'string') return questionId;
  }
  return null;
}

// Survey submission schema
export const surveySubmissionSchema = z.object({
  sessionId: z.string().uuid(),
  answers: answersSchema,
  metadata: z.object({
    completedAt: z.string().datetime().optional(),
    timeSpent: z.number().optional(),
    language: z.enum(['fr', 'en']).optional(),
    startedAt: z.string().datetime().optional(),
    // Survey instrument version at time of response (schema/cutover lineage,
    // confession-agnostic). Not a CNEF/general cohort split.
    instrumentVersion: z.string().max(20).optional(),
    // Landing page the respondent came through (general site or CNEF
    // co-branded entry point). Recruitment channel, not a confession.
    entryVariant: z.enum(['general', 'cnef']).optional(),
    // True when the respondent was screened out of the studied population
    // (no religion / other) right after the first question: stored, but
    // never scored.
    screenedOut: z.boolean().optional(),
  }).optional(),
  consentGiven: z.boolean(),
  consentVersion: z.string().optional(),
  anonymousId: z.string().uuid(),
  // Fingerprint for duplicate detection
  fingerprint: z.string().min(1).max(100).optional(),
  // Email hash for verification (SHA-256, 64 hex chars)
  emailHash: z.string().length(64).optional(),
});

// Partial save schema
export const partialSaveSchema = z.object({
  sessionId: z.string().uuid(),
  answers: answersSchema,
  lastQuestionIndex: z.number().int().min(0),
  language: z.enum(['fr', 'en']),
});

// Export request schema
export const exportRequestSchema = z.object({
  format: z.enum(['csv', 'json']),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  language: z.enum(['fr', 'en']).optional(),
});

// User data deletion/export schema
export const userDataSchema = z.object({
  anonymousId: z.string().uuid(),
});

// Admin auth schema
export const adminAuthSchema = z.object({
  password: z.string().min(1),
});

export type SurveySubmission = z.infer<typeof surveySubmissionSchema>;
export type PartialSave = z.infer<typeof partialSaveSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;
export type UserDataRequest = z.infer<typeof userDataSchema>;
