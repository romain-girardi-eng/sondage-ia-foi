-- Migration: Add email hash verification table
-- Stores only SHA-256 hashes of emails, not the actual emails
-- This allows duplicate detection without storing personal data

-- Email hashes table
CREATE TABLE IF NOT EXISTS email_hashes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- The SHA-256 hash of the email (64 hex characters)
  email_hash VARCHAR(64) NOT NULL UNIQUE,

  -- Link to the response (optional, for data integrity)
  response_id UUID REFERENCES responses(id) ON DELETE SET NULL,

  -- IP address hash for additional verification (optional)
  ip_hash VARCHAR(64)
);

-- Index for fast hash lookups
CREATE INDEX IF NOT EXISTS idx_email_hashes_hash ON email_hashes(email_hash);
CREATE INDEX IF NOT EXISTS idx_email_hashes_created_at ON email_hashes(created_at DESC);

-- Enable RLS
ALTER TABLE email_hashes ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access on email_hashes" ON email_hashes
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Anonymous can only insert (for survey submission)
CREATE POLICY "Allow email hash inserts" ON email_hashes
  FOR INSERT WITH CHECK (true);

-- Function to check if email hash exists
CREATE OR REPLACE FUNCTION check_email_hash_exists(p_email_hash VARCHAR(64))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM email_hashes WHERE email_hash = p_email_hash
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record email hash with response
CREATE OR REPLACE FUNCTION record_email_hash(
  p_email_hash VARCHAR(64),
  p_response_id UUID DEFAULT NULL,
  p_ip_hash VARCHAR(64) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO email_hashes (email_hash, response_id, ip_hash)
  VALUES (p_email_hash, p_response_id, p_ip_hash)
  ON CONFLICT (email_hash) DO NOTHING
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
