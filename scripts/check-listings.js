require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    // Find the provider user
    const userRes = await pool.query("SELECT id, email FROM users WHERE email = 'mallireddy9171@gmail.com'");
    console.log('User:', JSON.stringify(userRes.rows));

    if (userRes.rows.length === 0) {
      console.log('User not found!');
      pool.end();
      return;
    }

    const userId = userRes.rows[0].id;
    console.log('User ID:', userId);

    // Check provider profile
    const provRes = await pool.query("SELECT user_id, application_status, services FROM provider_profiles WHERE user_id = $1", [userId]);
    console.log('Provider profile:', JSON.stringify(provRes.rows));

    // Check listings for this provider - check both title and details->name
    const listRes = await pool.query("SELECT id, provider_id, service_type, status, title, details->>'name' as detail_name FROM provider_listings WHERE provider_id = $1", [userId]);
    console.log('Listings for this provider:', listRes.rows.length);
    listRes.rows.forEach(r => console.log(`  - ${r.service_type}: title="${r.title}" detail_name="${r.detail_name}" status=${r.status}`));

    // Check total listings
    const totalRes = await pool.query("SELECT COUNT(*) as total FROM provider_listings");
    console.log('Total listings in DB:', totalRes.rows[0].total);

    // Check all provider IDs in listings
    const provIds = await pool.query("SELECT DISTINCT provider_id FROM provider_listings");
    console.log('Distinct provider IDs in listings:', provIds.rows.map(r => r.provider_id));

    // Check columns
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'provider_listings' ORDER BY ordinal_position");
    console.log('Columns:', cols.rows.map(r => r.column_name).join(', '));

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
}

check();
