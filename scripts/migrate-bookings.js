require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  console.log('🔄 Running Bookings & Notifications Migration...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL missing. Set it in .env');
    process.exit(1);
  }

  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'bookings-notifications-migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await client.query(sql);
    console.log('✅ Migration completed!');
    console.log('   - bookings table created');
    console.log('   - notifications table created');
    console.log('   - RLS policies applied');

    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
