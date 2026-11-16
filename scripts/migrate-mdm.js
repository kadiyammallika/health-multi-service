require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMDMMigration() {
  console.log('🔄 Starting MDM (Master Data Management) Migration...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  if (connectionString.includes('[YOUR-PASSWORD]') || connectionString.includes('YOUR_PASSWORD')) {
    console.error('❌ Error: DATABASE_URL still contains placeholder password.');
    process.exit(1);
  }

  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'mdm-migration.sql');
    console.log(`📄 Reading MDM migration from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⚡ Executing MDM migration...');
    await client.query(sql);

    console.log('✅ MDM Migration completed successfully!');
    console.log('📊 Tables Created/Updated:');
    console.log('   - master_airlines (Airlines Master Data)');
    console.log('   - master_airports (Airports Master Data)');
    console.log('   - master_aircraft (Aircraft Master Data)');

    // Verify seed data
    const airlines = await client.query('SELECT COUNT(*) FROM master_airlines');
    const airports = await client.query('SELECT COUNT(*) FROM master_airports');
    const aircraft = await client.query('SELECT COUNT(*) FROM master_aircraft');
    console.log(`\n📦 Seed Data Summary:`);
    console.log(`   - Airlines: ${airlines.rows[0].count} records`);
    console.log(`   - Airports: ${airports.rows[0].count} records`);
    console.log(`   - Aircraft: ${aircraft.rows[0].count} records`);

    client.release();
  } catch (error) {
    console.error('❌ MDM Migration failed:', error.message);
    if (error.code === '28P01') {
      console.error('👉 Password authentication failed.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('👉 Network connection failed.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMDMMigration();
