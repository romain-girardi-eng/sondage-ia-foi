#!/usr/bin/env node
/**
 * Database diagnostic script
 * Tests Supabase connection and checks for survey responses
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('='.repeat(60));
console.log('DATABASE DIAGNOSTIC TEST');
console.log('='.repeat(60));

// Check environment variables
console.log('\n1. ENVIRONMENT CHECK');
console.log('-'.repeat(40));
console.log(`SUPABASE_URL: ${supabaseUrl ? '✓ Set' : '✗ MISSING'}`);
console.log(`SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✓ Set' : '✗ MISSING'}`);
console.log(`ANON_KEY: ${supabaseAnonKey ? '✓ Set' : '✗ MISSING'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing required environment variables!');
  process.exit(1);
}

// Create Supabase client with service role (admin access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTests() {
  try {
    // Test 1: Basic connection
    console.log('\n2. CONNECTION TEST');
    console.log('-'.repeat(40));

    const { error: healthError } = await supabase
      .from('responses')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      console.log(`❌ Connection failed: ${healthError.message}`);
      console.log(`   Code: ${healthError.code}`);
      console.log(`   Details: ${healthError.details}`);
    } else {
      console.log('✓ Connection successful');
    }

    // Test 2: Count responses
    console.log('\n3. RESPONSES TABLE');
    console.log('-'.repeat(40));

    const { count: responseCount, error: countError } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log(`❌ Error querying responses: ${countError.message}`);
    } else {
      console.log(`✓ Total responses in database: ${responseCount}`);
    }

    // Test 3: Get latest responses
    console.log('\n4. LATEST RESPONSES');
    console.log('-'.repeat(40));

    const { data: latestResponses, error: latestError } = await supabase
      .from('responses')
      .select('id, created_at, session_id, anonymous_id, consent_given')
      .order('created_at', { ascending: false })
      .limit(5);

    if (latestError) {
      console.log(`❌ Error fetching latest responses: ${latestError.message}`);
    } else if (!latestResponses || latestResponses.length === 0) {
      console.log('⚠ No responses found in database');
    } else {
      console.log(`✓ Found ${latestResponses.length} recent responses:`);
      latestResponses.forEach((r, i) => {
        console.log(`   ${i + 1}. ID: ${r.id.substring(0, 8)}... | Created: ${r.created_at} | Consent: ${r.consent_given}`);
      });
    }

    // Test 4: Count sessions
    console.log('\n5. SESSIONS TABLE');
    console.log('-'.repeat(40));

    const { count: sessionCount, error: sessionCountError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    if (sessionCountError) {
      console.log(`❌ Error querying sessions: ${sessionCountError.message}`);
    } else {
      console.log(`✓ Total sessions in database: ${sessionCount}`);
    }

    // Test 5: Check completed vs incomplete sessions
    const { data: sessionStats, error: sessionStatsError } = await supabase
      .from('sessions')
      .select('is_complete')
      .limit(1000);

    if (!sessionStatsError && sessionStats) {
      const completed = sessionStats.filter(s => s.is_complete).length;
      const incomplete = sessionStats.filter(s => !s.is_complete).length;
      console.log(`   - Completed: ${completed}`);
      console.log(`   - In progress: ${incomplete}`);
    }

    // Test 6: Check email_submissions table
    console.log('\n6. EMAIL SUBMISSIONS TABLE');
    console.log('-'.repeat(40));

    const { count: emailCount, error: emailError } = await supabase
      .from('email_submissions')
      .select('*', { count: 'exact', head: true });

    if (emailError) {
      if (emailError.code === '42P01') {
        console.log('⚠ Table email_submissions does not exist');
      } else {
        console.log(`❌ Error querying email_submissions: ${emailError.message}`);
      }
    } else {
      console.log(`✓ Total email submissions: ${emailCount}`);
    }

    // Test 7: Check submission_attempts table (security)
    console.log('\n7. SUBMISSION ATTEMPTS (SECURITY)');
    console.log('-'.repeat(40));

    const { count: attemptCount, error: attemptError } = await supabase
      .from('submission_attempts')
      .select('*', { count: 'exact', head: true });

    if (attemptError) {
      if (attemptError.code === '42P01') {
        console.log('⚠ Table submission_attempts does not exist');
      } else {
        console.log(`❌ Error: ${attemptError.message}`);
      }
    } else {
      console.log(`✓ Total submission attempts logged: ${attemptCount}`);
    }

    // Test 8: Fetch a full response to check data structure
    console.log('\n8. SAMPLE RESPONSE DATA');
    console.log('-'.repeat(40));

    const { data: sampleResponse, error: sampleError } = await supabase
      .from('responses')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      if (sampleError.code === 'PGRST116') {
        console.log('⚠ No responses to sample');
      } else {
        console.log(`❌ Error: ${sampleError.message}`);
      }
    } else {
      console.log('✓ Sample response structure:');
      console.log(`   - ID: ${sampleResponse.id}`);
      console.log(`   - Created: ${sampleResponse.created_at}`);
      console.log(`   - Has answers: ${sampleResponse.answers ? 'Yes' : 'No'}`);
      if (sampleResponse.answers) {
        const answerCount = Object.keys(sampleResponse.answers).length;
        console.log(`   - Answer count: ${answerCount}`);
      }
      console.log(`   - Has metadata: ${sampleResponse.metadata ? 'Yes' : 'No'}`);
    }

    // Test 9: Test RPC function (get_participant_count)
    console.log('\n9. RPC FUNCTION TEST');
    console.log('-'.repeat(40));

    const { data: participantCount, error: rpcError } = await supabase
      .rpc('get_participant_count');

    if (rpcError) {
      if (rpcError.code === '42883') {
        console.log('⚠ RPC function get_participant_count does not exist');
      } else {
        console.log(`❌ RPC Error: ${rpcError.message}`);
      }
    } else {
      console.log(`✓ Participant count from RPC: ${participantCount}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    if (responseCount === 0) {
      console.log('\n⚠ ISSUE DETECTED: No responses in database');
      console.log('   Possible causes:');
      console.log('   1. Survey submissions are not reaching the server');
      console.log('   2. Submissions are being blocked by security checks');
      console.log('   3. Database write permissions issue');
      console.log('   4. Demo mode might be active (skips DB writes)');
    } else {
      console.log(`\n✓ Database has ${responseCount} responses`);
      console.log('   The issue is likely in the admin dashboard fetch/display');
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

runTests();
