#!/usr/bin/env node
/**
 * Check existing sessions and their relationships
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('='.repeat(60));
console.log('SESSION & RESPONSE ANALYSIS');
console.log('='.repeat(60));

async function analyze() {
  // 1. Get all sessions
  console.log('\n1. ALL SESSIONS');
  console.log('-'.repeat(40));

  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .order('started_at', { ascending: false });

  if (sessionsError) {
    console.log(`Error: ${sessionsError.message}`);
    return;
  }

  console.log(`Found ${sessions.length} sessions:\n`);
  for (const s of sessions) {
    console.log(`Session ID: ${s.id}`);
    console.log(`  Started: ${s.started_at}`);
    console.log(`  Completed: ${s.completed_at || 'NOT COMPLETED'}`);
    console.log(`  Is Complete: ${s.is_complete}`);
    console.log(`  Language: ${s.language}`);
    console.log(`  Has Partial Answers: ${s.partial_answers ? Object.keys(s.partial_answers).length + ' keys' : 'No'}`);
    console.log(`  Last Question Index: ${s.last_question_index}`);
    console.log('');
  }

  // 2. Check submission attempts (if table exists)
  console.log('\n2. SUBMISSION ATTEMPTS');
  console.log('-'.repeat(40));

  const { data: attempts, error: attemptsError } = await supabase
    .from('submission_attempts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (attemptsError) {
    if (attemptsError.code === '42P01') {
      console.log('Table submission_attempts does not exist');
    } else {
      console.log(`Error: ${attemptsError.message}`);
    }
  } else if (attempts && attempts.length > 0) {
    console.log(`Found ${attempts.length} submission attempts:\n`);
    for (const a of attempts) {
      console.log(`Attempt ID: ${a.id}`);
      console.log(`  Created: ${a.created_at}`);
      console.log(`  Session ID: ${a.session_id}`);
      console.log(`  Anonymous ID: ${a.anonymous_id}`);
      console.log(`  Is Successful: ${a.is_successful}`);
      console.log(`  Blocked Reason: ${a.blocked_reason || 'Not blocked'}`);
      console.log(`  IP: ${a.ip_address}`);
      console.log('');
    }
  } else {
    console.log('No submission attempts recorded');
  }

  // 3. Check email submissions
  console.log('\n3. EMAIL SUBMISSIONS');
  console.log('-'.repeat(40));

  const { data: emails, error: emailsError } = await supabase
    .from('email_submissions')
    .select('id, created_at, email_hash, response_id, anonymous_id, marketing_consent')
    .order('created_at', { ascending: false })
    .limit(10);

  if (emailsError) {
    console.log(`Error: ${emailsError.message}`);
  } else if (emails && emails.length > 0) {
    console.log(`Found ${emails.length} email submissions:\n`);
    for (const e of emails) {
      console.log(`Email ID: ${e.id}`);
      console.log(`  Created: ${e.created_at}`);
      console.log(`  Email Hash: ${e.email_hash?.substring(0, 20)}...`);
      console.log(`  Response ID: ${e.response_id || 'NO RESPONSE LINKED!'}`);
      console.log(`  Anonymous ID: ${e.anonymous_id}`);
      console.log(`  Marketing Consent: ${e.marketing_consent}`);
      console.log('');
    }
  } else {
    console.log('No email submissions found');
  }

  // 4. Check email_hashes table
  console.log('\n4. EMAIL HASHES');
  console.log('-'.repeat(40));

  const { data: hashes, error: hashesError } = await supabase
    .from('email_hashes')
    .select('*')
    .limit(10);

  if (hashesError) {
    if (hashesError.code === '42P01') {
      console.log('Table email_hashes does not exist');
    } else {
      console.log(`Error: ${hashesError.message}`);
    }
  } else if (hashes && hashes.length > 0) {
    console.log(`Found ${hashes.length} email hashes:\n`);
    for (const h of hashes) {
      console.log(`  Hash: ${h.email_hash?.substring(0, 20)}... | Response ID: ${h.response_id || 'NONE'}`);
    }
  } else {
    console.log('No email hashes found');
  }

  // 5. Check security_audit_log
  console.log('\n5. SECURITY AUDIT LOG (Last 10)');
  console.log('-'.repeat(40));

  const { data: logs, error: logsError } = await supabase
    .from('security_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (logsError) {
    if (logsError.code === '42P01') {
      console.log('Table security_audit_log does not exist');
    } else {
      console.log(`Error: ${logsError.message}`);
    }
  } else if (logs && logs.length > 0) {
    console.log(`Found ${logs.length} audit log entries:\n`);
    for (const l of logs) {
      console.log(`  ${l.created_at} | ${l.operation} | Success: ${l.success} | ${l.error_message || ''}`);
    }
  } else {
    console.log('No audit log entries');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSIS');
  console.log('='.repeat(60));

  const { count: responseCount } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true });

  console.log(`
Sessions: ${sessions.length}
Responses: ${responseCount}
Email Submissions: ${emails?.length || 0}

OBSERVATION:
- Sessions are being created (likely from partial saves or session init)
- Email submissions exist (users completed the email step)
- But NO responses are stored

POSSIBLE CAUSES:
1. The survey is completing up to the email step but not calling /api/survey/submit
2. The submit API is failing silently (check browser console/network tab)
3. Duplicate detection is blocking submissions
4. CSRF validation is failing
`);
}

analyze().catch(console.error);
