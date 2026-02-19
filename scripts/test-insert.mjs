#!/usr/bin/env node
/**
 * Test database INSERT operations
 * Simulates a survey submission to diagnose insertion issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('='.repeat(60));
console.log('INSERT OPERATION TEST');
console.log('='.repeat(60));

async function testInsert() {
  const testSessionId = crypto.randomUUID();
  const testAnonymousId = crypto.randomUUID();

  console.log(`\nTest Session ID: ${testSessionId}`);
  console.log(`Test Anonymous ID: ${testAnonymousId}`);

  // Step 1: Insert session
  console.log('\n1. INSERTING TEST SESSION...');
  console.log('-'.repeat(40));

  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .upsert({
      id: testSessionId,
      language: 'fr',
      completed_at: new Date().toISOString(),
      is_complete: true,
      partial_answers: { test: 'test_value' },
    }, { onConflict: 'id' })
    .select();

  if (sessionError) {
    console.log(`❌ Session insert failed:`);
    console.log(`   Error: ${sessionError.message}`);
    console.log(`   Code: ${sessionError.code}`);
    console.log(`   Details: ${JSON.stringify(sessionError.details)}`);
    console.log(`   Hint: ${sessionError.hint}`);
  } else {
    console.log('✓ Session inserted successfully');
    console.log(`   Data: ${JSON.stringify(sessionData)}`);
  }

  // Step 2: Insert response
  console.log('\n2. INSERTING TEST RESPONSE...');
  console.log('-'.repeat(40));

  const testAnswers = {
    q1: 'answer1',
    q2: 'answer2',
    q3: 3,
    consent_data: true
  };

  const responsePayload = {
    session_id: testSessionId,
    answers: testAnswers,
    metadata: { language: 'fr', device: 'test' },
    consent_given: true,
    consent_timestamp: new Date().toISOString(),
    consent_version: '1.0',
    anonymous_id: testAnonymousId,
  };

  console.log('   Payload:');
  console.log(JSON.stringify(responsePayload, null, 2));

  const { data: responseData, error: responseError } = await supabase
    .from('responses')
    .insert(responsePayload)
    .select('id')
    .single();

  if (responseError) {
    console.log(`\n❌ Response insert FAILED:`);
    console.log(`   Error message: ${responseError.message}`);
    console.log(`   Error code: ${responseError.code}`);
    console.log(`   Details: ${JSON.stringify(responseError.details)}`);
    console.log(`   Hint: ${responseError.hint}`);

    // Try to get more info
    console.log('\n   Full error object:');
    console.log(JSON.stringify(responseError, null, 2));
  } else {
    console.log('✓ Response inserted successfully');
    console.log(`   Response ID: ${responseData?.id}`);
  }

  // Step 3: Verify the data
  console.log('\n3. VERIFYING INSERTED DATA...');
  console.log('-'.repeat(40));

  const { data: verifySession, error: verifySessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', testSessionId)
    .single();

  if (verifySessionError) {
    console.log(`❌ Could not verify session: ${verifySessionError.message}`);
  } else {
    console.log(`✓ Session verified: ID=${verifySession.id}`);
  }

  const { data: verifyResponse, error: verifyResponseError } = await supabase
    .from('responses')
    .select('*')
    .eq('session_id', testSessionId)
    .single();

  if (verifyResponseError) {
    console.log(`❌ Could not verify response: ${verifyResponseError.message}`);
    if (verifyResponseError.code === 'PGRST116') {
      console.log('   The response was NOT saved to the database!');
    }
  } else {
    console.log(`✓ Response verified: ID=${verifyResponse.id}`);
    console.log(`   Answers: ${JSON.stringify(verifyResponse.answers)}`);
  }

  // Step 4: Check table schema
  console.log('\n4. CHECKING TABLE SCHEMA...');
  console.log('-'.repeat(40));

  // Try to get table info by attempting various column names
  const { error: schemaError } = await supabase
    .from('responses')
    .select('*')
    .limit(0);

  if (schemaError) {
    console.log(`   Schema check error: ${schemaError.message}`);
  } else {
    console.log('   Table accessible');
  }

  // Step 5: Cleanup (optional - comment out to keep test data)
  console.log('\n5. CLEANUP...');
  console.log('-'.repeat(40));

  // Delete test response first (foreign key)
  const { error: deleteResponseError } = await supabase
    .from('responses')
    .delete()
    .eq('session_id', testSessionId);

  if (deleteResponseError) {
    console.log(`   Could not delete test response: ${deleteResponseError.message}`);
  } else {
    console.log('   Test response deleted (if it existed)');
  }

  // Delete test session
  const { error: deleteSessionError } = await supabase
    .from('sessions')
    .delete()
    .eq('id', testSessionId);

  if (deleteSessionError) {
    console.log(`   Could not delete test session: ${deleteSessionError.message}`);
  } else {
    console.log('   Test session deleted');
  }

  // Final count
  console.log('\n' + '='.repeat(60));
  console.log('FINAL STATUS');
  console.log('='.repeat(60));

  const { count: finalResponseCount } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true });

  const { count: finalSessionCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true });

  console.log(`\n   Total sessions: ${finalSessionCount}`);
  console.log(`   Total responses: ${finalResponseCount}`);
}

testInsert().catch(console.error);
