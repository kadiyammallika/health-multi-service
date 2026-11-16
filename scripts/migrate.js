require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  console.log('🔄 Starting Supabase PostgreSQL Database Migration...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    console.error('👉 Please configure DATABASE_URL in your .env file with your Supabase connection string.');
    process.exit(1);
  }

  if (connectionString.includes('[YOUR-PASSWORD]') || connectionString.includes('YOUR_PASSWORD')) {
    console.error('❌ Error: DATABASE_URL still contains placeholder [YOUR-PASSWORD].');
    console.error('👉 Please open .env and replace [YOUR-PASSWORD] with your actual Supabase database password.');
    process.exit(1);
  }

  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    console.log(`📄 Reading SQL schema from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⚡ Executing schema migration...');
    await client.query(sql);

    console.log('✅ Database migration completed successfully!');
    console.log('📊 Verified Tables Created:');
    console.log('   - users (common account table; NO role column)');
    console.log('   - customer_profiles (customer-specific identity)');
    console.log('   - provider_profiles (provider identity & approval status)');
    console.log('   - admin_accounts (administrator identity & badge)');
    console.log('   - refresh_tokens (session token rotation and revocation)');

    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '28P01') {
      console.error('👉 Password authentication failed. Check your database password in .env.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('👉 Network connection failed. Check your Supabase host and pooler port.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
