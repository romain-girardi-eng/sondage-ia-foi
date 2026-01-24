import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePDFReport } from '@/lib/pdf/generateReport';
import { sendPDFEmail } from '@/lib/email/resend';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import {
  calculateCRS5Score,
  calculateAIAdoptionScore,
  getSpiritualAIProfile,
  PROFILE_DATA,
} from '@/lib/scoring/index';
import type { Answers } from '@/data';

const sendPdfSchema = z.object({
  submissionId: z.string(),
  email: z.string().email(),
  language: z.enum(['fr', 'en']),
  anonymousId: z.string().uuid(),
  answers: z.record(z.string(), z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
  ])),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = sendPdfSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { submissionId, email, language, anonymousId, answers } = parseResult.data;

    // Calculate scores from answers
    const religiosityScore = calculateCRS5Score(answers as Answers);
    const iaComfortScore = calculateAIAdoptionScore(answers as Answers);
    const profile = getSpiritualAIProfile(answers as Answers);
    const profileData = PROFILE_DATA[profile];

    // Generate PDF
    const pdfDoc = generatePDFReport({
      language,
      anonymousId,
      completedAt: new Date().toISOString(),
      answers,
      profile: {
        religiosityScore,
        iaComfortScore,
        theologicalOrientation: profileData.title,
      },
    });

    // Convert jsPDF to buffer
    const pdfArrayBuffer = pdfDoc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // Send email
    const filename = language === 'fr'
      ? `rapport-sondage-ia-foi-${anonymousId.slice(0, 8)}.pdf`
      : `ai-faith-survey-report-${anonymousId.slice(0, 8)}.pdf`;

    const emailResult = await sendPDFEmail({
      to: email,
      pdfBuffer,
      language,
      filename,
    });

    // Update database with send status if configured
    if (isServiceRoleConfigured && !submissionId.startsWith('demo-')) {
      const supabase = createServiceRoleClient();
      if (supabase) {
        if (emailResult.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('email_submissions')
            .update({
              pdf_sent_at: new Date().toISOString(),
              last_error: null,
            })
            .eq('id', submissionId);
        } else {
          // Get current attempt count and increment
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: currentSubmission } = await (supabase as any)
            .from('email_submissions')
            .select('pdf_send_attempts')
            .eq('id', submissionId)
            .single();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('email_submissions')
            .update({
              pdf_send_attempts: (currentSubmission?.pdf_send_attempts || 0) + 1,
              last_error: emailResult.error,
            })
            .eq('id', submissionId);
        }
      }
    }

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        emailId: emailResult.id,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PDF send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
