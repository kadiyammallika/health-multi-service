const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const client = await pool.connect();
  try {
    await client.query(
      "ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb"
    );
    console.log('Added services column to provider_profiles');

    // Update existing providers to have their category mapped as a service
    const existing = await client.query('SELECT id, category FROM provider_profiles');
    for (const row of existing.rows) {
      const serviceMap = {
        travel: ['flights'],
        bus: ['buses'],
        hotel: ['hotels'],
        wellness: ['wellness'],
        property: ['properties']
      };
      const services = serviceMap[row.category] || [row.category];
      await client.query(
        'UPDATE provider_profiles SET services = $1 WHERE id = $2',
        [JSON.stringify(services), row.id]
      );
    }
    console.log('Updated', existing.rows.length, 'existing providers with services');

    const check = await client.query('SELECT id, business_name, category, services FROM provider_profiles LIMIT 5');
    console.log('Current providers:', JSON.stringify(check.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
})();
