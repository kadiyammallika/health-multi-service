// Approve all pending provider profiles
require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Show current status
    const before = await pool.query(`SELECT user_id, business_name, application_status FROM provider_profiles`);
    console.log('Current provider profiles:');
    before.rows.forEach(r => console.log(`  ${r.business_name} - ${r.application_status}`));

    // Approve all pending
    const result = await pool.query(
      `UPDATE provider_profiles SET application_status = 'approved' WHERE application_status = 'pending' RETURNING user_id, business_name`
    );

    if (result.rows.length > 0) {
      console.log(`\nApproved ${result.rows.length} provider(s):`);
      result.rows.forEach(r => console.log(`  ✓ ${r.business_name}`));
    } else {
      console.log('\nNo pending providers to approve.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
