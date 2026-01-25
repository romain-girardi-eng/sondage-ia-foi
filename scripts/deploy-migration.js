#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Deploy the submission tracking migration to Supabase
 *
 * Usage:
 *   SUPABASE_DB_URL="postgresql://..." node scripts/deploy-migration.js
 *
 * Get your database URL from: Supabase Dashboard > Settings > Database > Connection string > URI
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const MIGRATION_FILE = path.join(__dirname, '..', 'supabase', 'migrations', '003_submission_tracking.sql');

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🚀 Deploying submission tracking migration...\n');

  // Check if migration file exists
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('❌ Migration file not found:', MIGRATION_FILE);
    process.exit(1);
  }

  // Get database URL
  let dbUrl = process.env.SUPABASE_DB_URL;

  if (!dbUrl) {
    console.log('📋 To get your database URL:');
    console.log('   1. Go to https://supabase.com/dashboard/project/urpjfwxijmzbzctxvtlf/settings/database');
    console.log('   2. Scroll to "Connection string"');
    console.log('   3. Select "URI" tab');
    console.log('   4. Copy the connection string (starts with postgresql://)\n');

    dbUrl = await prompt('Enter your Supabase database URL: ');
  }

  if (!dbUrl || !dbUrl.startsWith('postgresql://')) {
    console.error('❌ Invalid database URL. Must start with postgresql://');
    process.exit(1);
  }

  // Read migration SQL
  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

  console.log('\n📄 Connecting to database...');

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📄 Running migration...\n');
    await client.query(sql);

    console.log('✅ Migration deployed successfully!\n');
    console.log('The following was created:');
    console.log('  ✓ submission_tracking table');
    console.log('  ✓ check_submission_allowed() function');
    console.log('  ✓ record_submission_attempt() function');
    console.log('  ✓ Indexes for fast duplicate lookups');
    console.log('  ✓ Row Level Security policies\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Some objects already exist - this may be okay if you ran the migration before.');
    } else {
      console.log('\n📝 Alternative: Copy the SQL from supabase/migrations/003_submission_tracking.sql');
      console.log('and run it in the Supabase SQL Editor at:');
      console.log('https://supabase.com/dashboard/project/urpjfwxijmzbzctxvtlf/sql/new');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
