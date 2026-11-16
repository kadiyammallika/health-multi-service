#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('Starting admin booking and currency migration...\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'admin-booking-currency-migration.sql');

    if (!fs.existsSync(migrationPath)) {
      console.error(`ERROR: Migration file not found at ${migrationPath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
    console.log(`[INFO] Read migration file: ${migrationPath}`);
    console.log(`[INFO] Migration file size: ${sqlContent.length} bytes\n`);

    // Execute the migration
    console.log('[PROGRESS] Executing migration SQL...');
    await client.query(sqlContent);
    console.log('[SUCCESS] Migration SQL executed successfully\n');

    // Verify the migration by checking if columns exist
    console.log('[PROGRESS] Verifying migration...');
    const checkQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      AND column_name IN (
        'admin_approval_status',
        'approved_by',
        'approval_timestamp',
        'rejection_reason',
        'email_notification_status',
        'display_currency',
        'exchange_rate',
        'original_currency'
      )
      ORDER BY column_name;
    `;
    const result = await client.query(checkQuery);

    console.log(`[INFO] Verified ${result.rows.length} new columns added to bookings table:`);
    result.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.column_name}`);
    });
    console.log();

    // Check if email_logs table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'email_logs'
      ) as exists;
    `;
    const tableResult = await client.query(tableCheckQuery);

    if (tableResult.rows[0].exists) {
      console.log('[INFO] email_logs table created successfully');

      // Get table structure
      const structureQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'email_logs'
        ORDER BY ordinal_position;
      `;
      const structureResult = await client.query(structureQuery);
      console.log('[INFO] email_logs table structure:');
      structureResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('[WARNING] email_logs table was not created');
    }
    console.log();

    // Check updated booking counts
    console.log('[PROGRESS] Checking updated bookings...');
    const statusCheckQuery = `
      SELECT admin_approval_status, COUNT(*) as count
      FROM bookings
      WHERE admin_approval_status IS NOT NULL
      GROUP BY admin_approval_status
      ORDER BY admin_approval_status;
    `;
    const statusResult = await client.query(statusCheckQuery);

    console.log('[INFO] Booking approval status distribution:');
    statusResult.rows.forEach((row) => {
      console.log(`  ${row.admin_approval_status}: ${row.count} bookings`);
    });
    console.log();

    console.log('[SUCCESS] Migration completed successfully!');
    console.log('\nMigration Summary:');
    console.log('  - Added 8 new columns to bookings table');
    console.log('  - Created email_logs table with indexes');
    console.log('  - Updated existing bookings with approval status');
    console.log(`  - Total bookings with approval status: ${statusResult.rows.reduce((sum, r) => sum + parseInt(r.count), 0)}`);

  } catch (error) {
    console.error('[ERROR] Migration failed:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch((error) => {
  console.error('[FATAL] Unexpected error:', error);
  process.exit(1);
});
