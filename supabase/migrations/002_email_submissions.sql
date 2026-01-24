-- Email submissions table for duplicate prevention and PDF delivery
-- Stores hashed emails for duplicate detection and encrypted emails for PDF sending

CREATE TABLE IF NOT EXISTS email_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Email storage (hashed for duplicate detection, encrypted for sending)
  email_hash TEXT NOT NULL UNIQUE,
  email_encrypted TEXT NOT NULL,
  email_iv TEXT NOT NULL,

  -- Link to survey response
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  anonymous_id UUID NOT NULL,

  -- Marketing consent
  marketing_consent BOOLEAN DEFAULT FALSE,

  -- PDF delivery tracking
  pdf_sent_at TIMESTAMPTZ,
  pdf_send_attempts INTEGER DEFAULT 0,
  last_error TEXT
);

-- Index for fast duplicate lookup
CREATE INDEX IF NOT EXISTS idx_email_hash ON email_submissions(email_hash);

-- Index for finding pending PDFs to retry
CREATE INDEX IF NOT EXISTS idx_pdf_pending ON email_submissions(pdf_sent_at)
  WHERE pdf_sent_at IS NULL AND pdf_send_attempts < 3;

-- RLS policies
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (from API)
CREATE POLICY "Allow anonymous insert" ON email_submissions
  FOR INSERT
  WITH CHECK (true);

-- Only allow service role to read/update
CREATE POLICY "Service role read" ON email_submissions
  FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role update" ON email_submissions
  FOR UPDATE
  USING (auth.role() = 'service_role');
