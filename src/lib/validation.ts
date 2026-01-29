import { z } from 'zod';

// Survey submission schema
export const surveySubmissionSchema = z.object({
  sessionId: z.string().uuid(),
  answers: z.record(z.string(), z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
  ])),
  metadata: z.object({
    completedAt: z.string().datetime().optional(),
    timeSpent: z.number().optional(),
    language: z.enum(['fr', 'en']).optional(),
    startedAt: z.string().datetime().optional(),
  }).optional(),
  consentGiven: z.boolean(),
  consentVersion: z.string().optional(),
  anonymousId: z.string().uuid(),
  // Fingerprint for duplicate detection
  fingerprint: z.string().min(1).max(100).optional(),
  // Email hash for verification (SHA-256, 64 hex chars)
  emailHash: z.string().length(64).optional(),
});

// Email submission schema
export const emailSubmissionSchema = z.object({
  email: z.string().email(),
  responseId: z.string().uuid().optional(),
  anonymousId: z.string().uuid(),
  marketingConsent: z.boolean().default(false),
  language: z.enum(['fr', 'en']),
  answers: z.record(z.string(), z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
  ])),
});

export type EmailSubmissionInput = z.infer<typeof emailSubmissionSchema>;

// Partial save schema
export const partialSaveSchema = z.object({
  sessionId: z.string().uuid(),
  answers: z.record(z.string(), z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
  ])),
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
