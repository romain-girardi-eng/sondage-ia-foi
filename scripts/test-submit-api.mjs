#!/usr/bin/env node
/**
 * Test the submit API endpoint directly
 * Simulates what the frontend does
 */

import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Use localhost or the production URL
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('='.repeat(60));
console.log('SUBMIT API TEST');
console.log('='.repeat(60));
console.log(`Testing against: ${BASE_URL}`);

async function testSubmit() {
  const sessionId = crypto.randomUUID();
  const anonymousId = crypto.randomUUID();

  const payload = {
    sessionId,
    answers: {
      q1: 'test',
      q2: 3,
      religiosity_prayer: 4,
    },
    metadata: {
      completedAt: new Date().toISOString(),
      language: 'fr',
    },
    consentGiven: true,
    consentVersion: '1.0',
    anonymousId,
    fingerprint: 'test-fingerprint',
    emailHash: crypto.createHash('sha256').update('test@example.com').digest('hex'),
  };

  console.log('\n1. TEST WITHOUT CSRF TOKEN (like frontend does)');
  console.log('-'.repeat(40));

  try {
    const response = await fetch(`${BASE_URL}/api/survey/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // NO CSRF TOKEN - this is what the frontend does!
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);

    if (response.status === 403 && data.error?.includes('CSRF')) {
      console.log('\n⚠️  CONFIRMED: CSRF validation is failing!');
      console.log('   The frontend is NOT sending the x-csrf-token header.');
    }
  } catch (error) {
    console.log(`Network error: ${error.message}`);
    console.log('(This is expected if the server is not running locally)');
  }

  // Test 2: Try to get CSRF token first
  console.log('\n2. GETTING CSRF TOKEN FROM /api/csrf');
  console.log('-'.repeat(40));

  try {
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`, {
      method: 'GET',
    });

    const csrfData = await csrfResponse.json();
    console.log(`Status: ${csrfResponse.status}`);
    console.log(`Response: ${JSON.stringify(csrfData, null, 2)}`);

    if (csrfData.token) {
      console.log('\n3. TEST WITH CSRF TOKEN');
      console.log('-'.repeat(40));

      const submitWithCSRF = await fetch(`${BASE_URL}/api/survey/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfData.token,
          'Cookie': `csrf_token=${csrfData.token}`,
        },
        body: JSON.stringify({
          ...payload,
          sessionId: crypto.randomUUID(), // New session to avoid duplicate
          anonymousId: crypto.randomUUID(),
        }),
      });

      const submitData = await submitWithCSRF.json();
      console.log(`Status: ${submitWithCSRF.status}`);
      console.log(`Response: ${JSON.stringify(submitData, null, 2)}`);

      if (submitWithCSRF.status === 201) {
        console.log('\n✓ SUCCESS: Submission works WITH CSRF token!');
      }
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSIS');
  console.log('='.repeat(60));
  console.log(`
THE ISSUE:
The frontend (SurveyContainer.tsx) submits to /api/survey/submit
WITHOUT including the x-csrf-token header.

The server validates CSRF and rejects the request with:
  403: { error: "CSRF validation failed", details: "Missing CSRF token" }

But the frontend only checks for:
  if (response.status === 403 && data.code) { ... }

The CSRF error has no 'code' property, so the error is SILENTLY IGNORED
and the survey proceeds to feedback without saving the response!

FIX:
1. Add CSRF token handling to the frontend submit call, OR
2. Disable CSRF validation for this endpoint (not recommended), OR
3. Use a different validation mechanism
`);
}

testSubmit().catch(console.error);
