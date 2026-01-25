-- Migration: Add duplicate submission protection
-- This table tracks submission attempts to prevent one person from submitting multiple times

-- Submission tracking table
CREATE TABLE IF NOT EXISTS submission_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Identifiers for duplicate detection
  fingerprint_id VARCHAR(64),          -- Browser fingerprint hash
  ip_address VARCHAR(45),              -- IPv4 or IPv6
  anonymous_id UUID,                   -- From localStorage
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  -- Whether this was a successful submission
  is_successful BOOLEAN DEFAULT FALSE,

  -- Reason if blocked
  blocked_reason VARCHAR(100),

  -- User agent for debugging
  user_agent TEXT
);

-- Indexes for fast duplicate lookups
CREATE INDEX IF NOT EXISTS idx_tracking_fingerprint ON submission_tracking(fingerprint_id) WHERE is_successful = TRUE;
CREATE INDEX IF NOT EXISTS idx_tracking_ip ON submission_tracking(ip_address) WHERE is_successful = TRUE;
CREATE INDEX IF NOT EXISTS idx_tracking_anonymous_id ON submission_tracking(anonymous_id) WHERE is_successful = TRUE;
CREATE INDEX IF NOT EXISTS idx_tracking_created_at ON submission_tracking(created_at DESC);

-- Composite index for combined checks
CREATE INDEX IF NOT EXISTS idx_tracking_fingerprint_ip ON submission_tracking(fingerprint_id, ip_address) WHERE is_successful = TRUE;

-- Enable RLS
ALTER TABLE submission_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything, anonymous can only insert
CREATE POLICY "Allow tracking inserts" ON submission_tracking
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access" ON submission_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- Function to check if a submission is allowed
CREATE OR REPLACE FUNCTION check_submission_allowed(
  p_fingerprint_id VARCHAR(64),
  p_ip_address VARCHAR(45),
  p_anonymous_id UUID
)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  previous_submission_at TIMESTAMPTZ
) AS $$
DECLARE
  v_existing RECORD;
BEGIN
  -- Check for existing successful submission with same fingerprint
  SELECT created_at INTO v_existing
  FROM submission_tracking
  WHERE fingerprint_id = p_fingerprint_id
    AND is_successful = TRUE
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT FALSE, 'fingerprint_exists'::TEXT, v_existing.created_at;
    RETURN;
  END IF;

  -- Check for existing successful submission with same anonymous_id
  SELECT created_at INTO v_existing
  FROM submission_tracking
  WHERE anonymous_id = p_anonymous_id
    AND is_successful = TRUE
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT FALSE, 'anonymous_id_exists'::TEXT, v_existing.created_at;
    RETURN;
  END IF;

  -- Check for multiple submissions from same IP (allow some, block excessive)
  -- Allow up to 3 submissions per IP (for shared computers/families)
  SELECT COUNT(*) INTO v_existing
  FROM submission_tracking
  WHERE ip_address = p_ip_address
    AND is_successful = TRUE;

  IF v_existing.count >= 3 THEN
    RETURN QUERY SELECT FALSE, 'ip_limit_exceeded'::TEXT, NOW();
    RETURN;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT TRUE, NULL::TEXT, NULL::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a submission attempt
CREATE OR REPLACE FUNCTION record_submission_attempt(
  p_fingerprint_id VARCHAR(64),
  p_ip_address VARCHAR(45),
  p_anonymous_id UUID,
  p_session_id UUID,
  p_is_successful BOOLEAN,
  p_blocked_reason VARCHAR(100) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO submission_tracking (
    fingerprint_id,
    ip_address,
    anonymous_id,
    session_id,
    is_successful,
    blocked_reason,
    user_agent
  ) VALUES (
    p_fingerprint_id,
    p_ip_address,
    p_anonymous_id,
    p_session_id,
    p_is_successful,
    p_blocked_reason,
    p_user_agent
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
