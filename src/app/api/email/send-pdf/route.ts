import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCSRF, csrfErrorResponse } from '@/lib/csrf';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/security/clientIp';
import { sendPdfReport } from '@/lib/email/sendPdfReport';
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
    z.record(z.string(), z.number().min(0).max(3)),
  ])),
});

export async function POST(request: NextRequest) {
  try {
    const csrfResult = await validateCSRF(request);
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error || 'Invalid CSRF token');
    }

    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(ip, 'email');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const parseResult = sendPdfSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const { submissionId, email, language, anonymousId, answers } = parseResult.data;

    const result = await sendPdfReport({
      submissionId,
      email,
      language,
      anonymousId,
      answers: answers as Answers,
    });

    if (!result.ok) {
      if (result.reason === 'forbidden') {
        return NextResponse.json(
          { error: 'Request could not be verified' },
          { status: 403, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    return NextResponse.json(
      { success: true, emailId: result.emailId },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('PDF send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
