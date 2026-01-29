#!/usr/bin/env node
/**
 * Test the local submission flow with CSRF
 */

import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';

async function test() {
  console.log('1. Getting CSRF token...');

  const csrfRes = await fetch(BASE_URL + '/api/csrf');
  if (!csrfRes.ok) {
    const text = await csrfRes.text();
    console.log('CSRF failed:', csrfRes.status, text);
    return;
  }

  const { token } = await csrfRes.json();
  console.log('   Got token:', token.substring(0, 20) + '...');

  console.log('2. Submitting survey...');

  const submitRes = await fetch(BASE_URL + '/api/survey/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token,
      'Cookie': 'csrf_token=' + token,
    },
    body: JSON.stringify({
      sessionId: crypto.randomUUID(),
      answers: { q1: 'test', q2: 3, religiosity_prayer: 4 },
      metadata: { language: 'fr' },
      consentGiven: true,
      consentVersion: '1.0',
      anonymousId: crypto.randomUUID(),
      fingerprint: 'test-' + Date.now(),
      emailHash: crypto.createHash('sha256').update('e2e-test-' + Date.now() + '@test.com').digest('hex'),
    }),
  });

  const data = await submitRes.json();
  console.log('   Status:', submitRes.status);
  console.log('   Response:', JSON.stringify(data, null, 2));

  if (submitRes.status === 201 && data.responseId) {
    console.log('\n✓ SUCCESS! Survey submission is working!');
    console.log('   Response ID:', data.responseId);
  } else {
    console.log('\n✗ FAILED:', data.error || 'Unknown error');
  }
}

test().catch(console.error);
