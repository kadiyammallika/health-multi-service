require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    const userId = 'c5bd3b6b-7309-4e39-87f6-517c9f7210ed';

    // Check all profiles for this user
    const admin = await pool.query('SELECT user_id FROM admin_accounts WHERE user_id = $1', [userId]);
    const provider = await pool.query('SELECT user_id, application_status, services FROM provider_profiles WHERE user_id = $1', [userId]);
    const customer = await pool.query('SELECT user_id FROM customer_profiles WHERE user_id = $1', [userId]);

    console.log('Admin:', admin.rows.length > 0 ? 'YES' : 'NO');
    console.log('Provider:', provider.rows.length > 0 ? 'YES' : 'NO', JSON.stringify(provider.rows));
    console.log('Customer:', customer.rows.length > 0 ? 'YES' : 'NO');

    // Check what service_types are used in listings
    const types = await pool.query("SELECT DISTINCT service_type FROM provider_listings WHERE provider_id = $1", [userId]);
    console.log('Service types in listings:', types.rows.map(r => r.service_type));

    // Check if services column has the right values
    if (provider.rows.length > 0) {
      const services = provider.rows[0].services;
      console.log('Provider services:', services);
      console.log('Services type:', typeof services, Array.isArray(services));
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
})();
