#!/usr/bin/env node
/**
 * Migration Runner Script
 * Runs SQL migrations against Supabase using the service role key
 *
 * Usage: node scripts/run-migration.mjs [migration-file]
 *
 * NOTE: This script is NOT committed to git (scripts/ is for local use only)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Run: source .env.local && node scripts/run-migration.mjs');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Get migration file from args or default to security hardening
const migrationFile = process.argv[2] || join(__dirname, '../supabase/migrations/005_security_hardening.sql');

console.log(`Reading migration: ${migrationFile}`);
const sql = readFileSync(migrationFile, 'utf-8');

// Split SQL into individual statements (basic splitting - handles most cases)
function splitStatements(sql) {
  // Remove comments and split by semicolons (handling $$ blocks)
  const statements = [];
  let current = '';
  let inDollarBlock = false;

  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comment-only lines
    if (trimmed.startsWith('--') && !inDollarBlock) {
      continue;
    }

    current += line + '\n';

    // Track $$ blocks (function bodies)
    const dollarMatches = line.match(/\$\$/g);
    if (dollarMatches) {
      const count = dollarMatches.length;
      if (count % 2 === 1) {
        inDollarBlock = !inDollarBlock;
      }
    }

    // If we hit a semicolon and we're not in a $$ block, that's end of statement
    if (!inDollarBlock && trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt && stmt !== ';') {
        statements.push(stmt);
      }
      current = '';
    }
  }

  // Add any remaining content
  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function runMigration() {
  console.log('\n🚀 Starting migration...\n');

  const statements = splitStatements(sql);
  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // Extract first line for logging
    const firstLine = stmt.split('\n')[0].substring(0, 60);
    process.stdout.write(`[${i + 1}/${statements.length}] ${firstLine}... `);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });

      if (error) {
        // Try direct execution via REST API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ sql_query: stmt }),
        });

        if (!response.ok) {
          throw new Error(error.message || 'Execution failed');
        }
      }

      console.log('✅');
      successCount++;
    } catch (err) {
      console.log('❌');
      console.error(`   Error: ${err.message}`);
      errorCount++;

      // Continue on non-critical errors (like "already exists")
      if (!err.message.includes('already exists') &&
          !err.message.includes('duplicate key') &&
          !err.message.includes('does not exist')) {
        // For critical errors, ask to continue
        if (errorCount >= 3) {
          console.error('\n⚠️  Multiple errors encountered. Stopping.');
          break;
        }
      }
    }
  }

  console.log(`\n📊 Migration complete: ${successCount} succeeded, ${errorCount} failed\n`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

runMigration().catch(console.error);
