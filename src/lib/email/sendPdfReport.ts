import type { SupabaseClient } from '@supabase/supabase-js';
import { generatePDFReportBuffer } from '@/lib/pdf/generateReport';
import { sendPDFEmail } from '@/lib/email/resend';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { hashEmail } from '@/lib/crypto';
import {
  calculateCRS5Score,
  calculateAIAdoptionScore,
  getSpiritualAIProfile,
  PROFILE_DATA,
} from '@/lib/scoring/index';
import type { Answers } from '@/data';
import type { Database } from '@/lib/supabase/types';

export interface SendPdfReportParams {
  submissionId: string;
  email: string;
  language: 'fr' | 'en';
  anonymousId: string;
  answers: Answers;
}

export type SendPdfReportResult =
  | { ok: true; emailId?: string }
  | { ok: false; reason: 'forbidden' | 'send_failed' };

/**
 * Confirms the caller is a legitimate survey participant before we let them
 * trigger an outbound email.
 *
 * Anchor: hashEmail(email) must already exist in `email_hashes` (written by
 * the survey submit route's `record_email_hash` RPC, awaited before the
 * client is allowed to call send-pdf) or in `email_submissions` (written by
 * the legacy email/submit route before it invokes this module). Both writes
 * are guaranteed to have completed - awaited on the server - before either
 * caller can reach this check, so the legitimate happy path is never
 * affected; only requests carrying an email that never passed through one of
 * those two recording steps are rejected.
 */
async function isVerifiedParticipant(
  supabase: SupabaseClient<Database>,
  email: string
): Promise<boolean> {
  const emailHash = await hashEmail(email);

  const [{ data: hashRow }, { data: submissionRow }] = await Promise.all([
    supabase.from('email_hashes').select('id').eq('email_hash', emailHash).maybeSingle(),
    supabase.from('email_submissions').select('id').eq('email_hash', emailHash).maybeSingle(),
  ]);

  return Boolean(hashRow || submissionRow);
}

/**
 * If a submissionId is provided, confirms it refers to a real record.
 * `responses` holds ids minted by /api/survey/submit; `email_submissions`
 * holds ids minted by the legacy /api/email/submit flow. Checking both
 * tables accommodates each caller without requiring either to know the
 * other's id space.
 */
async function submissionExists(
  supabase: SupabaseClient<Database>,
  submissionId: string
): Promise<boolean> {
  const [{ data: responseRow }, { data: submissionRow }] = await Promise.all([
    supabase.from('responses').select('id').eq('id', submissionId).maybeSingle(),
    supabase.from('email_submissions').select('id').eq('id', submissionId).maybeSingle(),
  ]);

  return Boolean(responseRow || submissionRow);
}

/**
 * Verifies the request is bound to a legitimate participant, generates the
 * personalized PDF report and sends it via email. Shared by both
 * /api/email/send-pdf (external route) and /api/email/submit (internal
 * trigger), so the anti-abuse check and delivery logic live in one place.
 */
export async function sendPdfReport(params: SendPdfReportParams): Promise<SendPdfReportResult> {
  const { submissionId, email, language, anonymousId, answers } = params;

  const isDemoSubmission = submissionId.startsWith('demo-');
  const supabase = isServiceRoleConfigured ? createServiceRoleClient() : null;

  if (isServiceRoleConfigured) {
    // Fail closed: if configuration says the service role should be
    // available but the client could not be created, treat this as a
    // verification failure rather than silently skipping the check.
    if (!supabase) {
      return { ok: false, reason: 'forbidden' };
    }

    const verified = await isVerifiedParticipant(supabase, email);
    if (!verified) {
      return { ok: false, reason: 'forbidden' };
    }

    if (!isDemoSubmission) {
      const exists = await submissionExists(supabase, submissionId);
      if (!exists) {
        return { ok: false, reason: 'forbidden' };
      }
    }
  }

  const religiosityScore = calculateCRS5Score(answers);
  const iaComfortScore = calculateAIAdoptionScore(answers);
  // Scoring v2: no profile is attributed when fewer than four dimensions
  // could be measured (docs/SCORING_V2_SPEC.md §1.5).
  const profile = getSpiritualAIProfile(answers);
  const profileTitle = profile
    ? PROFILE_DATA[profile].title
    : language === 'fr'
      ? 'Profil non attribuable'
      : 'No profile attributed';

  const pdfBuffer = await generatePDFReportBuffer({
    language,
    anonymousId,
    completedAt: new Date().toISOString(),
    answers,
    profile: {
      religiosityScore,
      iaComfortScore,
      theologicalOrientation: profileTitle,
    },
  });

  const filename = language === 'fr'
    ? `rapport-sondage-ia-foi-${anonymousId.slice(0, 8)}.pdf`
    : `ai-faith-survey-report-${anonymousId.slice(0, 8)}.pdf`;

  const emailResult = await sendPDFEmail({
    to: email,
    pdfBuffer,
    language,
    filename,
  });

  if (supabase && !isDemoSubmission) {
    if (emailResult.success) {
      await supabase
        .from('email_submissions')
        .update({
          pdf_sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', submissionId);
    } else {
      const { data: currentSubmission } = await supabase
        .from('email_submissions')
        .select('pdf_send_attempts')
        .eq('id', submissionId)
        .single();

      await supabase
        .from('email_submissions')
        .update({
          pdf_send_attempts: (currentSubmission?.pdf_send_attempts || 0) + 1,
          last_error: emailResult.error,
        })
        .eq('id', submissionId);
    }
  }

  if (!emailResult.success) {
    return { ok: false, reason: 'send_failed' };
  }

  return { ok: true, emailId: emailResult.id };
}
