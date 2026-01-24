import { NextRequest, NextResponse } from 'next/server';
import { emailSubmissionSchema } from '@/lib/validation';
import { hashEmail, encryptEmail } from '@/lib/crypto';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = emailSubmissionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, responseId, anonymousId, marketingConsent, language, answers } = parseResult.data;

    // Hash email for duplicate detection
    const emailHash = await hashEmail(email);

    // Check if Supabase is configured
    if (!isServiceRoleConfigured) {
      // Demo mode - simulate success
      console.log('Demo mode: Email submission received', { emailHash: emailHash.slice(0, 8) });
      return NextResponse.json({
        success: true,
        submissionId: 'demo-' + Date.now(),
        demo: true,
      });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        submissionId: 'demo-' + Date.now(),
        demo: true,
      });
    }

    // Check for duplicate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('email_submissions')
      .select('id')
      .eq('email_hash', emailHash)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, duplicate: true, error: 'Email already submitted' },
        { status: 409 }
      );
    }

    // Encrypt email for storage
    const { encrypted, iv } = await encryptEmail(email);

    // Insert into database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: submission, error: insertError } = await (supabase as any)
      .from('email_submissions')
      .insert({
        email_hash: emailHash,
        email_encrypted: encrypted,
        email_iv: iv,
        response_id: responseId || null,
        anonymous_id: anonymousId,
        marketing_consent: marketingConsent,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save email submission' },
        { status: 500 }
      );
    }

    // Trigger PDF generation and sending (async, non-blocking)
    try {
      // Call the send-pdf endpoint internally
      const pdfResponse = await fetch(new URL('/api/email/send-pdf', request.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          email,
          language,
          anonymousId,
          answers,
        }),
      });

      if (!pdfResponse.ok) {
        // Log but don't fail the main request
        console.error('PDF send failed:', await pdfResponse.text());
      }
    } catch (pdfError) {
      // Log but don't fail the main request - PDF will be retried later
      console.error('Failed to trigger PDF send:', pdfError);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('Email submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
