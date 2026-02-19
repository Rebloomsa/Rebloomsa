/**
 * Create the social_posts table in Supabase.
 * Uses the Supabase Management API v1 SQL endpoint.
 * Requires SUPABASE_ACCESS_TOKEN (personal access token) or falls back to
 * direct DB password via psql.
 *
 * If neither is available, prints instructions for manual SQL execution.
 *
 * Run: node scripts/create-social-posts-table.cjs
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const { execSync } = require('child_process');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL ? SUPABASE_URL.replace('https://', '').replace('.supabase.co', '') : null;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

const sqlPath = path.resolve(__dirname, '../supabase/migrations/20260219_social_posts.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

async function viaManagementAPI() {
  if (!ACCESS_TOKEN || !PROJECT_REF) return false;

  console.log('Trying Supabase Management API...');
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.log(`Management API error (${res.status}): ${text}`);
    return false;
  }

  console.log('SQL executed via Management API!');
  return true;
}

function viaPsql() {
  const connStr = DATABASE_URL ||
    (DB_PASSWORD ? `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres` : null);

  if (!connStr) return false;

  console.log('Trying psql...');
  try {
    execSync(`psql "${connStr}" -f "${sqlPath}"`, { stdio: 'inherit' });
    console.log('SQL executed via psql!');
    return true;
  } catch (err) {
    console.log('psql failed:', err.message);
    return false;
  }
}

async function verify() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Force schema cache refresh by waiting briefly
  await new Promise(r => setTimeout(r, 2000));

  const { data, error } = await supabase.from('social_posts').select('id').limit(1);
  if (error) {
    console.error('\nVerification failed:', error.message);
    return false;
  }
  console.log('\nsocial_posts table verified! Rows:', (data || []).length);
  return true;
}

async function main() {
  console.log(`Project ref: ${PROJECT_REF}`);
  console.log('Creating social_posts table...\n');

  // Try methods in order
  const success = await viaManagementAPI() || viaPsql();

  if (success) {
    await verify();
    return;
  }

  // If nothing worked, print manual instructions
  console.log('\n====================================');
  console.log('AUTOMATIC EXECUTION NOT AVAILABLE');
  console.log('====================================\n');
  console.log('No SUPABASE_ACCESS_TOKEN, DATABASE_URL, or SUPABASE_DB_PASSWORD found.\n');
  console.log('Please run the SQL manually:');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql');
  console.log('2. Paste the contents of: ' + sqlPath);
  console.log('3. Click "Run"\n');
  console.log('Or add one of these to your .env:');
  console.log('  SUPABASE_ACCESS_TOKEN=sbp_xxx  (from https://supabase.com/dashboard/account/tokens)');
  console.log('  DATABASE_URL=postgresql://...    (from Project Settings → Database)');
  console.log('  SUPABASE_DB_PASSWORD=xxx         (your database password)');
  process.exit(1);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
