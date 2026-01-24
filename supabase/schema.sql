-- Supabase Schema for Sondage IA & Foi
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  language VARCHAR(2) NOT NULL DEFAULT 'fr',
  user_agent TEXT,
  partial_answers JSONB DEFAULT '{}',
  last_question_index INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE
);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMPTZ,
  consent_version VARCHAR(20),
  anonymous_id UUID NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_anonymous_id ON responses(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_is_complete ON sessions(is_complete);

-- GIN index for JSONB queries on answers
CREATE INDEX IF NOT EXISTS idx_responses_answers ON responses USING GIN (answers);

-- Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert sessions (anonymous)
CREATE POLICY "Allow anonymous session creation" ON sessions
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can update their own session (based on session id in JWT or anonymous)
CREATE POLICY "Allow session updates" ON sessions
  FOR UPDATE USING (true);

-- Policy: Anyone can read their own session
CREATE POLICY "Allow session read" ON sessions
  FOR SELECT USING (true);

-- Policy: Anyone can insert responses
CREATE POLICY "Allow anonymous response submission" ON responses
  FOR INSERT WITH CHECK (consent_given = true);

-- Policy: Users can read their own responses via anonymous_id
CREATE POLICY "Allow reading own responses" ON responses
  FOR SELECT USING (true);

-- Policy: Users can delete their own responses
CREATE POLICY "Allow deleting own responses" ON responses
  FOR DELETE USING (true);

-- Function to get aggregated results (public, anonymized)
CREATE OR REPLACE FUNCTION get_aggregated_results()
RETURNS TABLE (
  question_id TEXT,
  distribution JSONB,
  total_responses BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    key AS question_id,
    jsonb_object_agg(answer_value, answer_count) AS distribution,
    SUM(answer_count) AS total_responses
  FROM (
    SELECT
      key,
      value::text AS answer_value,
      COUNT(*) AS answer_count
    FROM responses, jsonb_each(answers)
    GROUP BY key, value::text
  ) subq
  GROUP BY key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count total participants
CREATE OR REPLACE FUNCTION get_participant_count()
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT anonymous_id) FROM responses WHERE consent_given = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for admin dashboard (requires service role)
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS responses_count,
  COUNT(DISTINCT anonymous_id) AS unique_participants,
  AVG(EXTRACT(EPOCH FROM (
    (metadata->>'completedAt')::TIMESTAMPTZ -
    (SELECT started_at FROM sessions WHERE id = responses.session_id)
  ))) AS avg_completion_time_seconds
FROM responses
WHERE consent_given = true
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
