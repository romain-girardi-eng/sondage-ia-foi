import { Resend } from 'resend';

// Check if Resend is configured
export const isResendConfigured = Boolean(process.env.RESEND_API_KEY);

// Lazy-initialize Resend client to avoid errors during build
let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!isResendConfigured) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

interface SendPDFEmailOptions {
  to: string;
  pdfBuffer: Buffer;
  language: 'fr' | 'en';
  filename?: string;
}

const EMAIL_SUBJECTS = {
  fr: 'Votre rapport personnalisé - Sondage IA & Foi',
  en: 'Your personalized report - AI & Faith Survey',
};

const EMAIL_CONTENT = {
  fr: {
    greeting: 'Bonjour,',
    body: 'Merci pour votre participation à notre étude sur l\'Intelligence Artificielle et la vie spirituelle. Vous trouverez ci-joint votre rapport personnalisé avec vos résultats.',
    note: 'Ce rapport est confidentiel et généré à partir de vos réponses au sondage.',
    closing: 'Cordialement,',
    team: 'L\'équipe de recherche IA & Foi',
    footer: 'Cette étude est menée dans un cadre académique. Vos données sont protégées conformément au RGPD.',
  },
  en: {
    greeting: 'Hello,',
    body: 'Thank you for participating in our study on Artificial Intelligence and spiritual life. Please find attached your personalized report with your results.',
    note: 'This report is confidential and generated from your survey responses.',
    closing: 'Best regards,',
    team: 'The AI & Faith Research Team',
    footer: 'This study is conducted in an academic context. Your data is protected in accordance with GDPR.',
  },
};

/**
 * Send a PDF report via email using Resend
 */
export async function sendPDFEmail({
  to,
  pdfBuffer,
  language,
  filename = 'rapport-sondage-ia-foi.pdf',
}: SendPDFEmailOptions): Promise<{ success: boolean; error?: string; id?: string }> {
  const resend = getResend();

  if (!resend) {
    console.warn('Resend not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const content = EMAIL_CONTENT[language];
  const subject = EMAIL_SUBJECTS[language];

  try {
    const { data, error } = await resend.emails.send({
      from: 'Sondage IA & Foi <noreply@sondage-ia-foi.fr>',
      to: [to],
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="${language}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">IA & ${language === 'fr' ? 'Foi' : 'Faith'}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">${language === 'fr' ? 'Étude Scientifique 2026' : 'Scientific Study 2026'}</p>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin-top: 0;">${content.greeting}</p>

            <p>${content.body}</p>

            <p style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              ${content.note}
            </p>

            <p>${content.closing}<br><strong>${content.team}</strong></p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              ${content.footer}
            </p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export { getResend as resend };
